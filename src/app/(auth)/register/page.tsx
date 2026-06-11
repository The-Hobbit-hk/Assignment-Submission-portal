import { AuthLayout } from "@/components/layout/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register | Rotaract District 3131 ERP",
  description: "Create an account on the Rotaract District 3131 ERP platform.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the district ERP to manage clubs and operations."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
