import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const rows = db.prepare("SELECT * FROM ledger_entries").all() as Record<string, unknown>[];
    return NextResponse.json({ ledgerEntries: rows });
  } catch (error) {
    console.error("Error fetching ledger entries:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_LEDGER" }, { status: 500 });
  }
}
