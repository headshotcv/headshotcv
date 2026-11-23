import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
export const metadata = { title: "Connexion" };
export default function Page() {
  return <AuthLayout title="Connexion" subtitle="Reprends là où tu t’es arrêté."><Suspense><AuthForm kind="signin" /></Suspense></AuthLayout>;
}
