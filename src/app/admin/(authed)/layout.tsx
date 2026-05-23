import AdminNav from "@/components/AdminNav";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell flex-1 -mt-px">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
