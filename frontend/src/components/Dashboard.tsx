
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  Heart,
  Leaf,
  LogOut,
  MessageCircle,
  UserRound,
} from "lucide-react";
import type { UserProfile } from "../types/profile";

interface DashboardProps {
  profile: UserProfile;
  onExit: () => void;
}

function formatLabel(value: string): string {
  const labels: Record<string, string> = {
    non_vegetarian: "Non-Vegetarian",
    vegetarian: "Vegetarian",
    omnivore: "Omnivore",
muscle_gain_fat_loss: "Muscle Gain + Fat Loss",
muscle_gain_weight_gain: "Muscle Gain + Weight Gain",
    healthy: "No Listed Condition",
    diabetes: "Diabetes",
    thyroid: "Thyroid Condition",
    pcos: "PCOD / PCOS",
    weight_loss: "Weight Loss",
    weight_gain: "Weight Gain",
    muscle_gain: "Muscle Gain",
    basic: "Basic",
    medium: "Medium",
    intense: "Intense",
  };

  return labels[value] ?? value;
}

export default function Dashboard({
  profile,
  onExit,
}: DashboardProps) {
  const heightMetres = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightMetres ** 2);

  const isAdult = profile.age >= 18;

  const bmiCategory = !isAdult
    ? "Requires age-specific assessment"
    : bmi < 18.5
      ? "Underweight"
      : bmi < 25
        ? "Healthy range"
        : bmi < 30
          ? "Overweight"
          : "Obesity range";

  const summaryCards = [
    {
      title: "Body Mass Index",
      value: bmi.toFixed(1),
      unit: "kg/m²",
      icon: Activity,
      note: bmiCategory,
    },
    {
      title: "Daily Calories",
      value: "—",
      unit: "kcal",
      icon: ChartNoAxesCombined,
      note: "Awaiting nutrition assessment",
    },
    {
      title: "Daily Protein Target",
      value: "—",
      unit: "grams",
      icon: Heart,
      note: "Awaiting nutrition assessment",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAF6] text-[#183B2D]">
      <header className="flex items-center justify-between border-b border-green-100 bg-white px-5 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <Leaf className="text-green-700" size={27} />
          <h1 className="text-2xl font-bold">NutriAI</h1>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
        >
          <LogOut size={17} />
          <span>Exit Dashboard</span>
        </button>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 p-5 md:p-10 lg:grid-cols-[240px_1fr]">
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
            <div className="flex items-center gap-3 rounded-xl bg-green-100 px-4 py-3 font-semibold text-green-900">
              <Activity size={18} />
              Overview
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-500">
              <CalendarDays size={18} />
              Weekly Meal Plan
              <span className="ml-auto text-xs">Soon</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-500">
              <ChartNoAxesCombined size={18} />
              Nutrition Calculator
              <span className="ml-auto text-xs">Soon</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-500">
              <MessageCircle size={18} />
              Diet Assistant
              <span className="ml-auto text-xs">Soon</span>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 space-y-8">
          <section>
            <p className="text-sm font-medium text-green-700">
              YOUR PERSONALIZED NUTRITION SPACE
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Welcome to Your Dashboard
            </h2>

            <p className="mt-3 text-gray-600">
              Review your profile and nutritional information.
              Your meal planning tools will appear here.
            </p>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 inline-flex rounded-xl bg-green-50 p-3">
                    <Icon className="text-green-700" size={23} />
                  </div>

                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {card.value}
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

          <section className="rounded-3xl border border-green-100 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <UserRound className="text-green-700" />
              <h3 className="text-xl font-semibold">
                Your Profile Summary
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Age", `${profile.age} years`],
                ["Sex", formatLabel(profile.sex)],
                ["Height", `${profile.heightCm} cm`],
                ["Weight", `${profile.weightKg} kg`],
                ["Diet", formatLabel(profile.dietPreference)],
                ["Health", formatLabel(profile.healthCondition)],
                ["Goal", formatLabel(profile.fitnessGoal)],
                ["Activity", formatLabel(profile.activityLevel)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#F6FAF6] p-4"
                >
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-2 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-[#E7F3E9] p-7 md:p-9">
            <div className="flex items-start gap-4">
              <CalendarDays
                className="shrink-0 text-green-800"
                size={29}
              />

              <div>
                <h3 className="text-xl font-bold">
                  Your Weekly Diet Planner
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  This section will generate a seven-day South
                  Indian meal timetable using your nutritional
                  requirements, food preferences and dietary
                  constraints.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-800">
                  Coming in the next development phase
                  <ArrowRight size={17} />
                </div>
              </div>
            </div>
          </section>

          <p className="text-xs leading-6 text-gray-500">
            BMI is a screening measurement, not a diagnosis.
            For users under 18, BMI must be interpreted using
            age- and sex-specific references. Nutritional targets
            will be calculated by the backend in a later step.
          </p>
        </main>
      </div>
    </div>
  );
}
