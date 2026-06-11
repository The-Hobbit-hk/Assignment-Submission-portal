import { Suspense } from "react";
import { LoginPageContent } from "@/components/auth/login-page-content";

export const metadata = {
  title: "Sign In | Rotaract District 3131",
  description: "Sign in to your Rotaract District 3131 portal.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-white" />}>
      <LoginPageContent />
    </Suspense>
  );
}
