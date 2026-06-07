import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = {
  title: "Career Forge | CV and Portfolio Studio",
  description: "Create focused CVs, portfolio decks, and job-ready evidence from one local-first workspace."
};

export default function HomePage() {
  return <LandingPage />;
}
