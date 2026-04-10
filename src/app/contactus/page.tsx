export const metadata = { title: "צור קשר — TarbutRM" };

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-10 shadow-sm dark:shadow-lg space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">צור קשר</h1>
        <p className="text-gray-700 dark:text-gray-300">פייר קורן</p>
        <a
          href="tel:+972526066829"
          className="block text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300"
        >
          +972 52-606-6829
        </a>
        <a
          href="mailto:tarbut@krm.org.il"
          className="block text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300"
        >
          tarbut@krm.org.il
        </a>
      </div>
    </main>
  );
}
