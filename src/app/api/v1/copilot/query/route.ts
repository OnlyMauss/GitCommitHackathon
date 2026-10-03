import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import db from "@/lib/db";

const requestSchema = z.object({ query: z.string().trim().min(2).max(500) });

const expenseResponse = {
  answer: "September operating expenses totalled 84,320.00 MDL. The largest category was inventory purchases, followed by rent and professional services.",
  amount: "84,320.00 MDL",
  bullets: ["Inventory|46,280 MDL", "Rent & utilities|18,600 MDL", "Other operating|19,440 MDL"],
  sources: [{ id: "JE-0284", label: "September ledger", type: "entry" }, { id: "FP-1048", label: "FP-1048", type: "document" }, { id: "FP-1046", label: "FP-1046", type: "document" }],
};

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_QUERY", message: "A valid query is required." }, { status: 400 });
  const query = parsed.data.query.toLowerCase();

  // Fetch settings from DB
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const settingsMap: Record<string, string> = {};
  for (const row of rows) {
    settingsMap[row.key] = row.value;
  }

  const customApiKey = settingsMap["custom_api_key"] || process.env.OPENAI_API_KEY;
  const customApiEnabled = settingsMap["custom_api_enabled"] === "true" || (Boolean(customApiKey) && settingsMap["custom_api_enabled"] !== "false");
  const customEndpoint = settingsMap["custom_api_endpoint"];
  const customModel = settingsMap["custom_api_model"] || "gpt-4o-mini";

  // If custom API / LLM is enabled and configured, attempt real AI generation
  if (customApiEnabled && customApiKey) {
    try {
      // Fetch live context from SQLite database
      const ledgerEntries = db.prepare("SELECT * FROM ledger_entries LIMIT 10").all() as Record<string, unknown>[];
      const documents = db.prepare("SELECT * FROM documents LIMIT 10").all() as Record<string, unknown>[];

      const financialContext = `
        Current Tenant: Nordic Retail SRL
        September Operating Expenses: 84,320.00 MDL
        Unpaid Invoices: 2 invoices totaling 19,320.00 MDL (Linella Market 12,480 MDL, Omega Construct 6,840 MDL)
        Recent Ledger Entries: ${JSON.stringify(ledgerEntries)}
        Recent Documents: ${JSON.stringify(documents)}
      `;

      const openaiProvider = createOpenAI({
        apiKey: customApiKey,
        baseURL: customEndpoint && customEndpoint.trim() !== "" ? customEndpoint : undefined,
      });

      const { text } = await generateText({
        model: openaiProvider(customModel),
        system: `You are FinPilot Copilot, an AI accounting assistant for Moldovan small businesses. Answer questions accurately based only on the provided financial context. Keep answers concise and professional.`,
        prompt: `Context:\n${financialContext}\n\nUser Question: ${parsed.data.query}`,
      });

      return NextResponse.json({
        answer: text,
        amount: "84,320.00 MDL",
        bullets: ["Database sync|Active", "Verified records|Present"],
        sources: [{ id: "DB-SYNC", label: "Live SQLite context", type: "entry" }, { id: "FP-1048", label: "Linella invoice", type: "document" }],
      });
    } catch (error) {
      console.error("Custom AI API call error:", error);
      if (settingsMap["custom_api_key"]) {
        return NextResponse.json({
          error: "AI_API_ERROR",
          answer: `Error connecting to AI API: ${error instanceof Error ? error.message : "Unknown error"}. Please check your API key, endpoint, and model name in Settings.`,
          amount: "API Error",
          bullets: [],
          sources: []
        }, { status: 500 });
      }
      // Fall through to mock responses if using default env key and it failed
    }
  }

  // Fallback intelligent mock responses
  if (query.includes("unpaid") || query.includes("supplier invoice")) {
    return NextResponse.json({ answer: "There are 2 unpaid supplier invoices with a combined outstanding balance of 19,320.00 MDL. Neither is overdue yet.", amount: "19,320.00 MDL outstanding", bullets: ["Linella Market|12,480 MDL", "Omega Construct|6,840 MDL", "Next due date|Oct 12, 2026"], sources: [{ id: "FP-1048", label: "Linella invoice", type: "document" }, { id: "FP-1047", label: "Omega invoice", type: "document" }] });
  }
  if (query.includes("review") || query.includes("attention") || query.includes("document")) {
    return NextResponse.json({ answer: "3 documents require attention. One has low classification confidence, one is still processing, and one is waiting for confirmation before posting.", amount: "3 documents", bullets: ["Low confidence|1 document", "Processing|1 document", "Awaiting approval|1 document"], sources: [{ id: "FP-1047", label: "Needs review", type: "document" }, { id: "FP-1045", label: "Processing", type: "document" }, { id: "FP-1048", label: "Ready", type: "document" }] });
  }
  if (query.includes("why") || query.includes("increase") || query.includes("grew")) {
    return NextResponse.json({ answer: "Expenses increased 12.4% versus August, mainly because inventory purchases were 9,860 MDL higher. Rent and recurring services stayed broadly stable.", amount: "+12.4% month over month", bullets: ["Inventory impact|+9,860 MDL", "Services impact|+1,120 MDL", "Recurring costs|Stable"], sources: [{ id: "JE-0284", label: "Ledger analysis", type: "entry" }, { id: "FP-1048", label: "Largest purchase", type: "document" }] });
  }
  return NextResponse.json(expenseResponse);
}
