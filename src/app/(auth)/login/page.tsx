import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import RegisterModal from "@/components/RegisterModal";

export const metadata = { title: "התחברות — TarbutRM" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ברוכים הבאים</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">התחבר כדי להמשיך</p>
      </div>

      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-10 shadow-md dark:shadow-lg space-y-5">
        <LoginForm />
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          לקוח חדש?{" "}
          <RegisterModal
            triggerLabel="להרשמה"
            triggerClassName="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 bg-transparent border-none p-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
