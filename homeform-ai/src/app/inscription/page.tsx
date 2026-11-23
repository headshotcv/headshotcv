import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
export const metadata = { title: "Créer un compte" };
export default function Page() {
  return <AuthLayout title="Créer ton compte" subtitle="Pour enregistrer tes analyses, ton programme et ta progression."><Suspense><AuthForm kind="signup" /></Suspense></AuthLayout>;
}
