export type City = {
  slug: string;
  name: string;
  province: string;
  region: string;
  tagline: string;
  intro: string;
  neighborhoods: string[];
  hours: string;
  turnaround: string;
  streetAddress?: string;
  isoRegion: string;
  faqs: { q: string; a: string }[];
};

const COMMON_FAQS = [
  { q: "How long does a screen repair take?", a: "Most modern iPhone and Samsung screen swaps are done in 30–60 minutes while you wait. Older models or back-glass repairs can take 1–3 hours." },
  { q: "Do you offer a warranty?", a: "Every repair comes with a 90-day workmanship warranty. Refurbished phones include a 30-day full warranty." },
  { q: "Can I ship my device to you?", a: "Yes. Contact us and we'll send a prepaid label. Typical turnaround once we receive it is 24–48 hours." },
  { q: "What about water damage?", a: "Free diagnostic. We open the phone, ultrasonic-clean the board, and only charge if we can revive it. Recovery is never guaranteed but we're often successful." }
];

export const CITIES: City[] = [
  { slug: "gta", name: "GTA (Greater Toronto Area)", province: "Ontario", region: "ON", isoRegion: "CA-ON", tagline: "Toronto's go-to spot for fast, honest phone repair.", intro: "Serving the entire Greater Toronto Area from Etobicoke to Scarborough, Markham to Mississauga. Walk-ins welcome, most repairs done same-day.", neighborhoods: ["Downtown Toronto", "North York", "Scarborough", "Etobicoke", "Mississauga", "Brampton", "Markham", "Vaughan"], hours: "Mon–Sat 9am–7pm · Sun 11am–5pm", turnaround: "Most screen and battery repairs done in under 60 minutes.", faqs: [{ q: "Do you service iPhones and Samsungs in the GTA?", a: "Yes — every iPhone from the 6s through 16 Pro Max, every Galaxy from S10 onwards, plus Pixels and Sonys." }, ...COMMON_FAQS] },
  { slug: "montreal", name: "Montréal", province: "Québec", region: "QC", isoRegion: "CA-QC", tagline: "Réparation de téléphones rapide et fiable à Montréal.", intro: "From the Plateau to Westmount, NDG to Hochelaga — we fix iPhones, Samsungs, Pixels and more across the Island of Montréal. Bilingual service.", neighborhoods: ["Plateau-Mont-Royal", "Downtown", "Westmount", "NDG", "Hochelaga", "Verdun", "Laval", "Longueuil"], hours: "Lun–Sam 10h–19h · Dim fermé", turnaround: "La plupart des réparations d'écran et de batterie en moins de 90 minutes.", faqs: [{ q: "Le service est-il offert en français?", a: "Oui — notre équipe à Montréal est entièrement bilingue. Appelez-nous en français ou en anglais." }, ...COMMON_FAQS] },
  { slug: "ottawa", name: "Ottawa", province: "Ontario", region: "ON", isoRegion: "CA-ON", tagline: "Reliable phone repair in Canada's capital.", intro: "Centrally located to serve Ottawa, Gatineau, Kanata, Orleans and Barrhaven. Trusted by students, government workers and small businesses.", neighborhoods: ["Centretown", "Glebe", "Westboro", "Kanata", "Orleans", "Barrhaven", "Nepean", "Gatineau"], hours: "Mon–Fri 9am–6pm · Sat 10am–5pm", turnaround: "Same-day for most repairs. Government corporate accounts welcome.", faqs: [{ q: "Do you accept corporate or government accounts?", a: "Yes — we invoice net-30 for verified Ottawa-area employers. Email us with your purchase-order details to set up." }, ...COMMON_FAQS] },
  { slug: "quebec-city", name: "Québec", province: "Québec", region: "QC", isoRegion: "CA-QC", tagline: "Réparation de téléphones cellulaires à Québec.", intro: "Service complet de réparation et de revente de téléphones à Québec — du Vieux-Québec à Sainte-Foy. Service en français et en anglais.", neighborhoods: ["Vieux-Québec", "Saint-Roch", "Limoilou", "Sainte-Foy", "Sillery", "Beauport", "Charlesbourg", "Lévis"], hours: "Lun–Sam 10h–18h", turnaround: "Réparation le jour même pour la plupart des modèles.", faqs: [{ q: "Servez-vous la Rive-Sud (Lévis)?", a: "Oui, beaucoup de nos clients viennent de Lévis. Le pont est rapide et le stationnement gratuit chez nous." }, ...COMMON_FAQS] },
  { slug: "moncton", name: "Moncton", province: "New Brunswick", region: "NB", isoRegion: "CA-NB", tagline: "The Maritimes' trusted mobile repair shop.", intro: "Serving Moncton, Dieppe, Riverview and the surrounding tri-community. Quality parts, fair prices, and warranty on every repair.", neighborhoods: ["Downtown Moncton", "Dieppe", "Riverview", "Magnetic Hill", "North End", "Sunny Brae"], hours: "Mon–Fri 9am–6pm · Sat 10am–4pm", turnaround: "Most repairs completed within 1–2 hours.", faqs: [{ q: "Do you offer bilingual service (English / French)?", a: "Yes — we serve customers in both English and French, important for the greater Moncton region." }, ...COMMON_FAQS] },
  { slug: "halifax", name: "Halifax", province: "Nova Scotia", region: "NS", isoRegion: "CA-NS", tagline: "Halifax's friendly neighbourhood phone repair shop.", intro: "Covering Halifax, Dartmouth, Bedford and Sackville. Student-friendly pricing and bulk repair contracts for local businesses.", neighborhoods: ["Downtown Halifax", "North End", "South End", "Dartmouth", "Bedford", "Sackville", "Clayton Park"], hours: "Mon–Sat 9am–6pm · Sun 12pm–5pm", turnaround: "Express service available — most screens done while you wait.", faqs: [{ q: "Do you offer student pricing?", a: "Yes — show a valid Dalhousie, SMU, MSVU or NSCC student ID and get 10% off any single repair." }, ...COMMON_FAQS] }
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
