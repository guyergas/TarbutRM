import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TutorialCheck from "./TutorialCheck";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    console.warn("[AppLayout] Invalid session:", { session: session ? { user: { id: session.user?.id } } : null });
    redirect("/login");
  }

  // Fetch user's tutorial status and role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tutorialViewed: true, role: true },
  });

  return (
    <>
      <TutorialCheck
        userId={session.user.id}
        tutorialViewed={user?.tutorialViewed ?? false}
        role={user?.role}
      />
      <main className="max-w-[900px] mx-auto px-4 pb-8 w-full bg-white dark:bg-black">
        {children}
      </main>
    </>
  );
}
