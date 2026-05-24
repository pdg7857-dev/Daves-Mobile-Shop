// Service areas for SEO + local landing pages. Dave's is a nationwide
// mail-in repair + refurbished-phone shop — no physical storefront. These
// pages exist so a Google search for "phone repair <city>" finds us.

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
  isoRegion: string;
  faqs: { q: string; a: string }[];
};

export const UNIVERSAL_HOURS = "Open 7 days / week · 8 AM – 9 PM ET";
export const EMERGENCY_NOTE = "Emergency repairs available — message us and we'll fast-track your fix.";

const COMMON_FAQS = [
  { q: "How do mail-in repairs work?", a: "Message us with your device + issue. We send a prepaid shipping label, you drop it at any Canada Post location, and we typically have your phone back to you within 3–5 business days." },
  { q: "Do you offer a warranty?", a: "180-day full warranty on every refurbished phone we sell. 90-day workmanship warranty on every repair." },
  { q: "What's the turnaround on a repair?", a: "Most screen, battery and camera swaps are completed within 24–48 hours of receiving the device. Emergency same-day return shipping available at extra cost." },
  { q: "Do you handle water damage?", a: "Free diagnostic. We open the phone, ultrasonic-clean the board, and only charge if we can revive it. Recovery is never guaranteed but we're often successful." },
  { q: "Are you open weekends?", a: "Yes — our support team responds 7 days a week, 8 AM to 9 PM Eastern. Emergency repairs available outside those hours by request." }
];

function area(opts: {
  slug: string;
  name: string;
  province: string;
  region: string;
  isoRegion: string;
  tagline: string;
  intro: string;
  neighborhoods: string[];
  extraFaq?: { q: string; a: string };
}): City {
  return {
    slug: opts.slug,
    name: opts.name,
    province: opts.province,
    region: opts.region,
    isoRegion: opts.isoRegion,
    tagline: opts.tagline,
    intro: opts.intro,
    neighborhoods: opts.neighborhoods,
    hours: UNIVERSAL_HOURS,
    turnaround: "Mail-in repair completed within 24–48 hours of receipt. Free prepaid shipping both ways on orders over $200.",
    faqs: opts.extraFaq ? [opts.extraFaq, ...COMMON_FAQS] : COMMON_FAQS
  };
}

