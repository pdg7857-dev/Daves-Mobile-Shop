export function money(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2
  }).format(value);
}

export function date(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export const STATUS_LABELS: Record<string, string> = {
  for_sale: "For Sale",
  sold: "Sold",
  in_repair: "In Repair",
  reserved: "Reserved"
};

export const STATUS_COLOR: Record<string, string> = {
  for_sale: "bg-green-100 text-green-800",
  sold: "bg-gray-200 text-gray-700",
  in_repair: "bg-amber-100 text-amber-800",
  reserved: "bg-blue-100 text-blue-800"
};
