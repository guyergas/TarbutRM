import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MessagesTableClient from "./MessagesTableClient";

export const metadata = { title: "ניהול הודעות – TarbutRM" };

interface SerializedMessage {
  id: string;
  email: string;
  name: string | null;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
}

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedMessages: SerializedMessage[] = messages.map((msg) => ({
    id: msg.id,
    email: msg.email,
    name: msg.name,
    title: msg.title,
    description: msg.description,
    status: msg.status,
    createdAt: new Date(msg.createdAt).toLocaleString("he-IL"),
    closedAt: msg.closedAt ? new Date(msg.closedAt).toLocaleString("he-IL") : null,
  }));

  const openMessages = serializedMessages.filter((m) => m.status === "OPEN");
  const closedMessages = serializedMessages.filter((m) => m.status === "CLOSED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ניהול הודעות</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {openMessages.length} הודעות פתוחות, {closedMessages.length} הודעות סגורות
        </p>
      </div>

      <MessagesTableClient openMessages={openMessages} closedMessages={closedMessages} />
    </div>
  );
}
