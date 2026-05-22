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
};

export const CITIES: City[] = [
  {
    slug: "gta",
    name: "GTA (Greater Toronto Area)",
    province: "Ontario",
    region: "ON",
    tagline: "Toronto's go-to spot for fast, honest phone repair.",
    intro:
      "Serving the entire Greater Toronto Area from Etobicoke to Scarborough, Markham to Mississauga. Walk-ins welcome, most repairs done same-day.",
    neighborhoods: ["Downtown Toronto", "North York", "Scarborough", "Etobicoke", "Mississauga", "Brampton", "Markham", "Vaughan"],
    hours: "Mon–Sat 9am–7pm · Sun 11am–5pm",
    turnaround: "Most screen and battery repairs done in under 60 minutes."
  },
  {
    slug: "montreal",
    name: "Montréal",
    province: "Québec",
    region: "QC",
    tagline: "Réparation de téléphones rapide et fiable à Montréal.",
    intro:
      "From the Plateau to Westmount, NDG to Hochelaga — we fix iPhones, Samsungs, Pixels and more across the Island of Montréal. Bilingual service.",
    neighborhoods: ["Plateau-Mont-Royal", "Downtown", "Westmount", "NDG", "Hochelaga", "Verdun", "Laval", "Longueuil"],
    hours: "Lun–Sam 10h–19h · Dim fermé",
    turnaround: "La plupart des réparations d'écran et de batterie en moins de 90 minutes."
  },
  {
    slug: "ottawa",
    name: "Ottawa",
    province: "Ontario",
    region: "ON",
    tagline: "Reliable phone repair in Canada's capital.",
    intro:
      "Centrally located to serve Ottawa, Gatineau, Kanata, Orleans and Barrhaven. Trusted by students, government workers and small businesses.",
    neighborhoods: ["Centretown", "Glebe", "Westboro", "Kanata", "Orleans", "Barrhaven", "Nepean", "Gatineau"],
    hours: "Mon–Fri 9am–6pm · Sat 10am–5pm",
    turnaround: "Same-day for most repairs. Government corporate accounts welcome."
  },
  {
    slug: "quebec-city",
    name: "Québec",
    province: "Québec",
    region: "QC",
    tagline: "Réparation de téléphones cellulaires à Québec.",
    intro:
      "Service complet de réparation et de revente de téléphones à Québec — du Vieux-Québec à Sainte-Foy. Service en français et en anglais.",
    neighborhoods: ["Vieux-Québec", "Saint-Roch", "Limoilou", "Sainte-Foy", "Sillery", "Beauport", "Charlesbourg", "Lévis"],
    hours: "Lun–Sam 10h–18h",
    turnaround: "Réparation le jour même pour la plupart des modèles."
  },
  {
    slug: "moncton",
    name: "Moncton",
    province: "New Brunswick",
    region: "NB",
    tagline: "The Maritimes' trusted mobile repair shop.",
    intro:
      "Serving Moncton, Dieppe, Riverview and the surrounding tri-community. Quality parts, fair prices, and warranty on every repair.",
    neighborhoods: ["Downtown Moncton", "Dieppe", "Riverview", "Magnetic Hill", "North End", "Sunny Brae"],
    hours: "Mon–Fri 9am–6pm · Sat 10am–4pm",
    turnaround: "Most repairs completed within 1–2 hours."
  },
  {
    slug: "halifax",
    name: "Halifax",
    province: "Nova Scotia",
    region: "NS",
    tagline: "Halifax's friendly neighbourhood phone repair shop.",
    intro:
      "Covering Halifax, Dartmouth, Bedford and Sackville. Student-friendly pricing and bulk repair contracts for local businesses.",
    neighborhoods: ["Downtown Halifax", "North End", "South End", "Dartmouth", "Bedford", "Sackville", "Clayton Park"],
    hours: "Mon–Sat 9am–6pm · Sun 12pm–5pm",
    turnaround: "Express service available — most screens done while you wait."
  }
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
