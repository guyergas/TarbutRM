import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in — TarbutRM" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            TarbutRM
          </h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <div className="rounded-xl bg-white px-8 py-10 shadow-md">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
