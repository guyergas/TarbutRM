import { auth } from "@/lib/auth";
import ContactForm from "./ContactForm";

export const metadata = { title: "צור קשר — TarbutRM" };

export default async function ContactPage() {
  const session = await auth();
  const initialEmail = session?.user?.email || "";
  const isLoggedIn = !!session?.user?.id;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-10 shadow-sm dark:shadow-lg space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">צור קשר</h1>
          <p className="text-gray-700 dark:text-gray-300">פייר קורן</p>
          <div className="space-y-2">
            <a
              href="tel:052-6066829"
              className="block text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              052-6066829
            </a>
            <a
              href="mailto:tarbut@krm.org.il"
              className="block text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              tarbut@krm.org.il
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            שלח לנו הודעה
          </h2>
          <ContactForm initialEmail={initialEmail} isLoggedIn={isLoggedIn} />
        </div>
      </div>
      </div>
    </main>
  );
}
