import { CITIES } from "@/lib/cities";

export const metadata = {
  title: "Contact — Dave's Mobile Shop",
  description: "Get a free quote for phone repair or contact your nearest Dave's Mobile Shop location."
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">Get in touch</h1>
        <p className="mt-3 text-gray-600">
          Text us a photo of your damage for the fastest quote. We typically reply within 30 minutes during business hours.
        </p>
      </header>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <a href={`tel:${phone}`} className="card p-6 hover:shadow-md transition-shadow">
          <span className="text-3xl">📞</span>
          <h2 className="mt-3 text-xl font-semibold text-gray-900">Call or text</h2>
          <p className="mt-1 text-brand-700 font-medium">{phone || "(call us)"}</p>
          <p className="mt-2 text-sm text-gray-600">Fastest way to reach us. Same number for all locations.</p>
        </a>
        <a href={`mailto:${email}`} className="card p-6 hover:shadow-md transition-shadow">
          <span className="text-3xl">✉️</span>
          <h2 className="mt-3 text-xl font-semibold text-gray-900">Email</h2>
          <p className="mt-1 text-brand-700 font-medium">{email || "email us"}</p>
          <p className="mt-2 text-sm text-gray-600">For bulk part orders, business inquiries and warranty claims.</p>
        </a>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-gray-900">Our locations</h2>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CITIES.map((c) => (
          <div key={c.slug} className="card p-5">
            <h3 className="font-semibold text-gray-900">{c.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{c.province}</p>
            <p className="mt-2 text-sm text-gray-700">{c.hours}</p>
            <a href={`/locations/${c.slug}`} className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-900">
              Visit this location →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
