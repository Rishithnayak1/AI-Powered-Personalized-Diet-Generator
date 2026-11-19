
import type { UserProfile } from "../types/profile";

export interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fibre: number;
}

export interface PlannedMeal {
  meal: string;
  food_id: string;
  food_item: string;
  diet_type: string;
  portion_g: number;
  ingredients: string;
  nutrition: MealNutrition;
  health_warnings: Array<{
    action: string;
    reason: string;
    rule_id: string;
  }>;
}

export interface PersonalizedPlanResponse {
  success: boolean;
  message: string;

  assessment: {
    bmr: number;
    tdee: number;
    activity_level: string;
    activity_factor: number;
    goal: string;
    goal_adjustment_percent: number;
    target_calories: number;
    target_protein: number;
  };

  plan: {
    diet_type: string;
    condition: string;
    days: Array<{
      day: string;
      meals: PlannedMeal[];
      totals: MealNutrition;
    }>;

    summary: {
      total_meals: number;
      vegetarian_meals: number;
      nonvegetarian_meals: number;
      maximum_food_repetitions: number;
    };

    disclaimer?: string;
  };

  notices: string[];
}

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function generatePersonalizedPlan(
  profile: UserProfile,
  signal?: AbortSignal
): Promise<PersonalizedPlanResponse> {

  // Use values entered by the user during onboarding.
  const payload = {
    age: Number(profile.age),
    sex: profile.sex,
    height_cm: Number(profile.heightCm),
    weight_kg: Number(profile.weightKg),
    activity_level: profile.activityLevel,
    goal: profile.fitnessGoal,
    diet_type: profile.dietPreference,
    condition: profile.healthCondition,
  };

  const response = await fetch(
    `${API_URL}/api/personalized-plan/generate`,
    {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : `Unable to generate meal plan (HTTP ${response.status})`
    );
  }

  const data: PersonalizedPlanResponse =
    await response.json();

  if (!data.success || !Array.isArray(data.plan?.days)) {
    throw new Error("Invalid meal plan response from backend.");
  }

  return data;
}
