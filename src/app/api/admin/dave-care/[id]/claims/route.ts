import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const VALID_TYPES = new Set(["screen", "battery", "camera", "backGlass"]);
const USED_FIELD: Record<string, "screenUsed" | "batteryUsed" | "cameraUsed" | "backGlassUsed"> = {
  screen: "screenUsed",
  battery: "batteryUsed",
  camera: "cameraUsed",
  backGlass: "backGlassUsed"
};

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const planId = Number(id);
  if (!Number.isFinite(planId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json();
  const claimType = String(body.claimType || "");
  if (!VALID_TYPES.has(claimType)) return NextResponse.json({ error: "Invalid claim type" }, { status: 400 });

  const screenType = body.screenType ? String(body.screenType) : null;
  if (claimType === "screen" && screenType && !["OLED", "LCD"].includes(screenType)) {
    return NextResponse.json({ error: "Screen type must be OLED or LCD" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.daveCarePlan.findUnique({ where: { id: planId } });
      if (!plan) throw new Error("Plan not found");
      const usedField = USED_FIELD[claimType];
      if (plan[usedField]) throw new Error(`${claimType} benefit already used on this plan`);

      const claim = await tx.daveCareClaim.create({
        data: {
          planId,
          claimType,
          screenType: claimType === "screen" ? screenType : null,
          upgradePaid: body.upgradePaid != null ? Number(body.upgradePaid) : 0,
          partCost: body.partCost != null ? Number(body.partCost) : null,
          laborCost: body.laborCost != null ? Number(body.laborCost) : null,
          description: body.description ? String(body.description).trim() : null,
          performedBy: body.performedBy ? String(body.performedBy).trim() : null
        }
      });

      await tx.daveCarePlan.update({
        where: { id: planId },
        data: { [usedField]: true }
      });

      return claim;
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not create claim";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
