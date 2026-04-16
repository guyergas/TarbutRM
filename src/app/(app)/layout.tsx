import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    console.warn("[AppLayout] Invalid session:", { session: session ? { user: { id: session.user?.id } } : null });
    redirect("/login");
  }

  return (
    <main className="max-w-[900px] mx-auto px-4 pb-8 w-full bg-white dark:bg-black">
      {children}
    </main>
  );
}
