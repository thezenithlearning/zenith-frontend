import type { Metadata } from "next";
import DemoVideoList from "@/components/demoVideo/DemoVideoList";

export const metadata: Metadata = {
  title: "Free Demo Videos",
  description: "Watch short subject lessons and read their transcripts.",
  alternates: { canonical: "/demo-videos" },
};
export default function DemoVideosPage() { return <DemoVideoList />; }
