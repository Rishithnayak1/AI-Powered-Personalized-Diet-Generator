
import { useState } from "react";
import type { UserProfile } from "./types/profile";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";

import {
  Leaf,
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Personalized Meal Plans",
    description:
      "Discover balanced South Indian meal plans designed around your nutritional needs.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Nutrition Tracking",
    description:
      "Monitor your daily calories, protein, carbohydrates, fats and fibre.",
  },
  {
    icon: MessageCircle,
    title: "Smart Diet Assistant",
    description:
      "Ask nutrition questions and request changes to your meal timetable.",
  },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  function completeOnboarding(profile: UserProfile): void {
    console.log("NutriAI profile completed:", profile);
    setUserProfile(profile);
    setShowOnboarding(false);
  }

  function exitDashboard(): void {
    setUserProfile(null);
    setShowOnboarding(false);
  }

  // Display the dashboard after onboarding is completed.
  if (userProfile !== null) {
    return (
      <Dashboard
        profile={userProfile}
        onExit={exitDashboard}
      />
    );
  }

  // Display the onboarding form after clicking Get Started.
  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={completeOnboarding}
        onBack={() => setShowOnboarding(false)}
      />
    );
  }

  // Main landing page.
  return (
    <div className="min-h-screen bg-[#FAFCF8] text-[#183B2D]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-12">
        <a href="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-[#E4F1E6] p-2">
            <Leaf size={25} className="text-[#286B47]" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            NutriAI
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="hover:text-green-700">
            Features
          </a>
          <a href="#about" className="hover:text-green-700">
            About
          </a>
          <a href="#how-it-works" className="hover:text-green-700">
            How It Works
          </a>
        </nav>

        <button
          type="button"
          className="hidden rounded-full border border-[#286B47] px-7 py-2.5 font-medium hover:bg-green-50 md:block"
        >
          Login
        </button>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-green-100 bg-white px-6 py-5 md:hidden">
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How It Works
          </a>
        </nav>
      )}

      <main>
        <section className="relative overflow-hidden px-6 py-20 text-center md:py-28">
          <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-green-100/50 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />

          <div className="relative mx-auto max-w-4xl">
            <span className="inline-block rounded-full bg-[#E5F2E8] px-5 py-2 text-sm font-medium text-[#286B47]">
              PLAN • TRACK • EAT HEALTHY
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Your Personalized
              <span className="block text-[#34845A]">
                Nutrition Companion
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              Healthy eating begins with understanding your body.
              Discover personalized South Indian meal plans,
              nutritional insights and smarter ways to reach
              your fitness goals.
            </p>

            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#245C40] px-9 py-4 font-semibold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#194A32]"
            >
              Get Started
              <ArrowRight size={19} />
            </button>

            <p className="mt-5 text-sm text-gray-500">
              Personalized nutrition, made simple.
            </p>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-6 py-20 md:px-12"
        >
          <div className="text-center">
            <p className="font-medium text-[#34845A]">
              WHY NUTRIAI?
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Everything you need to eat smarter
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-6 inline-flex rounded-2xl bg-[#E7F3E9] p-4">
                    <Icon className="text-[#286B47]" size={27} />
                  </div>

                  <h3 className="text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="about"
          className="bg-[#EAF4EB] px-6 py-20 text-center"
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold">
              Nutrition that fits your lifestyle
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              NutriAI combines nutritional calculations,
              curated South Indian food data and
              constraint-based meal planning to help
              users make informed dietary choices.
            </p>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-5xl px-6 py-20 text-center"
        >
          <h2 className="text-3xl font-bold">
            How NutriAI Works
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              [
                "01",
                "Create Your Profile",
                "Enter your personal details and dietary preferences.",
              ],
              [
                "02",
                "Generate Your Plan",
                "Receive a meal timetable based on your selected constraints.",
              ],
              [
                "03",
                "Track and Adjust",
                "Log meals and request changes using the diet assistant.",
              ],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl bg-white p-6"
              >
                <span className="text-3xl font-bold text-[#34845A]">
                  {number}
                </span>

                <h3 className="mt-4 text-lg font-semibold">
                  {title}
                </h3>

                <p className="mt-3 text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-green-100 px-6 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} NutriAI. Personalized Nutrition Companion.
      </footer>
    </div>
  );
}
