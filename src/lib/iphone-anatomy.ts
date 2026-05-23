export type AnatomyPart = {
  key: string;
  name: string;
  position: "top" | "upper" | "middle" | "lower" | "bottom" | "back" | "side";
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  whatItDoes: string;
  howToFix: string;
  partCategory: string; // matches Part.category in DB so we can deep-link to /parts?category=
};

export type AnatomyModel = {
  slug: string;
  name: string;
  year: number;
  generation: string;
  variant?: "base" | "mini" | "plus" | "pro" | "pro-max" | "se";
  introBlurb: string;
  parts: AnatomyPart[];
};

// ----- Reusable part definitions -----
const PARTS = {
  screen: {
    name: "Display assembly (OLED)",
    difficulty: "Medium" as const,
    whatItDoes:
      "OLED Super Retina XDR panel + glass + digitizer + Face ID sensors, bonded into one unit. Apple Pro models also include ProMotion 120Hz refresh.",
    howToFix:
      "Power off, remove pentalobe screws at the charging port, suction-lift the screen, transfer the front-camera and earpiece flex to the new assembly. Re-calibrate True Tone with a programmer to keep that feature working.",
    partCategory: "screen"
  },
  screenLCD: {
    name: "Display assembly (LCD)",
    difficulty: "Easy" as const,
    whatItDoes:
      "Retina HD LCD panel with home-button cutout (SE models). Simpler to replace than OLED because there's no True Tone pair-locking on these.",
    howToFix:
      "Standard pentalobe removal at the charging port, screen lifts up like a book toward the home button. Transfer earpiece + front camera + Touch ID flex to the new unit (Touch ID stops working if you skip the transfer).",
    partCategory: "screen"
  },
  frontCameraFaceId: {
    name: "Front camera + Face ID sensor",
    difficulty: "Hard" as const,
    whatItDoes:
      "Selfie camera, dot projector, flood illuminator and infrared camera. The dot projector is pair-locked to the logic board on Pro models — non-OEM kits break Face ID.",
    howToFix:
      "Open the screen, transfer the original Face ID dot projector to the new module. On non-Pro phones, simply unscrew the bracket and unplug the flex.",
    partCategory: "camera"
  },
  homeButton: {
    name: "Home button (Touch ID)",
    difficulty: "Hard" as const,
    whatItDoes:
      "Capacitive Touch ID sensor under a sapphire-glass home button (SE 2/3). Pair-locked to the original logic board — only the original button reads fingerprints.",
    howToFix:
      "Carefully remove the bracket on the inside of the screen. The button itself can be transferred, but if it's damaged Touch ID functionality is lost — only the click physically works.",
    partCategory: "other"
  },
  rearWide: {
    name: "Wide camera (rear)",
    difficulty: "Medium" as const,
    whatItDoes:
      "Main 12 or 48 MP wide-angle camera. Handles most photos, has optical image stabilization. Most common rear camera failure.",
    howToFix:
      "Disconnect battery, unscrew the camera bracket, lift the module out, plug the new one in. Test OIS before reassembling.",
    partCategory: "camera"
  },
  rearUltraWide: {
    name: "Ultra-wide camera (rear)",
    difficulty: "Medium" as const,
    whatItDoes:
      "0.5× ultra-wide-angle 12 MP camera for landscape shots and macro on Pro models. Shares the same module bracket as the wide camera.",
    howToFix: "Replaced as part of the rear camera module bracket — usually swapped together with the wide camera.",
    partCategory: "camera"
  },
  rearTelephoto: {
    name: "Telephoto camera (Pro only)",
    difficulty: "Hard" as const,
    whatItDoes:
      "2× / 3× / 5× optical zoom lens. Pro Max models often have a tetraprism telephoto for longer reach. Common to fail on drops because of the OIS coil.",
    howToFix:
      "Telephoto is part of the camera assembly bracket — swap the whole module. Test focus at infinity and OIS shake before sealing.",
    partCategory: "camera"
  },
  lidar: {
    name: "LiDAR scanner (Pro only)",
    difficulty: "Hard" as const,
    whatItDoes:
      "Time-of-flight depth sensor for low-light autofocus, Night Mode portraits and AR apps. Black dot beside the camera lenses.",
    howToFix: "Integrated into the rear camera assembly. Replaced as part of the bracket; no standalone swap.",
    partCategory: "camera"
  },
  rearSingle: {
    name: "Single rear camera",
    difficulty: "Easy" as const,
    whatItDoes:
      "Single 12 MP wide camera (SE models). No optical zoom, no ultra-wide. Held in with two screws.",
    howToFix: "Disconnect battery, unscrew the metal shield over the camera, lift it out, plug the replacement in.",
    partCategory: "camera"
  },
  battery: {
    name: "Battery",
    difficulty: "Easy" as const,
    whatItDoes:
      "Lithium-ion cell. Capacity varies: mini ~2400 mAh, base ~3000–3500 mAh, Pro Max/Plus ~4400 mAh. Held in by pull-tab adhesive strips (or electrical-debond adhesive on iPhone 16 Pro).",
    howToFix:
      "Disconnect the battery flex, pull the adhesive strips parallel to the back of the phone (heat helps if they snap). Drop the new battery in, reconnect, and pair with a programmer to clear the iOS \"Service\" warning.",
    partCategory: "battery"
  },
  batteryLarge: {
    name: "Battery (large capacity)",
    difficulty: "Easy" as const,
    whatItDoes:
      "Higher-capacity li-ion cell used in Plus and Pro Max models (~4400 mAh). Same form-factor swap as the smaller batteries, just costs more.",
    howToFix: "Identical procedure to the standard battery — pull adhesive strips, lift out, drop the new one in, pair with a programmer.",
    partCategory: "battery"
  },
  logicBoard: {
    name: "Logic board",
    difficulty: "Expert" as const,
    whatItDoes:
      "Apple A-series SoC, RAM, NAND storage, baseband modem, NFC and PMIC. The heart of the phone. Pair-locks Face ID, Touch ID, True Tone and battery health.",
    howToFix: "Board-level repair only. Not a typical end-user fix. We diagnose, microscope-solder and reflow at the shop.",
    partCategory: "other"
  },
  chargingPortLightning: {
    name: "Charging port (Lightning)",
    difficulty: "Medium" as const,
    whatItDoes:
      "Lightning connector (iPhone 11 through 14 series + SE). Includes bottom microphone and antenna ground. Frequent failure point from lint and bent pins.",
    howToFix:
      "Try compressed air first. If that fails, pry off the speaker bracket, undo the screws around the port, swap the flex cable.",
    partCategory: "charging-port"
  },
  chargingPortUSBC: {
    name: "Charging port (USB-C)",
    difficulty: "Medium" as const,
    whatItDoes:
      "USB-C connector (iPhone 15+). Supports faster wired charging and USB 3 data on Pro models. Same lint-vulnerability as Lightning.",
    howToFix: "Same physical procedure as Lightning swap. USB 3 controller is on the logic board — port replacement won't restore data speeds if the controller failed.",
    partCategory: "charging-port"
  },
  loudspeaker: {
    name: "Loudspeaker (bottom)",
    difficulty: "Easy" as const,
    whatItDoes: "Bottom-firing speaker for ringer, media playback and speakerphone. Often gets muffled by dust in the grille.",
    howToFix: "Open from the screen side, disconnect the speaker flex, unscrew the bracket, lift out. Replace with a model-specific unit.",
    partCategory: "speaker"
  },
  earpiece: {
    name: "Earpiece speaker",
    difficulty: "Easy" as const,
    whatItDoes: "Speaker against your ear during calls. Doubles as the top stereo speaker on most models.",
    howToFix: "Open the screen, locate the earpiece module above the front camera, disconnect and swap.",
    partCategory: "speaker"
  },
  taptic: {
    name: "Taptic Engine (vibration motor)",
    difficulty: "Easy" as const,
    whatItDoes: "Apple's linear-resonance vibration motor for haptic feedback. Single largest replacement after the battery.",
    howToFix: "Visible to the left or right of the battery. Unscrew the bracket, lift out, swap.",
    partCategory: "other"
  },
  backGlass: {
    name: "Back glass",
    difficulty: "Hard" as const,
    whatItDoes: "Cosmetic rear panel. Also houses the wireless charging coil and MagSafe magnets (iPhone 12+).",
    howToFix: "Laser removal preferred (preserves wireless coil). Heat-pad + plastic-pick method works in a pinch. iPhone 14+ have a separately-removable back panel for easier swaps.",
    partCategory: "housing"
  },
  cameraControl: {
    name: "Camera Control button (iPhone 16 Pro)",
    difficulty: "Hard" as const,
    whatItDoes: "New capacitive + force-sensitive side button for camera shutter, zoom and focus. Right edge, below the power button.",
    howToFix: "Replacement requires removing the side frame insert. Calibration of the force sensor needed afterward.",
    partCategory: "buttons"
  }
} satisfies Record<string, Omit<AnatomyPart, "key" | "position">>;

