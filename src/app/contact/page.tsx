import { CITIES } from "@/lib/cities";

export const metadata = {
  title: "Contact — Dave's Mobile Shop",
  description: "Get a free quote for phone repair or contact your nearest Dave's Mobile Shop location."
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "";

  return (
    <div className="container-narrow py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Talk to us</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          We&rsquo;re here to help.
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Text us a photo of the damage and we&rsquo;ll send back a fixed price in under an hour.
        </p>
      </header>

      <div className="mt-14 grid md:grid-cols-2 gap-3">
        <a href={`tel:${phone}`} className="card card-hover p-8">
          <p className="eyebrow text-white/55">Call or text</p>
          <p className="mt-2 text-display-md text-white tracking-tighter">{phone || "Call us"}</p>
          <p className="mt-3 text-[14px] text-white/60">Fastest way to reach us. Same number for all locations.</p>
        </a>
        <a href={`mailto:${email}`} className="card card-hover p-8">
          <p className="eyebrow text-white/55">Email</p>
          <p className="mt-2 text-[22px] font-semibold text-white tracking-tight break-words">{email || "Email us"}</p>
          <p className="mt-3 text-[14px] text-white/60">Bulk parts orders, business inquiries and warranty claims.</p>
        </a>
      </div>

      <h2 className="mt-20 text-display-md text-white tracking-tighter text-center">Our locations</h2>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CITIES.map((c) => (
          <a key={c.slug} href={`/locations/${c.slug}`} className="card card-hover p-6">
            <p className="eyebrow text-white/50">{c.province}</p>
            <h3 className="mt-2 font-semibold text-[17px] text-white tracking-tight">{c.name}</h3>
            <p className="mt-2 text-[13px] text-white/55">{c.hours}</p>
            <p className="mt-4 link-chevron text-[13px]">Visit location</p>
          </a>
        ))}
      </div>
    </div>
  );
}
