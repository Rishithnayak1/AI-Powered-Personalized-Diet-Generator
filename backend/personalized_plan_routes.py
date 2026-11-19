
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from meal_planner import build_weekly_plan

router = APIRouter()


# Predefined activity multipliers
ACTIVITY_FACTORS = {
    "basic": 1.20,
    "medium": 1.55,
    "intense": 1.725,
}

# Adult goal adjustments relative to estimated TDEE
GOAL_ADJUSTMENTS = {
    "weight_loss": -0.15,
    "weight_gain": 0.10,
    "muscle_gain": 0.05,
    "muscle_gain_fat_loss": 0.00,
    "muscle_gain_weight_gain": 0.10,
}

# Initial adult protein targets (g per kg of body weight)
PROTEIN_FACTORS = {
    "weight_loss": 1.2,
    "weight_gain": 1.2,
    "muscle_gain": 1.6,
    "muscle_gain_fat_loss": 1.6,
    "muscle_gain_weight_gain": 1.6,
}


class UserProfile(BaseModel):
    age: int = Field(ge=8, le=60)
    sex: str
    height_cm: float = Field(gt=0, le=250)
    weight_kg: float = Field(gt=0, le=350)

    activity_level: str
    goal: str
    diet_type: str
    condition: str = "healthy"


def normalize_value(value):
    return value.strip().lower().replace("-", "_").replace(" ", "_")


def calculate_nutrition(profile):
    age = profile.age
    sex = normalize_value(profile.sex)
    activity = normalize_value(profile.activity_level)
    goal = normalize_value(profile.goal)

    if sex not in ("male", "female"):
        raise ValueError("Sex must be male or female")

    if activity not in ACTIVITY_FACTORS:
        raise ValueError("Invalid activity level")

    if goal not in GOAL_ADJUSTMENTS:
        raise ValueError("Invalid fitness goal")

    if age < 18:
        raise ValueError(
            "Users under 18 need age-specific nutrition "
            "assessment. Adult calorie cutting or surplus "
            "rules cannot be applied."
        )

    # Mifflin-St Jeor equation for adults
    bmr = (
        10 * profile.weight_kg
        + 6.25 * profile.height_cm
        - 5 * age
        + (5 if sex == "male" else -161)
    )

    # Activity-adjusted maintenance calories
    tdee = bmr * ACTIVITY_FACTORS[activity]

    # Apply goal adjustment
    adjustment = GOAL_ADJUSTMENTS[goal]
    daily_calories = round(tdee * (1 + adjustment))

    # Initial protein target
    daily_protein = round(
        profile.weight_kg * PROTEIN_FACTORS[goal], 1
    )

    # Guard against unusually low or high targets.
    # These bounds are software safety checks,
    # not individualized clinical prescriptions.
    if daily_calories < 1200 or daily_calories > 6000:
        raise ValueError(
            "Calculated calorie target is outside "
            "the supported range and needs review."
        )

    return {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "activity_level": activity,
        "activity_factor": ACTIVITY_FACTORS[activity],
        "goal": goal,
        "goal_adjustment_percent": round(
            adjustment * 100, 1
        ),
        "target_calories": daily_calories,
        "target_protein": daily_protein,
    }


@router.post("/api/personalized-plan/generate")
def generate_personalized_plan(profile: UserProfile):
    try:
        assessment = calculate_nutrition(profile)

        diet_aliases = {
            "vegetarian": "veg",
            "veg": "veg",
            "non_vegetarian": "nonveg",
            "non_veg": "nonveg",
            "nonveg": "nonveg",
            "omnivore": "omnivore",
        }

        condition_aliases = {
            "healthy": "healthy",
            "diabetic": "diabetes",
            "diabetes": "diabetes",
            "thyroid": "thyroid",
            "pcod": "pcos",
            "pcos": "pcos",
            "pcod/pcos": "pcos",
            "pcos/pcod": "pcos",
        }

        diet = diet_aliases.get(
            normalize_value(profile.diet_type)
        )

        condition = condition_aliases.get(
            normalize_value(profile.condition)
        )

        if diet is None:
            raise ValueError("Invalid dietary preference")

        if condition is None:
            raise ValueError("Invalid health condition")

        plan = build_weekly_plan(
            diet_type=diet,
            condition=condition,
            target_calories=assessment["target_calories"],
            target_protein=assessment["target_protein"],
        )

        notices = [
            "Nutritional values are development estimates.",
            "Activity and goal adjustments are configurable "
            "adult starting estimates, not prescriptions.",
            "The planner does not guarantee that every "
            "daily nutrition target is reached.",
        ]

        if condition != "healthy":
            notices.append(
                "Condition-related guidance is preliminary. "
                "Medication, allergies and individual clinical "
                "requirements need separate review."
            )

        return {
            "success": True,
            "message": "Personalized weekly plan generated",
            "assessment": assessment,
            "plan": plan,
            "notices": notices,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )
