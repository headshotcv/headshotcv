import { Suspense } from "react";
import { ProgressPage } from "@/components/app/pages/ProgressPage";
export const metadata = { title: "Ma progression" };
export default function Page() {
  return <Suspense><ProgressPage /></Suspense>;
}