function part(key: keyof typeof PARTS, position: AnatomyPart["position"]): AnatomyPart {
  return { key, position, ...PARTS[key] };
}

// ----- Layout builders -----
type Variant = "base" | "mini" | "plus" | "pro" | "pro-max" | "se";

function modernLayout(variant: Variant, usesUsbC: boolean): AnatomyPart[] {
  const layout: AnatomyPart[] = [
    part("frontCameraFaceId", "top"),
    part("earpiece", "top"),
    part("rearWide", "upper"),
    part("rearUltraWide", "upper"),
    part("logicBoard", "upper")
  ];
  if (variant === "pro" || variant === "pro-max") {
    layout.push(part("rearTelephoto", "upper"));
    layout.push(part("lidar", "upper"));
  }
  if (variant === "pro-max" || variant === "plus") {
    layout.push(part("batteryLarge", "middle"));
  } else {
    layout.push(part("battery", "middle"));
  }
  layout.push(part("taptic", "lower"));
  layout.push(usesUsbC ? part("chargingPortUSBC", "bottom") : part("chargingPortLightning", "bottom"));
  layout.push(part("loudspeaker", "bottom"));
  layout.push(part("backGlass", "back"));
  layout.push(part("screen", "top"));
  return layout;
}

function seLayout(): AnatomyPart[] {
  return [
    part("screenLCD", "top"),
    part("homeButton", "bottom"),
    part("earpiece", "top"),
    part("rearSingle", "upper"),
    part("logicBoard", "upper"),
    part("battery", "middle"),
    part("taptic", "lower"),
    part("chargingPortLightning", "bottom"),
    part("loudspeaker", "bottom"),
    part("backGlass", "back")
  ];
}

