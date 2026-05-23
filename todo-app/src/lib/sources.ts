export const SOURCE = {
  PERSONAL: "PERSONAL",
  MOBILE_SHOP_ORDER: "MOBILE_SHOP_ORDER",
  MOBILE_SHOP_CARE_PLAN: "MOBILE_SHOP_CARE_PLAN",
  TOYOTA_LEAD: "TOYOTA_LEAD",
} as const;

export type Source = (typeof SOURCE)[keyof typeof SOURCE];

export const SOURCE_LABEL: Record<Source, string> = {
  PERSONAL: "Personal",
  MOBILE_SHOP_ORDER: "Mobile Shop · Order",
  MOBILE_SHOP_CARE_PLAN: "Mobile Shop · Dave Care",
  TOYOTA_LEAD: "Toyota · Lead",
};

export const SOURCE_COLOR: Record<Source, string> = {
  PERSONAL: "bg-accent/15 text-accent ring-accent/30",
  MOBILE_SHOP_ORDER: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  MOBILE_SHOP_CARE_PLAN: "bg-violet-400/15 text-violet-300 ring-violet-400/30",
  TOYOTA_LEAD: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
};

export const STATUS = {
  open: "open",
  done: "done",
  snoozed: "snoozed",
  dismissed: "dismissed",
} as const;

export const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};
