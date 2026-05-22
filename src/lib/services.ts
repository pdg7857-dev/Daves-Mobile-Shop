export type Service = {
  slug: string;
  name: string;
  short: string;
  description: string;
  startingPrice: string;
  turnaround: string;
  icon: string; // emoji used as a lightweight visual cue — replace with SVGs later
};

export const SERVICES: Service[] = [
  {
    slug: "screen",
    name: "Screen Repair",
    short: "Cracked or unresponsive screen",
    description:
      "OEM and aftermarket display replacements for iPhone, Samsung, Google Pixel and most other smartphones. We test full touch, 3D Touch, True Tone and front-camera alignment before handing it back.",
    startingPrice: "$89",
    turnaround: "30–60 min",
    icon: "📱"
  },
  {
    slug: "battery",
    name: "Battery Replacement",
    short: "Phone dying too fast?",
    description:
      "Genuine OEM batteries with calibration. Restores full-day battery life and removes the iOS \"Service\" warning. Includes adhesive reseal and water-resistance check where applicable.",
    startingPrice: "$59",
    turnaround: "30–45 min",
    icon: "🔋"
  },
  {
    slug: "camera",
    name: "Camera Repair",
    short: "Blurry, broken, or shattered camera lens",
    description:
      "Front and rear camera module replacement, lens cover replacement and focus/stabilization calibration. We fix the camera body and the glass — most shops only do one.",
    startingPrice: "$69",
    turnaround: "45–90 min",
    icon: "📷"
  },
  {
    slug: "housing",
    name: "Back Glass / Housing Replacement",
    short: "Cracked rear glass or bent frame",
    description:
      "Full back-glass replacement using laser-removal (no heat damage to wireless coils). Housing swaps available for severely damaged frames.",
    startingPrice: "$99",
    turnaround: "1–3 hours",
    icon: "🔧"
  },
  {
    slug: "charging-port",
    name: "Charging Port Repair",
    short: "Loose, dirty, or non-working port",
    description:
      "Cleaning, flex-cable replacement, and full port assembly swap. Most charging problems are fixable — don't replace the phone yet.",
    startingPrice: "$49",
    turnaround: "30–60 min",
    icon: "🔌"
  },
  {
    slug: "water-damage",
    name: "Water Damage Diagnostic",
    short: "Dropped it in the pool?",
    description:
      "Full teardown, ultrasonic board cleaning, corrosion treatment and component-level repair where possible. Free diagnostic — you only pay if we can fix it.",
    startingPrice: "$0 diagnostic",
    turnaround: "1–3 days",
    icon: "💧"
  },
  {
    slug: "speaker",
    name: "Speaker / Earpiece Repair",
    short: "Muffled or silent calls and music",
    description:
      "Loud-speaker, earpiece and microphone replacement. We also clean speaker grilles for free with any other repair.",
    startingPrice: "$39",
    turnaround: "30–60 min",
    icon: "🔊"
  },
  {
    slug: "buttons",
    name: "Button Repair",
    short: "Power, volume or home button issues",
    description:
      "Power, volume rocker and home-button repair or replacement. Includes Touch ID re-pairing where possible.",
    startingPrice: "$45",
    turnaround: "1–2 hours",
    icon: "🔘"
  },
  {
    slug: "data-recovery",
    name: "Data Recovery",
    short: "Phone won't turn on — but your photos are inside",
    description:
      "Specialized chip-level recovery for dead devices. We've recovered data from drowned, smashed and motherboard-failed phones. Free quote.",
    startingPrice: "Quote-based",
    turnaround: "2–7 days",
    icon: "💾"
  },
  {
    slug: "software",
    name: "Software & Unlocking",
    short: "Stuck phones, iCloud locks, carrier unlocks",
    description:
      "iOS / Android software repair, factory reset assistance, network unlocking for carrier-locked devices (where legally permitted).",
    startingPrice: "$30",
    turnaround: "Same day",
    icon: "🛠️"
  }
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