function withCameraControl(parts: AnatomyPart[]): AnatomyPart[] {
  return [...parts, part("cameraControl", "side")];
}

// ----- Models -----
function model(opts: {
  slug: string;
  name: string;
  year: number;
  generation: string;
  variant: Variant;
  introBlurb: string;
  parts: AnatomyPart[];
}): AnatomyModel {
  return opts;
}

export const ANATOMY_MODELS: AnatomyModel[] = [
  // SE models
  model({
    slug: "iphone-se-2020",
    name: "iPhone SE (2020)",
    year: 2020,
    generation: "SE",
    variant: "se",
    introBlurb: "Second-gen SE — iPhone 8 body with the A13 chip from the iPhone 11. Touch ID home button, single rear camera, easiest modern iPhone to repair.",
    parts: seLayout()
  }),
  model({
    slug: "iphone-se-2022",
    name: "iPhone SE (2022)",
    year: 2022,
    generation: "SE",
    variant: "se",
    introBlurb: "Third-gen SE — same body as the 2020 model with the A15 chip and 5G. Internally near-identical, parts are largely cross-compatible.",
    parts: seLayout()
  }),

  // 11 series
  model({ slug: "iphone-11", name: "iPhone 11", year: 2019, generation: "11 series", variant: "base", introBlurb: "Dual rear cameras (wide + ultra-wide), Liquid Retina HD LCD, A13 Bionic. One of the easiest modern iPhones to repair.", parts: modernLayout("base", false) }),
  model({ slug: "iphone-11-pro", name: "iPhone 11 Pro", year: 2019, generation: "11 series", variant: "pro", introBlurb: "First Pro-branded iPhone — triple-camera (wide + ultra-wide + 2× telephoto), Super Retina XDR OLED. No LiDAR yet on the 11 Pro.", parts: modernLayout("pro", false).filter(p => p.key !== "lidar") }),
  model({ slug: "iphone-11-pro-max", name: "iPhone 11 Pro Max", year: 2019, generation: "11 series", variant: "pro-max", introBlurb: "Larger 6.5\" OLED + same triple-camera system as the 11 Pro. Largest battery of the 11 series.", parts: modernLayout("pro-max", false).filter(p => p.key !== "lidar") }),

  // 12 series
  model({ slug: "iphone-12-mini", name: "iPhone 12 mini", year: 2020, generation: "12 series", variant: "mini", introBlurb: "Compact 5.4\" OLED, MagSafe, dual rear cameras. The mini battery is small — most common upgrade.", parts: modernLayout("mini", false) }),
  model({ slug: "iphone-12", name: "iPhone 12", year: 2020, generation: "12 series", variant: "base", introBlurb: "First MagSafe iPhone with the redesigned flat-edge body. OLED Super Retina XDR + A14 Bionic.", parts: modernLayout("base", false) }),
  model({ slug: "iphone-12-pro", name: "iPhone 12 Pro", year: 2020, generation: "12 series", variant: "pro", introBlurb: "Triple rear camera (wide + ultra-wide + 2× telephoto) plus first iPhone with LiDAR. Stainless-steel frame.", parts: modernLayout("pro", false) }),
  model({ slug: "iphone-12-pro-max", name: "iPhone 12 Pro Max", year: 2020, generation: "12 series", variant: "pro-max", introBlurb: "Larger 6.7\" OLED, bigger sensor on the wide camera, 2.5× telephoto. Largest battery in the 12 series.", parts: modernLayout("pro-max", false) }),

  // 13 series
  model({ slug: "iphone-13-mini", name: "iPhone 13 mini", year: 2021, generation: "13 series", variant: "mini", introBlurb: "Last mini Apple made. 5.4\" OLED, diagonal rear cameras, smaller notch. Still small enough for one-handed use.", parts: modernLayout("mini", false) }),
  model({ slug: "iphone-13", name: "iPhone 13", year: 2021, generation: "13 series", variant: "base", introBlurb: "Bigger battery vs iPhone 12, smaller notch, diagonal rear camera layout. Same easy construction as the 12.", parts: modernLayout("base", false) }),
  model({ slug: "iphone-13-pro", name: "iPhone 13 Pro", year: 2021, generation: "13 series", variant: "pro", introBlurb: "First iPhone with ProMotion 120Hz OLED. Triple rear camera + LiDAR. 3× telephoto.", parts: modernLayout("pro", false) }),
  model({ slug: "iphone-13-pro-max", name: "iPhone 13 Pro Max", year: 2021, generation: "13 series", variant: "pro-max", introBlurb: "ProMotion 6.7\" OLED, 3× telephoto, biggest battery of the 13 series. Same internals as 13 Pro otherwise.", parts: modernLayout("pro-max", false) }),

  // 14 series
  model({ slug: "iphone-14", name: "iPhone 14", year: 2022, generation: "14 series", variant: "base", introBlurb: "First back-glass-removable design — screen and rear panel are independently serviceable. Massive win for repair time.", parts: modernLayout("base", false) }),
  model({ slug: "iphone-14-plus", name: "iPhone 14 Plus", year: 2022, generation: "14 series", variant: "plus", introBlurb: "First 'Plus' since the iPhone 8 Plus. 6.7\" OLED, big battery, non-Pro internals. Same dual-entry design as the regular 14.", parts: modernLayout("plus", false) }),
  model({ slug: "iphone-14-pro", name: "iPhone 14 Pro", year: 2022, generation: "14 series", variant: "pro", introBlurb: "Dynamic Island debuts. Always-on display, A16 Bionic, 48 MP wide camera, 3× telephoto, LiDAR.", parts: modernLayout("pro", false) }),
  model({ slug: "iphone-14-pro-max", name: "iPhone 14 Pro Max", year: 2022, generation: "14 series", variant: "pro-max", introBlurb: "Dynamic Island, always-on, 48 MP main, 3× telephoto. Largest battery in the 14 series.", parts: modernLayout("pro-max", false) }),

  // 15 series
  model({ slug: "iphone-15", name: "iPhone 15", year: 2023, generation: "15 series", variant: "base", introBlurb: "USB-C debuts on iPhone. 48 MP wide camera trickled down from Pro. Dynamic Island now on the base model.", parts: modernLayout("base", true) }),
  model({ slug: "iphone-15-plus", name: "iPhone 15 Plus", year: 2023, generation: "15 series", variant: "plus", introBlurb: "6.7\" OLED, USB-C, 48 MP wide camera, large battery. Non-Pro internals.", parts: modernLayout("plus", true) }),
  model({ slug: "iphone-15-pro", name: "iPhone 15 Pro", year: 2023, generation: "15 series", variant: "pro", introBlurb: "Titanium frame, A17 Pro, USB-C with USB 3 speeds, 3× telephoto, LiDAR, customizable Action button.", parts: modernLayout("pro", true) }),
  model({ slug: "iphone-15-pro-max", name: "iPhone 15 Pro Max", year: 2023, generation: "15 series", variant: "pro-max", introBlurb: "Tetraprism 5× telephoto debuts (only on Pro Max). Titanium frame, USB 3, Action button.", parts: modernLayout("pro-max", true) }),

  // 16 series
  model({ slug: "iphone-16", name: "iPhone 16", year: 2024, generation: "16 series", variant: "base", introBlurb: "Apple Intelligence-ready neural engine, vertical rear camera layout, Camera Control button on Pro. Same dual-entry repairable design.", parts: modernLayout("base", true) }),
  model({ slug: "iphone-16-plus", name: "iPhone 16 Plus", year: 2024, generation: "16 series", variant: "plus", introBlurb: "6.7\" OLED with Apple Intelligence. Large battery, vertical rear camera. Same internals as the 16 in a bigger chassis.", parts: modernLayout("plus", true) }),
  model({ slug: "iphone-16-pro", name: "iPhone 16 Pro", year: 2024, generation: "16 series", variant: "pro", introBlurb: "First iPhone with the Camera Control button. A18 Pro, 5× telephoto trickled down from Pro Max, electrical-debond battery adhesive.", parts: withCameraControl(modernLayout("pro", true)) }),
  model({ slug: "iphone-16-pro-max", name: "iPhone 16 Pro Max", year: 2024, generation: "16 series", variant: "pro-max", introBlurb: "Largest screen Apple sells. Camera Control button, 5× tetraprism telephoto, A18 Pro, biggest battery of the 16 series.", parts: withCameraControl(modernLayout("pro-max", true)) })
];

