from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI(title="NutriAI Nutrition API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class UserProfile(BaseModel):
    age: int = Field(ge=8, le=60)
    sex: Literal["male", "female"]
    heightCm: float = Field(ge=80, le=250)
    weightKg: float = Field(ge=15, le=300)
    dietPreference: Literal["vegetarian", "non_vegetarian", "omnivore"]
    healthCondition: Literal["healthy", "diabetes", "thyroid", "pcos"]
    fitnessGoal: Literal[
        "weight_loss", "weight_gain", "muscle_gain",
        "muscle_gain_fat_loss", "muscle_gain_weight_gain"
    ]
    activityLevel: Literal["basic", "medium", "intense"]


@app.get("/")
def home():
    return {"application": "NutriAI", "status": "running"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.post("/api/nutrition/assess")
def assess_nutrition(profile: UserProfile):
    bmi = profile.weightKg / ((profile.heightCm / 100) ** 2)

    if profile.age < 18:
        return {
            "bmi": round(bmi, 1),
            "bmiCategory": "Age-specific assessment required",
            "bmr": None,
            "tdee": None,
            "dailyCalories": None,
            "proteinGrams": None,
            "carbsGrams": None,
            "fatsGrams": None,
            "calculationStatus": "age_specific_review_required",
            "notes": [
                "BMI requires age- and sex-specific interpretation.",
                "Adult calorie formulas are not applied below age 18."
            ]
        }

    if profile.age < 20:
        category = "Age-specific assessment required"
    elif bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Healthy range"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obesity range"

    bmr = (
        10 * profile.weightKg
        + 6.25 * profile.heightCm
        - 5 * profile.age
        + (5 if profile.sex == "male" else -161)
    )

    activity_factors = {
        "basic": 1.2,
        "medium": 1.55,
        "intense": 1.725
    }

    goal_factors = {
        "weight_loss": 0.90,
        "weight_gain": 1.10,
        "muscle_gain": 1.05,
        "muscle_gain_fat_loss": 1.00,
        "muscle_gain_weight_gain": 1.10
    }

    tdee = bmr * activity_factors[profile.activityLevel]
    goal_factor = goal_factors[profile.fitnessGoal]

    notes = [
        "These values are preliminary estimates, not medical advice.",
        "Activity and goal factors are initial planning assumptions."
    ]

    if profile.fitnessGoal == "weight_loss" and bmi < 18.5:
        goal_factor = 1.0
        notes.append("No calorie deficit assigned at BMI below 18.5.")

    calories = round(tdee * goal_factor)

    muscle_goals = {
        "muscle_gain",
        "muscle_gain_fat_loss",
        "muscle_gain_weight_gain"
    }

    protein = round(
        profile.weightKg
        * (1.6 if profile.fitnessGoal in muscle_goals else 1.2)
    )

    fats = round(calories * 0.25 / 9)
    remaining = calories - protein * 4 - fats * 9

    if remaining < 0:
        return {
            "bmi": round(bmi, 1),
            "bmiCategory": category,
            "bmr": round(bmr, 1),
            "tdee": round(tdee, 1),
            "dailyCalories": None,
            "proteinGrams": None,
            "carbsGrams": None,
            "fatsGrams": None,
            "calculationStatus": "review_required",
            "notes": notes + ["Macronutrient allocation requires review."]
        }

    if profile.healthCondition != "healthy":
        notes.append(
            "Condition-specific nutritional adjustments are not yet implemented."
        )

    return {
        "bmi": round(bmi, 1),
        "bmiCategory": category,
        "bmr": round(bmr, 1),
        "tdee": round(tdee, 1),
        "dailyCalories": calories,
        "proteinGrams": protein,
        "carbsGrams": round(remaining / 4),
        "fatsGrams": fats,
        "calculationStatus": "estimated",
        "notes": notes
    }
from food_routes import router as food_router
app.include_router(food_router)
from meal_plan_routes import router as meal_plan_router
app.include_router(meal_plan_router)
from personalized_plan_routes import router as personalized_router
app.include_router(personalized_router)