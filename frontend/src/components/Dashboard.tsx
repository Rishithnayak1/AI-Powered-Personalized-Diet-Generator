
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChartNoAxesCombined,
  Heart,
  Leaf,
  LogOut,
  MessageCircle,
  UserRound,
  RefreshCw,
} from "lucide-react";

import type { UserProfile } from "../types/profile";

import {
  assessNutrition,
  type NutritionAssessment,
} from "../services/nutrition";

import {
  generatePersonalizedPlan,
  type PersonalizedPlanResponse,
} from "../services/personalizedPlan";

interface DashboardProps {
  profile: UserProfile;
  onExit: () => void;
}

type DashboardTab = "overview" | "weekly";

function label(value: string): string {
  const labels: Record<string, string> = {
    male: "Male",
    female: "Female",
    vegetarian: "Vegetarian",
    veg: "Vegetarian",
    non_vegetarian: "Non-Vegetarian",
    nonveg: "Non-Vegetarian",
    omnivore: "Omnivore",
    healthy: "No Listed Condition",
    diabetes: "Diabetes",
    thyroid: "Thyroid Condition",
    pcos: "PCOD / PCOS",
    weight_loss: "Weight Loss",
    weight_gain: "Weight Gain",
    muscle_gain: "Muscle Gain",
    muscle_gain_fat_loss: "Muscle Gain + Fat Loss",
    muscle_gain_weight_gain: "Muscle Gain + Weight Gain",
    basic: "Basic",
    medium: "Medium",
    intense: "Intense",
    breakfast: "Breakfast",
    lunch: "Lunch",
    snacks: "Snacks",
    dinner: "Dinner",
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

function number(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value === undefined || value === null) {
    return "—";
  }

  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function Dashboard({
  profile,
  onExit,
}: DashboardProps) {

  const [assessment, setAssessment] =
    useState<NutritionAssessment | null>(null);

  const [personalized, setPersonalized] =
    useState<PersonalizedPlanResponse | null>(null);

  const [assessmentLoading, setAssessmentLoading] =
    useState(true);

  const [planLoading, setPlanLoading] =
    useState(true);

  const [assessmentError, setAssessmentError] =
    useState<string | null>(null);

  const [planError, setPlanError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");

  const [selectedDay, setSelectedDay] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Both APIs receive the current user's onboarding profile.
  useEffect(() => {
    const controller = new AbortController();

    setAssessmentLoading(true);
    setPlanLoading(true);
    setAssessment(null);
    setPersonalized(null);
    setAssessmentError(null);
    setPlanError(null);

    assessNutrition(profile, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setAssessment(data);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAssessmentError(
            error instanceof Error
              ? error.message
              : "Unable to calculate nutrition assessment."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setAssessmentLoading(false);
        }
      });

    generatePersonalizedPlan(profile, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setPersonalized(data);
          setSelectedDay(0);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setPlanError(
            error instanceof Error
              ? error.message
              : "Unable to generate weekly meal plan."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setPlanLoading(false);
        }
      });

    return () => controller.abort();
  }, [profile, retryCount]);

  function retry(): void {
    setRetryCount((previous) => previous + 1);
  }

  const calculated = personalized?.assessment;
  const days = personalized?.plan.days ?? [];
  const activeDay = days[selectedDay];

  const summaryCards = [
    {
      title: "Body Mass Index",
      value: assessment?.bmi,
      decimals: 1,
      unit: "kg/m²",
      icon: Activity,
      note: assessment?.bmiCategory ?? "Estimated BMI",
    },
    {
      title: "Basal Metabolic Rate",
      value: calculated?.bmr ?? assessment?.bmr,
      decimals: 0,
      unit: "kcal/day",
      icon: Heart,
      note: "Estimated resting energy",
    },
    {
      title: "Total Daily Energy Expenditure",
      value: calculated?.tdee ?? assessment?.tdee,
      decimals: 0,
      unit: "kcal/day",
      icon: ChartNoAxesCombined,
      note: "Adjusted for your activity level",
    },
    {
      title: "Daily Calorie Target",
      value:
        calculated?.target_calories ??
        assessment?.dailyCalories,
      decimals: 0,
      unit: "kcal/day",
      icon: Activity,
      note: "Goal-adjusted calorie requirement",
    },
  ];

  const profileDetails = [
    ["Age", `${profile.age} years`],
    ["Sex", label(profile.sex)],
    ["Height", `${profile.heightCm} cm`],
    ["Weight", `${profile.weightKg} kg`],
    ["Diet", label(profile.dietPreference)],
    ["Health", label(profile.healthCondition)],
    ["Goal", label(profile.fitnessGoal)],
    ["Activity", label(profile.activityLevel)],
  ];

  const macroCards = [
    {
      title: "Protein",
      value:
        calculated?.target_protein ??
        assessment?.proteinGrams,
    },
    {
      title: "Carbohydrates",
      value: assessment?.carbsGrams,
    },
    {
      title: "Fats",
      value: assessment?.fatsGrams,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAF6] text-[#183B2D]">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-green-100 bg-white px-5 py-5 md:px-10">

        <div className="flex items-center gap-2">
          <Leaf size={27} className="text-green-700" />
          <h1 className="text-2xl font-bold">
            Poshika
          </h1>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
        >
          <LogOut size={17} />
          Exit Dashboard
        </button>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 p-5 md:p-10 lg:grid-cols-[240px_1fr]">

        {/* Sidebar */}
        <aside className="rounded-3xl border border-green-100 bg-white p-5 lg:self-start">

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">

            <div className="rounded-full bg-green-100 p-3">
              <UserRound className="text-green-800" />
            </div>

            <div>
              <p className="font-semibold">My Nutrition</p>
              <p className="text-sm text-gray-500">
                Personal Dashboard
              </p>
            </div>
          </div>

          <nav className="grid gap-2 text-sm">

            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left ${
                activeTab === "overview"
                  ? "bg-green-100 font-semibold text-green-900"
                  : "text-gray-600 hover:bg-green-50"
              }`}
            >
              <Activity size={18} />
              Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("weekly")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left ${
                activeTab === "weekly"
                  ? "bg-green-100 font-semibold text-green-900"
                  : "text-gray-600 hover:bg-green-50"
              }`}
            >
              <CalendarDays size={18} />
              Weekly Meal Plan
            </button>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-400">
              <ChartNoAxesCombined size={18} />
              Nutrition Calculator
              <span className="ml-auto text-xs">Soon</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-400">
              <MessageCircle size={18} />
              Diet Assistant
              <span className="ml-auto text-xs">Soon</span>
            </div>

          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 space-y-8">

          <section>
            <p className="text-sm font-medium text-green-700">
              YOUR PERSONALIZED NUTRITION SPACE
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {activeTab === "overview"
                ? "Welcome to Your Dashboard"
                : "Your Weekly Meal Plan"}
            </h2>

            <p className="mt-3 text-gray-600">
              {activeTab === "overview"
                ? "Your nutritional requirements based on your profile, activity level and fitness goal."
                : "Your seven-day South Indian meal timetable generated from your own constraints."}
            </p>
          </section>

          {/* Loading State */}
          {(assessmentLoading || planLoading) && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white p-5 text-green-800"
            >
              <RefreshCw className="animate-spin" size={19} />
              Calculating your personalized nutrition plan...
            </div>
          )}

          {/* Assessment Error */}
          {assessmentError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5"
            >
              <p className="font-semibold text-red-800">
                Nutrition assessment error
              </p>
              <p className="mt-2 text-sm text-red-700">
                {assessmentError}
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 rounded-full bg-red-800 px-5 py-2 text-sm text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Meal Plan Error */}
          {planError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5"
            >
              <p className="font-semibold text-red-800">
                Unable to generate weekly meal plan
              </p>
              <p className="mt-2 text-sm text-red-700">
                {planError}
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 rounded-full bg-red-800 px-5 py-2 text-sm text-white"
              >
                Retry Generation
              </button>
            </div>
          )}

          {activeTab === "overview" ? (
            <>
              {/* Nutrition Summary Cards */}
              <section className="grid gap-5 sm:grid-cols-2">

                {summaryCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.title}
                      className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-5 inline-flex rounded-xl bg-green-50 p-3">
                        <Icon
                          size={23}
                          className="text-green-700"
                        />
                      </div>

                      <p className="text-sm text-gray-500">
                        {card.title}
                      </p>

                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl font-bold">
                          {number(card.value, card.decimals)}
                        </span>

                        <span className="text-sm text-gray-500">
                          {card.unit}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-gray-500">
                        {card.note}
                      </p>
                    </article>
                  );
                })}

              </section>

              {/* Macronutrient Targets */}
              <section className="rounded-3xl border border-green-100 bg-white p-6 md:p-8">

                <h3 className="text-xl font-semibold">
                  Daily Macronutrient Targets
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Estimated nutrition targets based on your profile.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">

                  {macroCards.map((macro) => (
                    <div
                      key={macro.title}
                      className="rounded-2xl bg-[#F1F8F1] p-5"
                    >
                      <p className="text-sm text-gray-600">
                        {macro.title}
                      </p>

                      <p className="mt-3 text-2xl font-bold">
                        {number(macro.value)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        g/day
                      </p>
                    </div>
                  ))}

                </div>

                {assessment && calculated &&
  ((
    assessment.dailyCalories !== null &&
    Math.abs(
      assessment.dailyCalories -
      calculated.target_calories
    ) > 1
  ) ||
  (
    assessment.proteinGrams !== null &&
    Math.abs(
      assessment.proteinGrams -
      calculated.target_protein
    ) > 1
  )) && (
                    <p className="mt-4 text-xs text-amber-800">
                      The existing nutrition assessment and
                      personalized planner use slightly different
                      calculation rules. The displayed calorie
                      and protein targets come from the planner.
                      Carbohydrate and fat targets currently
                      come from the original assessment.
                    </p>
                  )}
              </section>

              {/* Assessment Notes */}
              {assessment && (
                <section className="rounded-3xl border border-green-100 bg-white p-6">

                  <h3 className="font-semibold">
                    Nutrition Assessment Notes
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Status: {assessment.calculationStatus}
                  </p>

                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
                    {assessment.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>

                </section>
              )}

              {/* Profile Summary */}
              <section className="rounded-3xl border border-green-100 bg-white p-6 md:p-8">

                <div className="mb-6 flex items-center gap-3">
                  <UserRound className="text-green-700" />
                  <h3 className="text-xl font-semibold">
                    Your Profile Summary
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  {profileDetails.map(([name, value]) => (
                    <div
                      key={name}
                      className="rounded-2xl bg-[#F6FAF6] p-4"
                    >
                      <p className="text-sm text-gray-500">
                        {name}
                      </p>

                      <p className="mt-2 font-semibold">
                        {value}
                      </p>
                    </div>
                  ))}

                </div>
              </section>

              {/* Weekly Plan Shortcut */}
              <section className="rounded-3xl bg-[#E7F3E9] p-7 md:p-9">

                <div className="flex items-start gap-4">
                  <CalendarDays
                    size={29}
                    className="shrink-0 text-green-800"
                  />

                  <div>
                    <h3 className="text-xl font-bold">
                      Your Weekly Diet Planner
                    </h3>

                    <p className="mt-3 leading-7 text-gray-600">
                      {personalized
                        ? `Your seven-day meal plan contains ${personalized.plan.summary.total_meals} meals selected for your profile.`
                        : "Your personalized timetable is generated using your dietary preferences, activity and nutrition requirements."}
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveTab("weekly")}
                      className="mt-5 rounded-full bg-[#245C40] px-6 py-3 font-semibold text-white hover:bg-[#194A32]"
                    >
                      View Weekly Meal Plan
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Personalized Targets */}
              {personalized && (
                <section className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-2xl border border-green-100 bg-white p-5">
                    <p className="text-sm text-gray-500">
                      Daily calorie target
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {number(calculated?.target_calories)} kcal
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-100 bg-white p-5">
                    <p className="text-sm text-gray-500">
                      Daily protein target
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {number(calculated?.target_protein)} g
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-100 bg-white p-5">
                    <p className="text-sm text-gray-500">
                      Total weekly meals
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {personalized.plan.summary.total_meals}
                    </p>
                  </div>

                </section>
              )}

              {/* Select Days */}
              {days.length > 0 && (
                <>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Select weekday"
                  >
                    {days.map((day, index) => (
                      <button
                        key={day.day}
                        type="button"
                        onClick={() => setSelectedDay(index)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          selectedDay === index
                            ? "bg-[#245C40] text-white"
                            : "border border-green-200 bg-white text-green-900 hover:bg-green-50"
                        }`}
                      >
                        {day.day}
                      </button>
                    ))}
                  </div>

                  {/* Meals for the selected day */}
                  {activeDay && (
                    <section className="space-y-5">

                      <h3 className="text-xl font-bold">
                        {activeDay.day}'s Meals
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">

                        {activeDay.meals.map((meal) => (
                          <article
                            key={`${activeDay.day}-${meal.meal}-${meal.food_id}`}
                            className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
                          >

                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">
                                {label(meal.meal)}
                              </span>

                              <span className="text-xs text-gray-500">
                                {label(meal.diet_type)}
                              </span>
                            </div>

                            <h4 className="text-lg font-bold">
                              {meal.food_item}
                            </h4>

                            <p className="mt-2 text-sm text-gray-500">
                              Serving: {number(meal.portion_g)} g
                              {" • "}Fixed by planner
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#F1F8F1] p-4 text-sm">

                              <p>
                                <strong>
                                  {number(meal.nutrition.calories)}
                                </strong>{" "}
                                kcal
                              </p>

                              <p>
                                <strong>
                                  {number(meal.nutrition.protein, 1)}
                                </strong>{" "}
                                g protein
                              </p>

                              <p>
                                <strong>
                                  {number(meal.nutrition.carbs, 1)}
                                </strong>{" "}
                                g carbs
                              </p>

                              <p>
                                <strong>
                                  {number(meal.nutrition.fats, 1)}
                                </strong>{" "}
                                g fats
                              </p>

                              <p>
                                <strong>
                                  {number(meal.nutrition.fibre, 1)}
                                </strong>{" "}
                                g fibre
                              </p>
                            </div>

                            <p className="mt-4 text-sm font-semibold">
                              Ingredients
                            </p>

                            <p className="mt-1 break-words text-sm leading-6 text-gray-600">
                              {meal.ingredients}
                            </p>

                            {meal.health_warnings.length > 0 && (
                              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">

                                {Array.from(
                                  new Set(
                                    meal.health_warnings.map(
                                      (warning) =>
                                        warning.reason ||
                                        warning.action
                                    )
                                  )
                                ).map((warning) => (
                                  <p key={warning}>
                                    {warning}
                                  </p>
                                ))}
                              </div>
                            )}

                          </article>
                        ))}

                      </div>

                      {/* Daily Nutrition Totals */}
                      <div className="rounded-3xl border border-green-100 bg-white p-6">

                        <h4 className="text-lg font-semibold">
                          {activeDay.day} — Daily Nutrition Totals
                        </h4>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">

                          {[
                            [
                              "Calories",
                              `${number(activeDay.totals.calories)} kcal`,
                            ],
                            [
                              "Protein",
                              `${number(activeDay.totals.protein, 1)} g`,
                            ],
                            [
                              "Carbs",
                              `${number(activeDay.totals.carbs, 1)} g`,
                            ],
                            [
                              "Fats",
                              `${number(activeDay.totals.fats, 1)} g`,
                            ],
                            [
                              "Fibre",
                              `${number(activeDay.totals.fibre, 1)} g`,
                            ],
                          ].map(([title, value]) => (
                            <div key={title}>
                              <p className="text-gray-500">
                                {title}
                              </p>

                              <p className="mt-1 font-semibold">
                                {value}
                              </p>
                            </div>
                          ))}

                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}

              {!planLoading && !personalized && !planError && (
                <div className="rounded-2xl border border-green-100 bg-white p-6 text-gray-600">
                  No weekly plan is available for this profile.
                </div>
              )}
            </>
          )}

          {/* Backend Notices */}
          {personalized &&
            personalized.notices.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 text-xs leading-6 text-gray-600">

                {personalized.notices.map((notice, index) => (
                  <p key={index}>{notice}</p>
                ))}

              </div>
            )}

          <p className="text-xs leading-6 text-gray-500">
            Poshika uses preliminary nutritional estimates.
            This application is not a substitute for medical
            advice. Users under 18 require age-specific
            assessment, and health conditions may require
            professional dietary guidance.
          </p>

        </main>
      </div>
    </div>
  );
}
