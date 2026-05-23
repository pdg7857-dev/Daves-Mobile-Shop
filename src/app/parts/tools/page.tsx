import Link from "next/link";
import { prisma } from "@/lib/db";
import PartCard from "@/components/PartCard";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Tools & Equipment — Dave's Mobile Shop",
  description: "Heat mats, opening picks, suction cups and precision drivers for phone repair."
};

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await prisma.part.findMany({
    where: { category: { in: ["tool", "equipment"] } },
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });

  return (
    <div className="container-x py-20">
      <div className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Tools & Equipment</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          The pro workbench.
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Everything a phone tech actually uses — heat mats, opening picks,
          suction cups, tri-point drivers, the works.
        </p>
      </div>

      {tools.length === 0 ? (
        <div className="mt-16 card p-12 text-center max-w-xl mx-auto">
          <p className="eyebrow text-white/55">Coming soon</p>
          <h2 className="mt-2 text-2xl font-semibold text-white tracking-tight">Tool catalog being loaded.</h2>
          <p className="mt-3 text-[14px] text-white/65">
            Import a supplier catalog from <Link href="/admin/parts/import" className="text-[color:var(--apple-blue)] hover:underline">the admin importer</Link> to populate this page.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tools.map((t, i) => (
            <Reveal key={t.id} delay={(i % 4) * 60}>
              <PartCard part={t} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
