import { config } from "dotenv";
import { resolve } from "path";

// Load env FIRST before any db imports
config({ path: resolve(process.cwd(), ".env") });

if (!process.env.POSTGRES_URL) {
  console.error("❌ POSTGRES_URL not found in .env file");
  process.exit(1);
}

import { sql, initDatabase } from "../lib/db";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
//  Day 2 Program Schedule — Swastika 2026  (February 21, 2026)
//  Sourced from the official schedule sheet.
// ─────────────────────────────────────────────────────────────────────────────
const day2Items = [
  {
    timeStart: "9:30",
    timeEnd: "9:35",
    program: "Host entry",
    participants: [],
  },
  {
    timeStart: "9:36",
    timeEnd: "9:45",
    program: "Thiruvathira",
    participants: ["Juniors"],
  },
  {
    timeStart: "9:46",
    timeEnd: "9:55",
    program: "Violin",
    participants: [],
  },
  {
    timeStart: "9:51",
    timeEnd: "10:00",
    program: "Song",
    participants: ["Treesa"],
  },
  {
    timeStart: "10:01",
    timeEnd: "10:10",
    program: "Stage Arrangements",
    participants: [],
  },
  {
    timeStart: "10:15",
    timeEnd: "11:45",
    program: "Voice of Swastika",
    participants: [],
  },
  {
    timeStart: "11:46",
    timeEnd: "12:05",
    program: "Session on Entrepreneurship",
    participants: ["Anax (2nd yr AI)"],
  },
  {
    timeStart: "12:06",
    timeEnd: "13:05",
    program: "Interactive Session",
    participants: [],
  },
  {
    timeStart: "13:06",
    timeEnd: "13:30",
    program: "Break",
    participants: [],
  },
  {
    timeStart: "13:40",
    timeEnd: "15:30",
    program: "Beats of Swastika (Band)",
    participants: [],
  },
  {
    timeStart: "15:40",
    timeEnd: "17:00",
    program: "Theme Show",
    participants: [],
  },
  {
    timeStart: "17:00",
    timeEnd: "19:00",
    program: "Break",
    participants: [],
  },
  {
    timeStart: "19:00",
    timeEnd: "21:30",
    program: "Proshow",
    participants: ["FEJO & ADJ"],
  },
];

async function seedDay2Schedule() {
  try {
    console.log("🗓️  Seeding Day 2 program schedule…");
    await initDatabase();

    // Wipe existing Day 2 rows so the script is idempotent
    await sql`DELETE FROM schedule_program_items WHERE day = 2`;
    console.log("   ✓ Cleared existing Day 2 rows");

    let inserted = 0;
    for (let i = 0; i < day2Items.length; i++) {
      const item = day2Items[i];
      const id = crypto.randomUUID();

      await sql`
        INSERT INTO schedule_program_items
          (id, day, time_start, time_end, program, participants, sort_order)
        VALUES
          (
            ${id},
            2,
            ${item.timeStart},
            ${item.timeEnd},
            ${item.program},
            ${JSON.stringify(item.participants)},
            ${i}
          )
      `;

      const pLabel =
        item.participants.length > 0
          ? `[${item.participants.join(", ")}]`
          : "—";
      console.log(
        `   ✓ [${String(i + 1).padStart(2, "0")}] ${item.timeStart} – ${item.timeEnd}  |  ${item.program}  |  ${pLabel}`,
      );
      inserted++;
    }

    console.log(`\n✅ Done — inserted ${inserted} Day 2 schedule items.`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedDay2Schedule();
