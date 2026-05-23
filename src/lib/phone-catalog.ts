// Phone catalog used by admin dropdowns: brand -> model -> storage / color options.
// Keep it focused on devices we actually buy/sell/repair in Ontario; admins can
// always type a custom value via the "Other…" option in the UI.

export type PhoneModel = {
  slug: string;
  name: string;
  storageOptions: string[];
  colorOptions: string[];
};

export type PhoneBrand = {
  slug: string;
  name: string;
  models: PhoneModel[];
};

const APPLE_MODELS: PhoneModel[] = [
  { slug: "iphone-se-2020", name: "iPhone SE (2020)", storageOptions: ["64GB", "128GB", "256GB"], colorOptions: ["Black", "White", "(PRODUCT)RED"] },
  { slug: "iphone-se-2022", name: "iPhone SE (2022)", storageOptions: ["64GB", "128GB", "256GB"], colorOptions: ["Midnight", "Starlight", "(PRODUCT)RED"] },

  { slug: "iphone-11", name: "iPhone 11", storageOptions: ["64GB", "128GB", "256GB"], colorOptions: ["Black", "White", "Purple", "Yellow", "Green", "(PRODUCT)RED"] },
  { slug: "iphone-11-pro", name: "iPhone 11 Pro", storageOptions: ["64GB", "256GB", "512GB"], colorOptions: ["Midnight Green", "Space Gray", "Silver", "Gold"] },
  { slug: "iphone-11-pro-max", name: "iPhone 11 Pro Max", storageOptions: ["64GB", "256GB", "512GB"], colorOptions: ["Midnight Green", "Space Gray", "Silver", "Gold"] },

  { slug: "iphone-12-mini", name: "iPhone 12 mini", storageOptions: ["64GB", "128GB", "256GB"], colorOptions: ["Black", "White", "Blue", "Green", "Purple", "(PRODUCT)RED"] },
  { slug: "iphone-12", name: "iPhone 12", storageOptions: ["64GB", "128GB", "256GB"], colorOptions: ["Black", "White", "Blue", "Green", "Purple", "(PRODUCT)RED"] },
  { slug: "iphone-12-pro", name: "iPhone 12 Pro", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Pacific Blue", "Graphite", "Silver", "Gold"] },
  { slug: "iphone-12-pro-max", name: "iPhone 12 Pro Max", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Pacific Blue", "Graphite", "Silver", "Gold"] },

  { slug: "iphone-13-mini", name: "iPhone 13 mini", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Midnight", "Starlight", "Blue", "Pink", "Green", "(PRODUCT)RED"] },
  { slug: "iphone-13", name: "iPhone 13", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Midnight", "Starlight", "Blue", "Pink", "Green", "(PRODUCT)RED"] },
  { slug: "iphone-13-pro", name: "iPhone 13 Pro", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Graphite", "Silver", "Gold", "Sierra Blue", "Alpine Green"] },
  { slug: "iphone-13-pro-max", name: "iPhone 13 Pro Max", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Graphite", "Silver", "Gold", "Sierra Blue", "Alpine Green"] },

  { slug: "iphone-14", name: "iPhone 14", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Midnight", "Starlight", "Blue", "Purple", "Yellow", "(PRODUCT)RED"] },
  { slug: "iphone-14-plus", name: "iPhone 14 Plus", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Midnight", "Starlight", "Blue", "Purple", "Yellow", "(PRODUCT)RED"] },
  { slug: "iphone-14-pro", name: "iPhone 14 Pro", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Space Black", "Silver", "Gold", "Deep Purple"] },
  { slug: "iphone-14-pro-max", name: "iPhone 14 Pro Max", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Space Black", "Silver", "Gold", "Deep Purple"] },

  { slug: "iphone-15", name: "iPhone 15", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Black", "Blue", "Green", "Yellow", "Pink"] },
  { slug: "iphone-15-plus", name: "iPhone 15 Plus", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Black", "Blue", "Green", "Yellow", "Pink"] },
  { slug: "iphone-15-pro", name: "iPhone 15 Pro", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"] },
  { slug: "iphone-15-pro-max", name: "iPhone 15 Pro Max", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"] },

  { slug: "iphone-16", name: "iPhone 16", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Black", "White", "Pink", "Teal", "Ultramarine"] },
  { slug: "iphone-16-plus", name: "iPhone 16 Plus", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Black", "White", "Pink", "Teal", "Ultramarine"] },
  { slug: "iphone-16-pro", name: "iPhone 16 Pro", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"] },
  { slug: "iphone-16-pro-max", name: "iPhone 16 Pro Max", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"] }
];

const SAMSUNG_MODELS: PhoneModel[] = [
  { slug: "galaxy-s21", name: "Galaxy S21", storageOptions: ["128GB", "256GB"], colorOptions: ["Phantom Gray", "Phantom White", "Phantom Violet", "Phantom Pink"] },
  { slug: "galaxy-s21-plus", name: "Galaxy S21+", storageOptions: ["128GB", "256GB"], colorOptions: ["Phantom Black", "Phantom Silver", "Phantom Violet"] },
  { slug: "galaxy-s21-ultra", name: "Galaxy S21 Ultra", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Phantom Black", "Phantom Silver", "Phantom Titanium", "Phantom Navy"] },

  { slug: "galaxy-s22", name: "Galaxy S22", storageOptions: ["128GB", "256GB"], colorOptions: ["Phantom Black", "Phantom White", "Green", "Pink Gold"] },
  { slug: "galaxy-s22-plus", name: "Galaxy S22+", storageOptions: ["128GB", "256GB"], colorOptions: ["Phantom Black", "Phantom White", "Green", "Pink Gold"] },
  { slug: "galaxy-s22-ultra", name: "Galaxy S22 Ultra", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Phantom Black", "Phantom White", "Burgundy", "Green"] },

  { slug: "galaxy-s23", name: "Galaxy S23", storageOptions: ["128GB", "256GB"], colorOptions: ["Phantom Black", "Cream", "Green", "Lavender"] },
  { slug: "galaxy-s23-plus", name: "Galaxy S23+", storageOptions: ["256GB", "512GB"], colorOptions: ["Phantom Black", "Cream", "Green", "Lavender"] },
  { slug: "galaxy-s23-ultra", name: "Galaxy S23 Ultra", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Phantom Black", "Cream", "Green", "Lavender"] },

  { slug: "galaxy-s24", name: "Galaxy S24", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"] },
  { slug: "galaxy-s24-plus", name: "Galaxy S24+", storageOptions: ["256GB", "512GB"], colorOptions: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"] },
  { slug: "galaxy-s24-ultra", name: "Galaxy S24 Ultra", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"] },

  { slug: "galaxy-s25", name: "Galaxy S25", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Navy", "Silver Shadow", "Icy Blue", "Mint"] },
  { slug: "galaxy-s25-plus", name: "Galaxy S25+", storageOptions: ["256GB", "512GB"], colorOptions: ["Navy", "Silver Shadow", "Icy Blue", "Mint"] },
  { slug: "galaxy-s25-ultra", name: "Galaxy S25 Ultra", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Titanium Silverblue", "Titanium Black", "Titanium Whitesilver", "Titanium Gray"] },

  { slug: "galaxy-a14", name: "Galaxy A14", storageOptions: ["64GB", "128GB"], colorOptions: ["Black", "Silver", "Light Green"] },
  { slug: "galaxy-a15", name: "Galaxy A15", storageOptions: ["128GB", "256GB"], colorOptions: ["Blue Black", "Blue", "Yellow", "Light Blue"] },
  { slug: "galaxy-a54", name: "Galaxy A54", storageOptions: ["128GB", "256GB"], colorOptions: ["Awesome Graphite", "Awesome Violet", "Awesome White", "Awesome Lime"] },

  { slug: "galaxy-z-flip-4", name: "Galaxy Z Flip4", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Graphite", "Pink Gold", "Blue", "Bora Purple"] },
  { slug: "galaxy-z-flip-5", name: "Galaxy Z Flip5", storageOptions: ["256GB", "512GB"], colorOptions: ["Mint", "Graphite", "Cream", "Lavender"] },
  { slug: "galaxy-z-flip-6", name: "Galaxy Z Flip6", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Silver Shadow", "Yellow", "Blue", "Mint"] },
  { slug: "galaxy-z-fold-4", name: "Galaxy Z Fold4", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Graygreen", "Phantom Black", "Beige"] },
  { slug: "galaxy-z-fold-5", name: "Galaxy Z Fold5", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Phantom Black", "Cream", "Icy Blue"] },
  { slug: "galaxy-z-fold-6", name: "Galaxy Z Fold6", storageOptions: ["256GB", "512GB", "1TB"], colorOptions: ["Silver Shadow", "Pink", "Navy"] }
];

const GOOGLE_MODELS: PhoneModel[] = [
  { slug: "pixel-6", name: "Pixel 6", storageOptions: ["128GB", "256GB"], colorOptions: ["Stormy Black", "Sorta Seafoam", "Kinda Coral"] },
  { slug: "pixel-6-pro", name: "Pixel 6 Pro", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Stormy Black", "Cloudy White", "Sorta Sunny"] },
  { slug: "pixel-6a", name: "Pixel 6a", storageOptions: ["128GB"], colorOptions: ["Charcoal", "Chalk", "Sage"] },

  { slug: "pixel-7", name: "Pixel 7", storageOptions: ["128GB", "256GB"], colorOptions: ["Obsidian", "Snow", "Lemongrass"] },
  { slug: "pixel-7-pro", name: "Pixel 7 Pro", storageOptions: ["128GB", "256GB", "512GB"], colorOptions: ["Obsidian", "Snow", "Hazel"] },
  { slug: "pixel-7a", name: "Pixel 7a", storageOptions: ["128GB"], colorOptions: ["Charcoal", "Sea", "Snow", "Coral"] },

  { slug: "pixel-8", name: "Pixel 8", storageOptions: ["128GB", "256GB"], colorOptions: ["Obsidian", "Hazel", "Rose", "Mint"] },
  { slug: "pixel-8-pro", name: "Pixel 8 Pro", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Obsidian", "Porcelain", "Bay", "Mint"] },
  { slug: "pixel-8a", name: "Pixel 8a", storageOptions: ["128GB", "256GB"], colorOptions: ["Obsidian", "Porcelain", "Bay", "Aloe"] },

  { slug: "pixel-9", name: "Pixel 9", storageOptions: ["128GB", "256GB"], colorOptions: ["Obsidian", "Porcelain", "Wintergreen", "Peony"] },
  { slug: "pixel-9-pro", name: "Pixel 9 Pro", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"] },
  { slug: "pixel-9-pro-xl", name: "Pixel 9 Pro XL", storageOptions: ["128GB", "256GB", "512GB", "1TB"], colorOptions: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"] }
];

export const PHONE_BRANDS: PhoneBrand[] = [
  { slug: "apple", name: "Apple", models: APPLE_MODELS },
  { slug: "samsung", name: "Samsung", models: SAMSUNG_MODELS },
  { slug: "google", name: "Google", models: GOOGLE_MODELS }
];

export const OTHER_BRAND = "Other";

export function findBrand(name: string | null | undefined): PhoneBrand | undefined {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return PHONE_BRANDS.find((b) => b.name.toLowerCase() === n);
}

export function findModel(brand: PhoneBrand | undefined, name: string | null | undefined): PhoneModel | undefined {
  if (!brand || !name) return undefined;
  const n = name.trim().toLowerCase();
  return brand.models.find((m) => m.name.toLowerCase() === n);
}
