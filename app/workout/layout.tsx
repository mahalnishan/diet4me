import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Workout Plan Generator | Personalized Fitness Plans",
  description: "Diet4Me is a free AI workout plan generator that builds a personalized weekly fitness plan. Custom workout generator and AI fitness planner.",
  keywords: "ai workout plan generator, free workout plan generator, personalized workout plan, custom fitness plan generator, ai fitness planner, weekly workout plan generator",
};

export default function WorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
