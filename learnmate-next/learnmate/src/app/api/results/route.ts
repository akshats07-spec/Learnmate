import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";
import { z } from "zod";
export const runtime = "nodejs";
const Payload = z.object({
  materialName: z.string().max(200),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  weakTopics: z.array(z.string().max(100)).max(20),
  answers: z.array(z.number().int()).max(100),
  topicScores: z.record(z.number().min(0).max(100)).optional()
});
export async function POST(req: NextRequest) {
  const valid = Payload.safeParse(await req.json());
  if (!valid.success) return NextResponse.json({ error: "Invalid result payload." }, { status: 400 });
  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ saved: false, mode: "demo", message: "Results are saved in this browser session. Configure Supabase to persist them in PostgreSQL." });
  // Demo identity is intentionally not accepted for a production multi-user deployment.
  // Add Supabase Auth and derive user_id from the verified server session before enabling this write.
  return NextResponse.json({ saved: false, mode: "setup_required", message: "Supabase is configured. Enable Supabase Auth and server-side user identity before persisting student records." });
}
