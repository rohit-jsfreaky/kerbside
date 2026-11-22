import type { Metadata } from "next";
import { Planner } from "@/components/Planner";

export const metadata: Metadata = { title: "Make a timetable · Kerbside" };

export default function StopPage() {
  return <Planner />;
}
