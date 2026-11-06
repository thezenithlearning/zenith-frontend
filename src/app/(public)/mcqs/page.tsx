import type { Metadata } from "next";
import { Suspense } from "react";
import MockTestList from "@/components/mock-tests/MockTestList";

export const metadata: Metadata = {
  title: "Free MCQ Practice",
  description: "Practise subject questions at your own pace and review explanations.",
  alternates: { canonical: "/mcqs" },
};
export default function McqPage() {
  return <Suspense fallback={<div className="min-h-[60vh]" />}><MockTestList mode="practice" /></Suspense>;
}
