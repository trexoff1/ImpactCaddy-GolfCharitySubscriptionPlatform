import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/admin-auth";
import { countMatches, runDrawSimulation, type DrawMode, type SimulationParticipant } from "@/lib/draw-engine";
import { emails } from "@/lib/email/service";

interface PublishBody {
  drawId: string;
  mode: DrawMode;
  winningNumbers?: number[];
}

async function getParticipantScores(admin: ReturnType<typeof createAdminClient>, drawId: string) {
  const { data: entries } = await admin
    .from("draw_entries")
    .select("id, user_id, locked_scores")
    .eq("draw_id", drawId);

  const participants: SimulationParticipant[] = [];

  for (const entry of entries || []) {
    const lockedScores = (entry.locked_scores as number[] | null) || [];
    if (lockedScores.length > 0) {
      participants.push({ userId: entry.user_id as string, scores: lockedScores.slice(0, 5) });
      continue;
    }

    const { data: latestScores } = await admin
      .from("scores")
      .select("stableford_points")
      .eq("user_id", entry.user_id)
      .order("date_played", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    const scoreList = (latestScores || []).map((row) => Number(row.stableford_points)).filter((n) => Number.isFinite(n));

    await admin
      .from("draw_entries")
      .update({ locked_scores: scoreList })
      .eq("id", entry.id);

    participants.push({ userId: entry.user_id as string, scores: scoreList });
  }

  return participants;
}

export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as PublishBody;
  if (!body?.drawId || !body?.mode) {
    return NextResponse.json({ error: "drawId and mode are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: draw } = await admin
    .from("draws")
    .select("id, title, total_pool, status")
    .eq("id", body.drawId)
    .single();

  if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

  const participants = await getParticipantScores(admin, body.drawId);
  const fallbackSimulation = runDrawSimulation(body.mode, participants);
  const winningNumbers = (body.winningNumbers && body.winningNumbers.length === 5
    ? body.winningNumbers
    : fallbackSimulation.winningNumbers).slice().sort((a, b) => a - b);

  const winnerBuckets: Record<3 | 4 | 5, string[]> = { 3: [], 4: [], 5: [] };

  for (const participant of participants) {
    const matches = countMatches(participant.scores, winningNumbers);
    if (matches === 3 || matches === 4 || matches === 5) {
      winnerBuckets[matches].push(participant.userId);
    }
  }

  const totalPool = Number(draw.total_pool || 0);
  const pools = {
    fiveMatch: Number((totalPool * 0.4).toFixed(2)),
    fourMatch: Number((totalPool * 0.35).toFixed(2)),
    threeMatch: Number((totalPool * 0.25).toFixed(2)),
  };

  const perWinner = {
    5: winnerBuckets[5].length > 0 ? Number((pools.fiveMatch / winnerBuckets[5].length).toFixed(2)) : 0,
    4: winnerBuckets[4].length > 0 ? Number((pools.fourMatch / winnerBuckets[4].length).toFixed(2)) : 0,
    3: winnerBuckets[3].length > 0 ? Number((pools.threeMatch / winnerBuckets[3].length).toFixed(2)) : 0,
  };

  await admin.from("draw_results").upsert(
    {
      draw_id: body.drawId,
      draw_type: body.mode,
      winning_numbers: winningNumbers,
      is_published: true,
      published_at: new Date().toISOString(),
    },
    { onConflict: "draw_id" }
  );

  await admin
    .from("draws")
    .update({
      status: "completed",
      winner_id: winnerBuckets[5][0] || null,
    })
    .eq("id", body.drawId);

  await admin.from("draw_winners").delete().eq("draw_id", body.drawId);

  const winnersToInsert = [
    ...winnerBuckets[5].map((userId) => ({ draw_id: body.drawId, user_id: userId, match_tier: 5, prize_amount: perWinner[5], payment_status: "pending" })),
    ...winnerBuckets[4].map((userId) => ({ draw_id: body.drawId, user_id: userId, match_tier: 4, prize_amount: perWinner[4], payment_status: "pending" })),
    ...winnerBuckets[3].map((userId) => ({ draw_id: body.drawId, user_id: userId, match_tier: 3, prize_amount: perWinner[3], payment_status: "pending" })),
  ];

  if (winnersToInsert.length > 0) {
    await admin.from("draw_winners").insert(winnersToInsert);
  }

  // --- Email Notifications (Run async) ---
  (async () => {
    // Fetch user profiles for participants to get emails/names
    const userIds = participants.map(p => p.userId);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, email, display_name")
      .in("id", userIds);

    if (!profiles) return;

    for (const profile of profiles) {
      const participant = participants.find(p => p.userId === profile.id);
      if (!participant) continue;

      const matches = countMatches(participant.scores, winningNumbers);
      const isWinner = matches >= 3;

      // Send Draw Results
      await emails.drawResults(
        profile.email,
        profile.display_name || "Hero",
        draw.title || "Monthly Draw",
        matches
      );

      // Send Winner Alert if applicable
      if (isWinner) {
        const prize = winnersToInsert.find(w => w.user_id === profile.id);
        await emails.winnerAlert(
          profile.email,
          profile.display_name || "Hero",
          draw.title || "Monthly Draw",
          `₹${prize?.prize_amount || 0}`
        );
      }
    }
  })().catch(err => console.error("Email notification error:", err));

  return NextResponse.json({
    drawId: body.drawId,
    mode: body.mode,
    winningNumbers,
    winnerCounts: {
      five: winnerBuckets[5].length,
      four: winnerBuckets[4].length,
      three: winnerBuckets[3].length,
    },
    jackpotCarryover: winnerBuckets[5].length === 0,
  });
}
