import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register | Rotaract District 3131",
  description: "Create an account on the Rotaract District 3131 platform.",
};

const SELF_REGISTRATION_ENABLED = process.env.ALLOW_SELF_REGISTRATION === "true";

export default function RegisterPage() {
  // Invite-only platform: accounts are provisioned by district admins.
  if (!SELF_REGISTRATION_ENABLED) {
    redirect("/login");
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the district ERP to manage clubs and operations."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
