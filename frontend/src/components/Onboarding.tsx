
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { UserProfile } from "../types/profile";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

type ProfileDraft = {
  [K in keyof UserProfile]: UserProfile[K] | "";
};

const initialProfile: ProfileDraft = {
  age: "",
  sex: "",
  heightCm: "",
  weightKg: "",
  dietPreference: "",
  healthCondition: "",
  fitnessGoal: "",
  activityLevel: "",
};

const steps = [
  "Personal Details",
  "Body Measurements",
  "Diet Preference",
  "Health Condition",
  "Fitness Goal",
  "Activity Level",
] as const;

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-green-700 bg-green-50 text-green-900"
          : "border-gray-200 bg-white hover:border-green-400"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        {label}
        {selected && <Check size={18} />}
      </span>
    </button>
  );
}

export default function Onboarding({
  onComplete,
  onBack,
}: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] =
    useState<ProfileDraft>(initialProfile);
  const [error, setError] = useState("");

  function update<K extends keyof UserProfile>(
    field: K,
    value: ProfileDraft[K]
  ) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  }

  function isStepValid(): boolean {
    switch (step) {
      case 0:
        return (
          typeof profile.age === "number" &&
          Number.isInteger(profile.age) &&
          profile.age >= 8 &&
          profile.age <= 60 &&
          profile.sex !== ""
        );

      case 1:
        return (
          typeof profile.heightCm === "number" &&
          Number.isFinite(profile.heightCm) &&
          profile.heightCm >= 80 &&
          profile.heightCm <= 250 &&
          typeof profile.weightKg === "number" &&
          Number.isFinite(profile.weightKg) &&
          profile.weightKg >= 15 &&
          profile.weightKg <= 300
        );

      case 2:
        return profile.dietPreference !== "";

      case 3:
        return profile.healthCondition !== "";

      case 4:
        return profile.fitnessGoal !== "";

      case 5:
        return profile.activityLevel !== "";

      default:
        return false;
    }
  }

  function next() {
    if (!isStepValid()) {
      setError("Please complete this step with valid details.");
      return;
    }

    if (step < steps.length - 1) {
      setStep((previous) => previous + 1);
      setError("");
      return;
    }

    if (
      profile.age === "" ||
      profile.sex === "" ||
      profile.heightCm === "" ||
      profile.weightKg === "" ||
      profile.dietPreference === "" ||
      profile.healthCondition === "" ||
      profile.fitnessGoal === "" ||
      profile.activityLevel === ""
    ) {
      setError("Your profile is incomplete.");
      return;
    }

    onComplete({
      age: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      dietPreference: profile.dietPreference,
      healthCondition: profile.healthCondition,
      fitnessGoal: profile.fitnessGoal,
      activityLevel: profile.activityLevel,
    });
  }

  function previous() {
    if (step === 0) {
      onBack();
    } else {
      setStep((current) => current - 1);
      setError("");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FAF5] px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-green-700">
            STEP {step + 1} OF {steps.length}
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-green-100">
            <div
              className="h-full rounded-full bg-green-700 transition-all"
              style={{
                width: `${((step + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-green-950">
          {steps[step]}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Help NutriAI understand your nutritional preferences.
        </p>

        <div className="mt-8 space-y-5">
          {step === 0 && (
            <>
              <label className="block">
                <span className="mb-2 block font-medium">
                  Your age (8–60)
                </span>

                <input
                  type="number"
                  min={8}
                  max={60}
                  step={1}
                  value={profile.age}
                  onChange={(event) =>
                    update(
                      "age",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-700"
                  placeholder="Enter your age"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                {(["male", "female"] as const).map((sex) => (
                  <ChoiceButton
                    key={sex}
                    label={sex === "male" ? "Male" : "Female"}
                    selected={profile.sex === sex}
                    onClick={() => update("sex", sex)}
                  />
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <label className="block">
                <span className="mb-2 block font-medium">
                  Height (cm)
                </span>

                <input
                  type="number"
                  min={80}
                  max={250}
                  value={profile.heightCm}
                  onChange={(event) =>
                    update(
                      "heightCm",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 p-3"
                  placeholder="Example: 175"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-medium">
                  Weight (kg)
                </span>

                <input
                  type="number"
                  min={15}
                  max={300}
                  step="0.1"
                  value={profile.weightKg}
                  onChange={(event) =>
                    update(
                      "weightKg",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 p-3"
                  placeholder="Example: 68"
                />
              </label>
            </>
          )}

          {/* Updated dietary preferences */}
          {step === 2 && (
            <div className="grid gap-3">
              {(
                [
                  ["vegetarian", "Vegetarian"],
                  ["non_vegetarian", "Non-Vegetarian"],
                  [
                    "omnivore",
                    "Omnivore (Vegetarian + Non-Vegetarian)",
                  ],
                ] as const
              ).map(([value, label]) => (
                <ChoiceButton
                  key={value}
                  label={label}
                  selected={profile.dietPreference === value}
                  onClick={() => update("dietPreference", value)}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3">
              {(
                [
                  ["healthy", "No listed health condition"],
                  ["diabetes", "Diabetes"],
                  ["thyroid", "Thyroid condition"],
                  ["pcos", "PCOD / PCOS"],
                ] as const
              ).map(([value, label]) => (
                <ChoiceButton
                  key={value}
                  label={label}
                  selected={profile.healthCondition === value}
                  onClick={() => update("healthCondition", value)}
                />
              ))}
            </div>
          )}

          {/* Updated fitness goals */}
          {step === 4 && (
            <div className="grid gap-3">
              {(
                [
                  ["weight_loss", "Weight Loss"],
                  ["weight_gain", "Weight Gain"],
                  ["muscle_gain", "Muscle Gain"],
                  [
                    "muscle_gain_fat_loss",
                    "Muscle Gain + Fat Loss",
                  ],
                  [
                    "muscle_gain_weight_gain",
                    "Muscle Gain + Weight Gain",
                  ],
                ] as const
              ).map(([value, label]) => (
                <ChoiceButton
                  key={value}
                  label={label}
                  selected={profile.fitnessGoal === value}
                  onClick={() => update("fitnessGoal", value)}
                />
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-3">
              {(
                [
                  ["basic", "Basic — Daily chores"],
                  ["medium", "Medium — General training"],
                  [
                    "intense",
                    "Intense — Heavy strength training",
                  ],
                ] as const
              ).map(([value, label]) => (
                <ChoiceButton
                  key={value}
                  label={label}
                  selected={profile.activityLevel === value}
                  onClick={() => update("activityLevel", value)}
                />
              ))}
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={previous}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 font-medium"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 rounded-full bg-green-800 px-6 py-3 font-medium text-white hover:bg-green-900"
          >
            {step === steps.length - 1 ? "Finish" : "Continue"}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </main>
  );
}
