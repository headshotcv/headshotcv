import { AnalysisDetailPage } from "@/components/app/pages/AnalysesPages";
export const metadata = { title: "Analyse" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnalysisDetailPage id={id} />;
}
