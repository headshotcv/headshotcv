import { Suspense } from "react";
import { TodayPage } from "@/components/app/pages/TodayPage";
export const metadata = { title: "Aujourd’hui" };
export default function Page() {
  return <Suspense><TodayPage /></Suspense>;
}