export function getAnatomyModel(slug: string): AnatomyModel | undefined {
  return ANATOMY_MODELS.find((m) => m.slug === slug);
}

export function partsByPosition(parts: AnatomyPart[]): Record<AnatomyPart["position"], AnatomyPart[]> {
  const grouped: Record<AnatomyPart["position"], AnatomyPart[]> = {
    top: [], upper: [], middle: [], lower: [], bottom: [], back: [], side: []
  };
  for (const p of parts) grouped[p.position].push(p);
  return grouped;
}

export function groupedByGeneration(): { generation: string; models: AnatomyModel[] }[] {
  const map = new Map<string, AnatomyModel[]>();
  for (const m of ANATOMY_MODELS) {
    if (!map.has(m.generation)) map.set(m.generation, []);
    map.get(m.generation)!.push(m);
  }
  // SE first (entry-level), then 11 → 16 in order
  const sortKey = (g: string) => (g === "SE" ? "0" : g);
  return Array.from(map.entries())
    .sort(([a], [b]) => sortKey(a).localeCompare(sortKey(b)))
    .map(([generation, models]) => ({ generation, models }));
}

export const VARIANT_LABEL: Record<NonNullable<AnatomyModel["variant"]>, string> = {
  base: "Standard",
  mini: "Mini",
  plus: "Plus",
  pro: "Pro",
  "pro-max": "Pro Max",
  se: "SE"
};

export const VARIANT_BADGE_COLOR: Record<NonNullable<AnatomyModel["variant"]>, string> = {
  base: "bg-gray-100 text-gray-700",
  mini: "bg-emerald-100 text-emerald-800",
  plus: "bg-blue-100 text-blue-800",
  pro: "bg-purple-100 text-purple-800",
  "pro-max": "bg-amber-100 text-amber-800",
  se: "bg-pink-100 text-pink-800"
};