export const CITIES: City[] = [
  area({
    slug: "toronto",
    name: "Toronto",
    province: "Ontario",
    region: "ON",
    isoRegion: "CA-ON",
    tagline: "Fast, honest phone repair for the GTA — shipped to your door.",
    intro: "Serving the entire Greater Toronto Area from Etobicoke to Scarborough, Markham to Mississauga. Mail us your phone or order a refurbished one — we ship anywhere in the GTA same-day from our hub.",
    neighborhoods: ["Downtown Toronto", "North York", "Scarborough", "Etobicoke", "Mississauga", "Brampton", "Markham", "Vaughan", "Richmond Hill", "Oakville"]
  }),
  area({
    slug: "ottawa",
    name: "Ottawa",
    province: "Ontario",
    region: "ON",
    isoRegion: "CA-ON",
    tagline: "Reliable phone repair in Canada's capital.",
    intro: "Trusted by students, government workers and small businesses across the National Capital Region. Mail-in repairs with 24-hour turnaround.",
    neighborhoods: ["Centretown", "Glebe", "Westboro", "Kanata", "Orleans", "Barrhaven", "Nepean", "Gatineau"],
    extraFaq: { q: "Do you accept corporate or government accounts?", a: "Yes — we invoice net-30 for verified employers across the National Capital Region. Email us with your purchase-order details." }
  }),
  area({
    slug: "hamilton",
    name: "Hamilton",
    province: "Ontario",
    region: "ON",
    isoRegion: "CA-ON",
    tagline: "Steel City's go-to mail-in phone repair.",
    intro: "Serving Hamilton, Burlington, Dundas, Ancaster and Stoney Creek. Drop your phone at any Canada Post location with our prepaid label and we'll have it back to you in days.",
    neighborhoods: ["Downtown Hamilton", "Westdale", "Stoney Creek", "Ancaster", "Dundas", "Burlington"]
  }),
  area({
    slug: "kitchener-waterloo",
    name: "Kitchener-Waterloo",
    province: "Ontario",
    region: "ON",
    isoRegion: "CA-ON",
    tagline: "Tech-town phone repair done right.",
    intro: "Home to Canada's tech triangle — Kitchener, Waterloo and Cambridge. Trusted by Communitech founders, UW + WLU students, and the surrounding region.",
    neighborhoods: ["Uptown Waterloo", "Downtown Kitchener", "Cambridge", "Guelph", "Conestoga"],
    extraFaq: { q: "Do you offer student pricing?", a: "Yes — show a valid UW, WLU, Conestoga or McMaster student ID for 10% off any repair." }
  }),
  area({
    slug: "london",
    name: "London",
    province: "Ontario",
    region: "ON",
    isoRegion: "CA-ON",
    tagline: "Forest City phone repair, shipped fast.",
    intro: "Serving London, St. Thomas and Strathroy. Mail-in repairs and refurbished phones with free shipping anywhere in Southwestern Ontario.",
    neighborhoods: ["Downtown London", "Old North", "Old South", "Byron", "Masonville", "Westmount"]
  }),
  area({
    slug: "montreal",
    name: "Montréal",
    province: "Québec",
    region: "QC",
    isoRegion: "CA-QC",
    tagline: "Réparation de téléphones rapide et fiable, livrée chez vous.",
    intro: "Du Plateau à Westmount, NDG à Hochelaga — service postal de réparation à travers l'île de Montréal et la Rive-Sud. Service bilingue.",
    neighborhoods: ["Plateau-Mont-Royal", "Downtown", "Westmount", "NDG", "Hochelaga", "Verdun", "Laval", "Longueuil"],
    extraFaq: { q: "Le service est-il offert en français?", a: "Oui — notre équipe est entièrement bilingue. Appelez-nous ou écrivez-nous en français ou en anglais." }
  }),
  area({
    slug: "quebec-city",
    name: "Québec",
    province: "Québec",
    region: "QC",
    isoRegion: "CA-QC",
    tagline: "Réparation cellulaire à Québec, livraison rapide.",
    intro: "Service postal complet à Québec — du Vieux-Québec à Sainte-Foy, jusqu'à Lévis et la Beauce.",
    neighborhoods: ["Vieux-Québec", "Saint-Roch", "Limoilou", "Sainte-Foy", "Sillery", "Beauport", "Charlesbourg", "Lévis"]
  }),
  area({
    slug: "halifax",
    name: "Halifax",
    province: "Nova Scotia",
    region: "NS",
    isoRegion: "CA-NS",
    tagline: "Trusted phone repair across the Maritimes.",
    intro: "Covering Halifax, Dartmouth, Bedford and Sackville. Student-friendly pricing and fast Maritime-wide mail-in turnaround.",
    neighborhoods: ["Downtown Halifax", "North End", "South End", "Dartmouth", "Bedford", "Sackville", "Clayton Park"],
    extraFaq: { q: "Do you offer student pricing?", a: "Yes — Dal, SMU, MSVU and NSCC students get 10% off any single repair with valid ID." }
  }),
  area({
    slug: "moncton",
    name: "Moncton",
    province: "New Brunswick",
    region: "NB",
    isoRegion: "CA-NB",
    tagline: "Maritime-wide mail-in phone repair.",
    intro: "Serving Moncton, Dieppe, Riverview and the surrounding tri-community — plus Saint John, Fredericton, and across New Brunswick.",
    neighborhoods: ["Moncton", "Dieppe", "Riverview", "Saint John", "Fredericton"],
    extraFaq: { q: "Bilingual service?", a: "Oui — service en français et en anglais, important pour la région du Grand Moncton." }
  }),
  area({
    slug: "st-johns",
    name: "St. John's",
    province: "Newfoundland",
    region: "NL",
    isoRegion: "CA-NL",
    tagline: "Newfoundland phone repair — no flight required.",
    intro: "Mail-in service across the rock. Free pickup label, fast turnaround, full warranty.",
    neighborhoods: ["Downtown St. John's", "Mount Pearl", "Paradise", "Conception Bay South", "Corner Brook"]
  }),
  area({
    slug: "winnipeg",
    name: "Winnipeg",
    province: "Manitoba",
    region: "MB",
    isoRegion: "CA-MB",
    tagline: "Prairie city phone repair, mailed back in days.",
    intro: "Serving Winnipeg, Brandon and across Manitoba with mail-in phone repair and refurbished device delivery.",
    neighborhoods: ["Downtown Winnipeg", "Osborne Village", "St. Boniface", "St. Vital", "Transcona", "Brandon"]
  }),
  area({
    slug: "regina",
    name: "Regina",
    province: "Saskatchewan",
    region: "SK",
    isoRegion: "CA-SK",
    tagline: "Saskatchewan phone repair without the wait.",
    intro: "Mail-in repair and refurbished phone delivery across Regina, Saskatoon and the surrounding province.",
    neighborhoods: ["Downtown Regina", "Cathedral", "Lakeview", "Harbour Landing", "Saskatoon", "Moose Jaw"]
  }),
  area({
    slug: "saskatoon",
    name: "Saskatoon",
    province: "Saskatchewan",
    region: "SK",
    isoRegion: "CA-SK",
    tagline: "Saskatoon's mail-in phone repair specialists.",
    intro: "Bridge city service for students, professionals and families across Saskatoon and northern Saskatchewan.",
    neighborhoods: ["Downtown Saskatoon", "Riversdale", "Nutana", "Stonebridge", "Lawson Heights", "Warman"]
  }),
  area({
    slug: "edmonton",
    name: "Edmonton",
    province: "Alberta",
    region: "AB",
    isoRegion: "CA-AB",
    tagline: "Alberta's capital — phone repair shipped to your door.",
    intro: "Edmonton, St. Albert, Sherwood Park and the entire Edmonton Metropolitan Region. Free prepaid shipping both ways.",
    neighborhoods: ["Downtown Edmonton", "Old Strathcona", "Whyte Ave", "St. Albert", "Sherwood Park", "Spruce Grove"]
  }),
  area({
    slug: "calgary",
    name: "Calgary",
    province: "Alberta",
    region: "AB",
    isoRegion: "CA-AB",
    tagline: "Calgary phone repair — no shop visit required.",
    intro: "Trusted across Calgary, Airdrie, Cochrane and Okotoks. Mail-in service with turnaround so fast you'll forget you sent it.",
    neighborhoods: ["Downtown Calgary", "Beltline", "Kensington", "Mission", "Airdrie", "Cochrane", "Okotoks"]
  }),
  area({
    slug: "vancouver",
    name: "Vancouver",
    province: "British Columbia",
    region: "BC",
    isoRegion: "CA-BC",
    tagline: "Lower Mainland phone repair, no commute.",
    intro: "Vancouver, Burnaby, Surrey, Richmond and the entire Lower Mainland. Mail-in repair and certified refurbished phones shipped from our Canadian fulfillment hub.",
    neighborhoods: ["Downtown Vancouver", "Kitsilano", "Mount Pleasant", "Burnaby", "Surrey", "Richmond", "North Vancouver", "Coquitlam"]
  }),
  area({
    slug: "victoria",
    name: "Victoria",
    province: "British Columbia",
    region: "BC",
    isoRegion: "CA-BC",
    tagline: "Island phone repair — no ferry trip required.",
    intro: "Serving Victoria, Saanich, Nanaimo and Vancouver Island. Mail it out one day, get it back days later.",
    neighborhoods: ["Downtown Victoria", "Oak Bay", "Saanich", "Esquimalt", "Sidney", "Nanaimo"]
  })
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
