import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "./actions";

export const metadata = { title: "Dashboard — TarbutRM" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white px-8 py-10 shadow-md text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session.user.name}
        </h1>
        <p className="text-sm text-gray-500">
          Role: <span className="font-medium text-gray-700">{session.user.role}</span>
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
