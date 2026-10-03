import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  type: z.enum(["Invoice", "Receipt", "Bank statement"]),
  counterparty: z.string().min(1),
  amount: z.string().min(1),
  status: z.enum(["Ready", "Needs review", "Posted", "Processing"]),
  confidence: z.number().min(0).max(100),
});

export async function GET() {
  try {
    const rows = db.prepare("SELECT * FROM documents").all() as Record<string, unknown>[];
    const documents = rows.map((r) => ({
      id: r.id,
      fileName: r.file_name,
      type: r.type,
      counterparty: r.counterparty,
      date: r.date,
      amount: r.amount,
      status: r.status,
      confidence: r.confidence,
    }));
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_DOCUMENTS" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const parsed = uploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_DOCUMENT", message: "Invalid document data." }, { status: 400 });
  }

  const data = parsed.data;
  const id = `FP-${Math.floor(1050 + Math.random() * 900)}`;
  const date = "Just now";

  try {
    db.prepare(`
      INSERT INTO documents (id, file_name, type, counterparty, date, amount, status, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.fileName, data.type, data.counterparty, date, data.amount, data.status, data.confidence);

    const newDoc = {
      id,
      fileName: data.fileName,
      type: data.type,
      counterparty: data.counterparty,
      date,
      amount: data.amount,
      status: data.status,
      confidence: data.confidence,
    };

    return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json({ error: "FAILED_TO_SAVE_DOCUMENT" }, { status: 500 });
  }
}
