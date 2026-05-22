import Link from "next/link";
import PartForm from "@/components/PartForm";

export default function NewPartPage() {
  return (
    <div>
      <Link href="/admin/parts" className="text-sm text-brand-700">← Back to parts</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Add part</h1>
      <p className="text-sm text-gray-600 mb-6">Log a new SKU into the parts catalog.</p>
      <PartForm
        mode="create"
        initial={{
          name: "",
          category: "",
          compatibleWith: "",
          brand: "",
          price: "",
          stock: 0,
          imageUrl: "",
          description: ""
        }}
      />
    </div>
  );
}
