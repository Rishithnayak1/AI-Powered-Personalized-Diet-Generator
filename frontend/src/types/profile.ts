
export type DietPreference =
  | "vegetarian"
  | "non_vegetarian"
  | "omnivore";

export type HealthCondition =
  | "healthy"
  | "diabetes"
  | "thyroid"
  | "pcos";

export type FitnessGoal =
  | "weight_loss"
  | "weight_gain"
  | "muscle_gain"
  | "muscle_gain_fat_loss"
  | "muscle_gain_weight_gain";

export type ActivityLevel =
  | "basic"
  | "medium"
  | "intense";

export interface UserProfile {
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  dietPreference: DietPreference;
  healthCondition: HealthCondition;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
}
