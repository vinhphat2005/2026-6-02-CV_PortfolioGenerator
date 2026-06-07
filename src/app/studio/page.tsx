import type { Metadata } from "next";
import { CareerForgeApp } from "@/features/app/CareerForgeApp";

export const metadata: Metadata = {
  title: "Studio | Career Forge",
  description: "Build, review, and export a focused CV and project portfolio."
};

export default function StudioPage() {
  return <CareerForgeApp />;
}
