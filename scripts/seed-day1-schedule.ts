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
//  Day 1 Program Schedule — Swastika 2026  (February 20, 2026)
//  Sourced from the official schedule sheet.
// ─────────────────────────────────────────────────────────────────────────────
const day1Items = [
  {
    timeStart: "9:30",
    timeEnd: "9:33",
    program: "Host entry",
    participants: [],
  },
  {
    timeStart: "9:30",
    timeEnd: "9:45",
    program: "Rangapooja",
    participants: ["Nirthya Dance team"],
  },
  {
    timeStart: "9:46",
    timeEnd: "9:50",
    program: "Duet song",
    participants: ["Rianna", "Annmary"],
  },
  {
    timeStart: "9:51",
    timeEnd: "10:00",
    program: "Song",
    participants: ["Neenu Miss (S&H)"],
  },
  {
    timeStart: "10:01",
    timeEnd: "10:15",
    program: "Stage Arrangements",
    participants: [],
  },
  {
    timeStart: "10:16",
    timeEnd: "10:19",
    program: "Prayer song",
    participants: ["Final year girls"],
  },
  {
    timeStart: "10:20",
    timeEnd: "10:25",
    program: "Welcome speech",
    participants: ["Neenu Miss (S&H)"],
  },
  {
    timeStart: "10:26",
    timeEnd: "10:35",
    program: "Presidential Address",
    participants: ["Dr. Oommen Mammen (Director)"],
  },
  {
    timeStart: "10:36",
    timeEnd: "10:39",
    program: "Lighting the lamp",
    participants: [
      "Snehapriya Miss",
      "Director",
      "Dean",
      "Principal",
      "Vice Principal",
      "Guest",
      "Main Sponsor",
      "Core Committee",
    ],
  },
  {
    timeStart: "10:40",
    timeEnd: "10:42",
    program: "Introduce Chief Guest",
    participants: ["Merlin Miss (AI)"],
  },
  {
    timeStart: "10:43",
    timeEnd: "11:05",
    program: "Inauguration Speech",
    participants: ["Chief Guest"],
  },
  {
    timeStart: "11:06",
    timeEnd: "11:10",
    program: "Address by Principal",
    participants: ["Principal"],
  },
  {
    timeStart: "11:11",
    timeEnd: "11:15",
    program: "Felicitation",
    participants: ["Vice Principal"],
  },
  {
    timeStart: "11:16",
    timeEnd: "11:18",
    program: "Word of blessing",
    participants: ["Fr. John Samuel"],
  },
  {
    timeStart: "11:19",
    timeEnd: "11:22",
    program: "Felicitation",
    participants: ["PTA VP"],
  },
  {
    timeStart: "11:23",
    timeEnd: "11:27",
    program: "Sponsor Speech",
    participants: ["Main Sponsor (Educareer)"],
  },
  {
    timeStart: "11:28",
    timeEnd: "11:33",
    program: "Honouring Guests",
    participants: ["Main Sponsor", "Chief Guest"],
  },
  {
    timeStart: "11:34",
    timeEnd: "11:39",
    program: "Vote of thanks",
    participants: ["Amal Samuel Sabu (Swatika CEO)"],
  },
  {
    timeStart: "11:40",
    timeEnd: "11:44",
    program: "Stage rearrangement for event",
    participants: [],
  },
  {
    timeStart: "11:45",
    timeEnd: "13:30",
    program: "Mr & Miss Swastika",
    participants: [],
  },
  {
    timeStart: "13:40",
    timeEnd: "15:00",
    program: "Dance",
    participants: [],
  },
  {
    timeStart: "15:10",
    timeEnd: "19:00",
    program: "Auto Show",
    participants: [],
  },
  {
    timeStart: "19:30",
    timeEnd: "21:30",
    program: "Proshow",
    participants: ["MQUBE"],
  },
];

async function seedDay1Schedule() {
  try {
    console.log("🗓️  Seeding Day 1 program schedule…");
    await initDatabase();

    // Wipe existing Day 1 rows so the script is idempotent
    await sql`DELETE FROM schedule_program_items WHERE day = 1`;
    console.log("   ✓ Cleared existing Day 1 rows");

    let inserted = 0;
    for (let i = 0; i < day1Items.length; i++) {
      const item = day1Items[i];
      const id = crypto.randomUUID();

      await sql`
        INSERT INTO schedule_program_items
          (id, day, time_start, time_end, program, participants, sort_order)
        VALUES
          (
            ${id},
            1,
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

    console.log(`\n✅ Done — inserted ${inserted} Day 1 schedule items.`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedDay1Schedule();
