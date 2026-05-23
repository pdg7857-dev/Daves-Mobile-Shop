export type AnatomyPart = {
  key: string;
  name: string;
  position: "top" | "upper" | "middle" | "lower" | "bottom" | "back";
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  whatItDoes: string;
  howToFix: string;
  partCategory: string;
};

export type AnatomyModel = {
  slug: string;
  name: string;
  year: number;
  generation: string;
  introBlurb: string;
  parts: AnatomyPart[];
};

const COMMON_PARTS: Record<string, Omit<AnatomyPart, "key" | "position">> = {
  screen: { name: "Display assembly", difficulty: "Medium", whatItDoes: "OLED or LCD panel + glass + digitizer + Face ID/True Tone sensors, bonded into one unit. Handles all your taps and what you see.", howToFix: "Power off, remove pentalobe screws at the lightning/USB-C port, suction-lift the screen, transfer the front-camera and earpiece flex to the new assembly. Recalibrate True Tone with a programmer if you want to keep it.", partCategory: "screen" },
  frontCamera: { name: "Front camera + Face ID sensor", difficulty: "Hard", whatItDoes: "Selfie camera, dot projector, flood illuminator and infrared camera for Face ID. The Face ID components are pair-locked to the logic board on Pro models.", howToFix: "Open screen, transfer the original Face ID dot projector to the new module (otherwise Face ID stops working). On non-Pro phones, simply unscrew the bracket and unplug the flex.", partCategory: "camera" },
  rearCamera: { name: "Rear camera module", difficulty: "Medium", whatItDoes: "Wide, ultra-wide and (Pro) telephoto/LiDAR lenses with optical image stabilization. Connects to the logic board via a wide ribbon cable.", howToFix: "Open back/screen depending on model, disconnect battery, unscrew the camera bracket, lift out and replace. Check stabilization works before reassembling.", partCategory: "camera" },
  battery: { name: "Battery", difficulty: "Easy", whatItDoes: "Lithium-ion cell, typically 3000–4400 mAh depending on model. Held in by pull-tab adhesive strips.", howToFix: "Disconnect battery flex, pull the adhesive strips out parallel to the back of the phone (heat helps). Drop in the new battery, reconnect, and pair with a programmer to clear the iOS \"Service\" warning.", partCategory: "battery" },
  logicBoard: { name: "Logic board", difficulty: "Expert", whatItDoes: "Apple A-series SoC, RAM, NAND storage, baseband modem, NFC and PMIC. The heart of the phone. Pair-locks Face ID, Touch ID, True Tone and battery health.", howToFix: "Board-level repair only. Not a typical end-user fix. We diagnose, microscope-solder and reflow at the shop.", partCategory: "other" },
  chargingPort: { name: "Charging port assembly", difficulty: "Medium", whatItDoes: "Lightning (iPhone 11–14) or USB-C (iPhone 15+) connector, plus the bottom microphone and antenna ground. Frequent failure point from lint and bent pins.", howToFix: "Try compressed air and a SIM tool to clean it first. If that fails, replace the flex cable — pry off the speaker bracket, undo the screws around the port, swap and reseat.", partCategory: "charging-port" },
  loudspeaker: { name: "Loudspeaker (bottom)", difficulty: "Easy", whatItDoes: "Bottom-firing speaker for ringer, media playback and speakerphone. Often gets muffled by dust in the grille.", howToFix: "Open phone from the screen side, disconnect the speaker flex, unscrew the bracket and lift out. Replace with a unit specific to your model.", partCategory: "speaker" },
  earpiece: { name: "Earpiece speaker", difficulty: "Easy", whatItDoes: "The speaker you put against your ear during calls. Doubles as the top stereo speaker on most models.", howToFix: "Open the screen, locate the earpiece module above the front camera, disconnect and swap.", partCategory: "speaker" },
  vibrationMotor: { name: "Taptic Engine (vibration motor)", difficulty: "Easy", whatItDoes: "Apple's linear-resonance vibration motor that gives you haptic feedback for typing, notifications and 3D Touch-style actions.", howToFix: "Visible to the left or right of the battery on most boards. Unscrew the bracket, lift out, swap.", partCategory: "other" },
  backGlass: { name: "Back glass", difficulty: "Hard", whatItDoes: "Cosmetic rear panel — also houses the wireless charging coil and MagSafe magnets on most models.", howToFix: "Laser-removal preferred (no heat damage to the wireless coil) but a teardown + heat-pad approach works. We recommend the shop unless you have laser equipment.", partCategory: "housing" }
};

function makePart(key: keyof typeof COMMON_PARTS, position: AnatomyPart["position"]): AnatomyPart {
  return { key, position, ...COMMON_PARTS[key] };
}

const STANDARD_LAYOUT: AnatomyPart[] = [
  makePart("frontCamera", "top"),
  makePart("earpiece", "top"),
  makePart("rearCamera", "upper"),
  makePart("logicBoard", "upper"),
  makePart("battery", "middle"),
  makePart("vibrationMotor", "lower"),
  makePart("chargingPort", "bottom"),
  makePart("loudspeaker", "bottom"),
  makePart("backGlass", "back"),
  makePart("screen", "top")
];

export const ANATOMY_MODELS: AnatomyModel[] = [
  { slug: "iphone-11", name: "iPhone 11", year: 2019, generation: "11 series", introBlurb: "Dual-camera (wide + ultra-wide), Liquid Retina HD LCD, A13 Bionic. Still one of the easiest modern iPhones to repair.", parts: STANDARD_LAYOUT },
  { slug: "iphone-12", name: "iPhone 12", year: 2020, generation: "12 series", introBlurb: "First MagSafe iPhone. OLED Super Retina XDR display, A14 Bionic, and the redesigned flat-edge body.", parts: STANDARD_LAYOUT },
  { slug: "iphone-13", name: "iPhone 13", year: 2021, generation: "13 series", introBlurb: "Bigger battery, smaller notch, diagonal rear camera layout. Same easy-to-open construction as the 12.", parts: STANDARD_LAYOUT },
  { slug: "iphone-14", name: "iPhone 14", year: 2022, generation: "14 series", introBlurb: "Apple's first back-glass-removable design — the screen and rear panel are independently serviceable. Big win for repairs.", parts: STANDARD_LAYOUT },
  { slug: "iphone-15", name: "iPhone 15", year: 2023, generation: "15 series", introBlurb: "USB-C debuts. Same dual-entry design as iPhone 14. Titanium frame on Pro models, lighter and stiffer.", parts: STANDARD_LAYOUT },
  { slug: "iphone-16", name: "iPhone 16", year: 2024, generation: "16 series", introBlurb: "Camera Control button, Apple Intelligence neural engine, vertical camera layout (non-Pro). Battery swap via electrical-debond adhesive on Pro.", parts: STANDARD_LAYOUT }
];

export function getAnatomyModel(slug: string): AnatomyModel | undefined {
  return ANATOMY_MODELS.find((m) => m.slug === slug);
}

export function partsByPosition(parts: AnatomyPart[]): Record<AnatomyPart["position"], AnatomyPart[]> {
  const grouped: Record<AnatomyPart["position"], AnatomyPart[]> = { top: [], upper: [], middle: [], lower: [], bottom: [], back: [] };
  for (const p of parts) grouped[p.position].push(p);
  return grouped;
}
