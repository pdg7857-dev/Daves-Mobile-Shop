import { randomBytes } from "node:crypto";

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-700",
  refunded: "bg-gray-200 text-gray-700"
};

export function generateOrderNumber(): string {
  // 6 uppercase hex chars → ~16M combinations. Order # collisions are caught
  // by the unique DB constraint and retried by the caller.
  return `DMS-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export const CARRIERS = [
  "Canada Post",
  "Purolator",
  "UPS",
  "FedEx",
  "DHL",
  "Local courier"
];
