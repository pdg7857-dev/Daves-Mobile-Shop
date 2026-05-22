import { getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">Storefront-wide configuration.</p>
      </header>
      <SettingsForm
        initial={{
          shippingFlatRate: settings.shippingFlatRate,
          freeShippingThreshold: settings.freeShippingThreshold ?? null
        }}
      />
    </div>
  );
}
