
import random
import re
from collections import Counter
from health_filter import filter_foods


DAYS = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday", "Sunday"
]

MEALS = ("breakfast", "lunch", "snacks", "dinner")

MEAL_SHARES = {
    "breakfast": 0.25,
    "lunch": 0.35,
    "snacks": 0.15,
    "dinner": 0.25,
}

NUTRIENTS = {
    "calories": "calories_per_100g",
    "protein": "protein_per_100g",
    "carbs": "carbs_per_100g",
    "fats": "fats_per_100g",
    "fibre": "fibre_per_100g",
}

# Development serving ranges in grams
PORTIONS = {
    "breakfast": (100, 400),
    "lunch": (150, 450),
    "snacks": (75, 250),
    "dinner": (150, 400),
}

# Equivalent dishes must share one repetition count.
FOOD_ALIASES = {
    "puttu with kadala curry": "kadala curry with puttu",
    "kadala curry with puttu": "kadala curry with puttu",
}


def food_key(food):
    """
    Return a consistent identity for equivalent dishes.
    Used for daily and weekly repetition checks.
    """
    name = food["food_item"].lower().strip()
    name = re.sub(r"[^a-z0-9]+", " ", name).strip()

    return FOOD_ALIASES.get(name, name)


def nutrients_for_portion(food, grams):
    """Calculate estimated nutrients for a serving."""
    factor = grams / 100.0

    return {
        name: round(float(food[column]) * factor, 1)
        for name, column in NUTRIENTS.items()
    }


def choose_portion(food, meal, target_calories):
    """Choose an approximate portion for the meal target."""
    energy = float(food["calories_per_100g"])

    if energy <= 0:
        raise ValueError(
            f"Invalid calories for {food['food_item']}"
        )

    minimum, maximum = PORTIONS[meal]

    proposed = (target_calories / energy) * 100
    grams = round(proposed / 25) * 25

    return max(minimum, min(maximum, grams))


def validate_plan(weekly_plan, diet_type):
    """
    Enforce:
    1. Four meals every day.
    2. No equivalent dish twice in one day.
    3. No equivalent dish more than 3 times weekly.
    4. Omnivore balance: 2 veg + 2 nonveg daily.
    """
    weekly_counts = Counter()
    veg_total = 0
    nonveg_total = 0

    for day in weekly_plan:
        meals = day["meals"]

        if len(meals) != 4:
            raise AssertionError(
                f"{day['day']} must have 4 meals"
            )

        keys = [food_key(food) for food in meals]

        if len(keys) != len(set(keys)):
            raise AssertionError(
                f"Duplicate food on {day['day']}"
            )

        weekly_counts.update(keys)

        veg_today = sum(
            food["diet_type"] == "veg"
            for food in meals
        )

        nonveg_today = sum(
            food["diet_type"] == "nonveg"
            for food in meals
        )

        veg_total += veg_today
        nonveg_total += nonveg_today

        if diet_type == "omnivore":
            if veg_today != 2 or nonveg_today != 2:
                raise AssertionError(
                    f"Omnivore balance failed on {day['day']}"
                )

    if any(count > 3 for count in weekly_counts.values()):
        raise AssertionError(
            "A food exceeded 3 appearances per week"
        )

    if diet_type == "omnivore":
        if veg_total != 14 or nonveg_total != 14:
            raise AssertionError(
                "Weekly omnivore balance failed"
            )

    return {
        "total_meals": sum(
            len(day["meals"]) for day in weekly_plan
        ),
        "vegetarian_meals": veg_total,
        "nonvegetarian_meals": nonveg_total,
        "maximum_food_repetitions": max(
            weekly_counts.values(), default=0
        ),
    }


