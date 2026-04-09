export const metadata = { title: "צור קשר — TarbutRM" };

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px", width: "100%" }}>
      <div className="rounded-xl bg-white px-8 py-10 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold">צור קשר</h1>
        <p className="text-gray-700">פייר קורן</p>
        <a
          href="tel:+972526066829"
          className="block text-indigo-600 font-medium hover:text-indigo-500"
        >
          +972 52-606-6829
        </a>
        <a
          href="mailto:tarbut@krm.org.il"
          className="block text-indigo-600 font-medium hover:text-indigo-500"
        >
          tarbut@krm.org.il
        </a>
      </div>
    </main>
  );
}
