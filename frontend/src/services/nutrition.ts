
import type { UserProfile } from "../types/profile";

export interface NutritionAssessment {
  bmi: number;
  bmiCategory: string;
  bmr: number | null;
  tdee: number | null;
  dailyCalories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatsGrams: number | null;
  calculationStatus: string;
  notes: string[];
}

const API_URL = "http://127.0.0.1:8000";

export async function assessNutrition(
  profile: UserProfile,
  signal?: AbortSignal
): Promise<NutritionAssessment> {
  console.log("Sending nutrition profile to FastAPI...");

  const response = await fetch(
    `${API_URL}/api/nutrition/assess`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `FastAPI returned status ${response.status}`
    );
  }

  const data: NutritionAssessment = await response.json();

  console.log("Nutrition assessment received:", data);

  return data;
}
