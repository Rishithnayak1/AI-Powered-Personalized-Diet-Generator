
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from meal_planner import build_weekly_plan

router = APIRouter()


class MealPlanRequest(BaseModel):
    diet_type: str = "omnivore"
    condition: str = "healthy"
    target_calories: float = Field(gt=0, le=10000)
    target_protein: float | None = Field(
        default=None, gt=0, le=1000
    )


def normalize_diet(value: str) -> str:
    value = value.strip().lower().replace("-", "_")

    aliases = {
        "vegetarian": "veg",
        "veg": "veg",
        "non_vegetarian": "nonveg",
        "nonveg": "nonveg",
        "non_veg": "nonveg",
        "omnivore": "omnivore",
    }

    if value not in aliases:
        raise HTTPException(
            status_code=400,
            detail="Invalid dietary preference"
        )

    return aliases[value]


def normalize_condition(value: str) -> str:
    value = value.strip().lower().replace(" ", "")

    aliases = {
        "healthy": "healthy",
        "diabetes": "diabetes",
        "diabetic": "diabetes",
        "thyroid": "thyroid",
        "pcos": "pcos",
        "pcod": "pcos",
        "pcod/pcos": "pcos",
        "pcos/pcod": "pcos",
    }

    if value not in aliases:
        raise HTTPException(
            status_code=400,
            detail="Invalid health condition"
        )

    return aliases[value]


@router.post("/api/meal-plan/generate")
def generate_meal_plan(request: MealPlanRequest):
    diet_type = normalize_diet(request.diet_type)
    condition = normalize_condition(request.condition)

    try:
        plan = build_weekly_plan(
            diet_type=diet_type,
            condition=condition,
            target_calories=request.target_calories,
            target_protein=request.target_protein,
        )

        return {
            "success": True,
            "message": "Weekly meal plan generated",
            "plan": plan,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except (FileNotFoundError, OSError):
        raise HTTPException(
            status_code=500,
            detail="Unable to read the nutrition datasets"
        )

