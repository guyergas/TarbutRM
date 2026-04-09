import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px", width: "100%" }}>
      {children}
    </main>
  );
}
