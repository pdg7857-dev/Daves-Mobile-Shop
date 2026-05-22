import AdminNav from "@/components/AdminNav";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </>
  );
}
