import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = { title: "התחברות — TarbutRM" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-2xl">ברוכים הבאים</h1>
        <p className="mt-1 text-sm text-gray-600">התחבר כדי להמשיך</p>
      </div>

      <div className="rounded-xl bg-white px-8 py-10 shadow-md">
        <LoginForm />
      </div>
    </div>
  );
}
