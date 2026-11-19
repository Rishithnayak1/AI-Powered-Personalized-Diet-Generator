
from fastapi import APIRouter, HTTPException, Query
from food_loader import get_foods, load_health_rules

router = APIRouter()


@router.get("/api/foods")
def list_foods(
    food_category: str | None = Query(default=None),
    diet_type: str | None = Query(default=None),
):
    try:
        foods = get_foods(
            food_category=food_category,
            diet_type=diet_type
        )

        return {
            "success": True,
            "total": len(foods),
            "foods": foods
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except (FileNotFoundError, OSError) as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to load the food datasets"
        )


@router.get("/api/health-rules/{condition}")
def list_health_rules(condition: str):
    try:
        rules = load_health_rules(condition)

        return {
            "success": True,
            "condition": condition,
            "total": len(rules),
            "rules": rules
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except (FileNotFoundError, OSError):
        raise HTTPException(
            status_code=500,
            detail="Unable to load health guidance"
        )
