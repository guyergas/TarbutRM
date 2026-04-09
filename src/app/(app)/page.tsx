import { auth } from "@/lib/auth";

export const metadata = { title: "בית — TarbutRM" };

export default async function HomePage() {
  const session = await auth();
  const name = session?.user?.name ?? "";

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white px-8 py-10 shadow-sm text-center space-y-2">
        <h1 className="text-2xl font-bold">שלום, {name}</h1>
        <p className="text-sm text-gray-500">ברוך הבא לחנות TarbutRM</p>
      </div>
    </div>
  );
}
