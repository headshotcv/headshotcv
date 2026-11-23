import { WorkoutPage } from "@/components/app/pages/WorkoutPage";
export const metadata = { title: "Séance" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkoutPage slug={id} />;
}
