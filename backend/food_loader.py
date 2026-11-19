
import csv
from pathlib import Path

DATASET_DIR = Path(__file__).resolve().parent.parent / "datasets"

MEALS = ("breakfast", "lunch", "snacks", "dinner")
DIETS = ("veg", "nonveg")

NUTRIENTS = (
    "calories_per_100g",
    "protein_per_100g",
    "carbs_per_100g",
    "fats_per_100g",
    "fibre_per_100g",
)

REQUIRED_COLUMNS = {
    "food_id", "food_item", "food_category",
    "ingredients", "preparation_method",
    *NUTRIENTS,
}


def load_foods():
    """Load all eight food CSVs into one reusable catalog."""
    foods = []
    seen_ids = set()

    for diet in DIETS:
        for meal in MEALS:
            path = DATASET_DIR / f"{diet}_{meal}.csv"

            if not path.is_file():
                raise FileNotFoundError(
                    f"Missing dataset: {path}"
                )

            with path.open(
                encoding="utf-8-sig", newline=""
            ) as file:
                reader = csv.DictReader(file)
                columns = set(reader.fieldnames or [])

                missing = REQUIRED_COLUMNS - columns
                if missing:
                    raise ValueError(
                        f"{path.name} missing: {sorted(missing)}"
                    )

                for row in reader:
                    food_id = row["food_id"].strip()

                    if not food_id or food_id in seen_ids:
                        raise ValueError(
                            f"Invalid or duplicate food ID: {food_id}"
                        )

                    seen_ids.add(food_id)

                    food = {
                        "food_id": food_id,
                        "food_item": row["food_item"].strip(),
                        "food_category": meal,
                        "diet_type": diet,
                        "ingredients": row["ingredients"].strip(),
                        "preparation_method":
                            row["preparation_method"].strip(),
                    }

                    for nutrient in NUTRIENTS:
                        food[nutrient] = float(row[nutrient])

                    foods.append(food)

    return foods


def get_foods(food_category=None, diet_type=None):
    """Filter the common catalog by meal and diet."""
    foods = load_foods()

    if food_category:
        food_category = food_category.lower().strip()
        if food_category not in MEALS:
            raise ValueError("Invalid food category")

        foods = [
            food for food in foods
            if food["food_category"] == food_category
        ]

    if diet_type:
        diet_type = diet_type.lower().strip()

        if diet_type not in ("veg", "nonveg", "omnivore"):
            raise ValueError("Invalid diet type")

        if diet_type != "omnivore":
            foods = [
                food for food in foods
                if food["diet_type"] == diet_type
            ]

    return foods


def load_health_rules(condition):
    """Read guidance rules; do not automatically ban foods."""
    filenames = {
        "diabetes": "diabetes_guidance.csv",
        "thyroid": "thyroid_guidance.csv",
        "pcos": "pcos_guidance.csv",
        "pcod": "pcos_guidance.csv",
    }

    condition = condition.lower().strip()

    if condition == "healthy":
        return []

    if condition not in filenames:
        raise ValueError("Unknown health condition")

    path = DATASET_DIR / filenames[condition]

    with path.open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


if __name__ == "__main__":
    all_foods = load_foods()

    print("NutriAI Dataset Loader")
    print("----------------------")
    print(f"Total food records: {len(all_foods)}")

    for meal in MEALS:
        veg_count = len(get_foods(meal, "veg"))
        nonveg_count = len(get_foods(meal, "nonveg"))
        print(f"{meal}: {veg_count} veg, {nonveg_count} nonveg")

    print("\nExample:")
    print(get_foods("breakfast", "veg")[0]["food_item"])

    print("\nHealth guidance:")
    for condition in ("diabetes", "thyroid", "pcos"):
        print(condition, len(load_health_rules(condition)))
