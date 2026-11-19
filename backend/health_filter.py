
import re
from food_loader import get_foods, load_health_rules


TAG_PATTERNS = {
    "added_sugar": [
        r"\bsugar\b",
        r"\bjaggery\b",
        r"\bhoney\b",
        r"\bsyrup\b",
    ],
    "white_rice": [
        r"(?<!brown )(?<!red )\bwhite rice\b",
        r"(?<!brown )(?<!red )\brice \(dry\)",
    ],
    "rice": [
        r"\brice\b",
        r"\bidli\b",
        r"\bputtu\b",
    ],
    "deep_fried": [
        r"\bdeep.fried\b",
        r"\bdeep.frying\b",
    ],
    "soy": [
        r"\bsoy\b",
        r"\bsoya\b",
        r"\btofu\b",
    ],
    "dairy": [
        r"\bmilk\b",
        r"\bcurd\b",
        r"\byogurt\b",
        r"\bpaneer\b",
    ],
    "millet": [
        r"\bmillet\b",
        r"\bragi\b",
        r"\bjowar\b",
        r"\bbajra\b",
    ],
    "whole_pulses": [
        r"\bgreen gram\b",
        r"\bchickpeas?\b",
        r"\bhorse gram\b",
        r"\bwhole pulses?\b",
        r"\bbeans?\b",
    ],
    "whole_fruit": [
        r"\bwhole fruit\b",
        r"\bapple\b",
        r"\bguava\b",
        r"\bpapaya\b",
    ],
    "animal_protein": [
        r"\begg\b",
        r"\bfish\b",
        r"\bchicken\b",
    ],
    "vegetable": [
        r"\bvegetables?\b",
        r"\bcarrot\b",
        r"\btomato\b",
        r"\bspinach\b",
    ],
    "gluten": [
        r"\bwheat\b",
        r"\bbarley\b",
        r"\bchapati\b",
    ],
    "cruciferous_vegetable": [
        r"\bcabbage\b",
        r"\bcauliflower\b",
        r"\bbroccoli\b",
    ],
}


def matches_tag(food, tag):
    """Match identifiable food ingredients and methods."""

    patterns = TAG_PATTERNS.get(tag, [])

    if not patterns:
        return False

    text = " ".join([
        food.get("food_item", ""),
        food.get("ingredients", ""),
        food.get("preparation_method", ""),
    ]).lower()

    return any(
        re.search(pattern, text)
        for pattern in patterns
    )


def filter_foods(
    condition="healthy",
    diet_type="omnivore",
    food_category=None,
):
    """
    Filter foods using existing guidance CSVs.

    EXCLUDE_DEFAULT: exclude matching food.
    Other actions: retain food and attach guidance.
    """

    condition = condition.strip().lower()

    foods = get_foods(
        food_category=food_category,
        diet_type=diet_type,
    )

    rules = load_health_rules(condition)

    eligible = []
    excluded = []

    for original in foods:
        food = original.copy()

        warnings = []
        exclusion_reasons = []

        for rule in rules:
            tag = rule.get("match_tag", "").strip()
            action = rule.get("action", "").strip().upper()
            reason = rule.get("reason", "").strip()

            # Do not invent matches for unknown tags.
            if not matches_tag(food, tag):
                continue

            if action == "EXCLUDE_DEFAULT":
                exclusion_reasons.append(reason or tag)

            elif action in {
                "LIMIT",
                "PORTION_REVIEW",
                "PAIR_WITH_PROTEIN_FIBRE",
                "MEDICATION_TIMING_REVIEW",
                "CLINICIAN_REVIEW",
            }:
                warnings.append({
                    "action": action,
                    "reason": reason,
                    "rule_id": rule.get("rule_id", ""),
                })

            # ALLOW and NO_AUTO_EXCLUSION do not ban foods.

        if exclusion_reasons:
            food["exclusion_reasons"] = list(
                dict.fromkeys(exclusion_reasons)
            )
            excluded.append(food)
        else:
            food["health_warnings"] = warnings
            eligible.append(food)

    return {
        "condition": condition,
        "diet_type": diet_type,
        "food_category": food_category,
        "total_checked": len(foods),
        "total_eligible": len(eligible),
        "total_excluded": len(excluded),
        "eligible_foods": eligible,
        "excluded_foods": excluded,
        "note": (
            "Guidance-based preliminary filtering only. "
            "Not an individualized medical assessment."
        ),
    }


if __name__ == "__main__":
    print("NutriAI Health Filter Test")
    print("--------------------------")

    for condition in (
        "healthy",
        "diabetes",
        "thyroid",
        "pcos",
    ):
        result = filter_foods(condition=condition)

        print(
            f"{condition}: "
            f"{result['total_eligible']} eligible, "
            f"{result['total_excluded']} excluded"
        )