def build_weekly_plan(
    diet_type="omnivore",
    condition="healthy",
    target_calories=2000,
    target_protein=None,
    seed=42,
):
    """
    Generate a seven-day South Indian meal plan.

    Nutritional values are development estimates.
    This is a heuristic demonstration planner.
    """

    diet_type = diet_type.lower().strip()
    condition = condition.lower().strip()

    if diet_type not in ("veg", "nonveg", "omnivore"):
        raise ValueError("Invalid dietary preference")

    if target_calories <= 0:
        raise ValueError("Calories must be positive")

    if target_protein is not None and target_protein <= 0:
        raise ValueError("Protein target must be positive")

    # Load foods after health-aware filtering
    result = filter_foods(
        condition=condition,
        diet_type=diet_type,
    )

    catalog = result["eligible_foods"]

    food_groups = {
        (meal, diet): []
        for meal in MEALS
        for diet in ("veg", "nonveg")
    }

    for food in catalog:
        key = (
            food["food_category"],
            food["diet_type"],
        )

        if key in food_groups:
            food_groups[key].append(food)

    rng = random.Random(seed)
    weekly_counts = Counter()
    weekly_plan = []

    for day_index, day_name in enumerate(DAYS):

        today_used = set()
        day_meals = []

        daily_totals = {
            nutrient: 0.0
            for nutrient in NUTRIENTS
        }

        # Omnivore: exactly two vegetarian
        # and two non-vegetarian meals daily.
        if diet_type == "omnivore":
            patterns = [
                ("veg", "nonveg", "veg", "nonveg"),
                ("nonveg", "veg", "nonveg", "veg"),
                ("veg", "nonveg", "nonveg", "veg"),
                ("nonveg", "veg", "veg", "nonveg"),
            ]

            daily_diets = patterns[
                day_index % len(patterns)
            ]
        else:
            daily_diets = (diet_type,) * 4

        for meal, required_diet in zip(
            MEALS, daily_diets
        ):

            available = [
                food
                for food in food_groups[
                    (meal, required_diet)
                ]
                if food_key(food) not in today_used
                and weekly_counts[food_key(food)] < 3
                and float(
                    food["calories_per_100g"]
                ) > 0
            ]

            if not available:
                raise ValueError(
                    f"No eligible {required_diet} food "
                    f"for {meal} on {day_name}"
                )

            meal_target = (
                target_calories * MEAL_SHARES[meal]
            )

            rng.shuffle(available)
            scored = []

            for food in available:

                grams = choose_portion(
                    food, meal, meal_target
                )

                nutrition = nutrients_for_portion(
                    food, grams
                )

                calorie_gap = (
                    abs(nutrition["calories"] - meal_target)
                    / meal_target
                )

                protein_gap = 0.0

                if target_protein is not None:
                    protein_target = (
                        target_protein
                        * MEAL_SHARES[meal]
                    )

                    protein_gap = (
                        max(
                            0,
                            protein_target
                            - nutrition["protein"]
                        )
                        / protein_target
                    )

                repetition_penalty = (
                    weekly_counts[food_key(food)] * 0.15
                )

                score = (
                    calorie_gap
                    + 0.30 * protein_gap
                    + repetition_penalty
                )

                scored.append(
                    (score, food, grams, nutrition)
                )

            _, selected, grams, nutrition = min(
                scored,
                key=lambda item: item[0]
            )

            selected_key = food_key(selected)

            today_used.add(selected_key)
            weekly_counts[selected_key] += 1

            day_meals.append({
                "meal": meal,
                "food_id": selected["food_id"],
                "food_item": selected["food_item"],
                "diet_type": selected["diet_type"],
                "portion_g": grams,
                "ingredients": selected["ingredients"],
                "nutrition": nutrition,
                "health_warnings": selected.get(
                    "health_warnings", []
                ),
            })

            for nutrient in NUTRIENTS:
                daily_totals[nutrient] += (
                    nutrition[nutrient]
                )

        weekly_plan.append({
            "day": day_name,
            "meals": day_meals,
            "totals": {
                key: round(value, 1)
                for key, value in daily_totals.items()
            },
        })

    # Final validation of all hard rules
    summary = validate_plan(
        weekly_plan, diet_type
    )

    return {
        "diet_type": diet_type,
        "condition": condition,
        "target_calories": target_calories,
        "target_protein": target_protein,
        "days": weekly_plan,
        "summary": summary,
        "disclaimer": (
            "Development meal plan using estimated "
            "nutritional values. Not a medically "
            "validated diet prescription."
        ),
    }


if __name__ == "__main__":

    plan = build_weekly_plan(
        diet_type="omnivore",
        condition="healthy",
        target_calories=2000,
        target_protein=100,
    )

    print("NutriAI - Seven-Day Meal Planner")
    print("--------------------------------")

    for day in plan["days"]:
        print(f"\n{day['day']}")

        for food in day["meals"]:
            print(
                f"  {food['meal'].title()}: "
                f"{food['food_item']} "
                f"({food['portion_g']} g)"
            )

        print(
            "  Daily nutrition:",
            day["totals"]
        )

    print(
        "\nWeekly summary:",
        plan["summary"]
    )
