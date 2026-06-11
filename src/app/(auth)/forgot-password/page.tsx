import { AuthLayout } from "@/components/layout/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password | Rotaract District 3131 ERP",
  description: "Reset your Rotaract District 3131 ERP account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No worries — we'll send you reset instructions."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
