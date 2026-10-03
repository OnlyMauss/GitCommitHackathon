import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";

const settingsSchema = z.object({
  enabled: z.boolean().optional(),
  provider: z.string().optional(),
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
  model: z.string().optional(),
});

export async function GET() {
  try {
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      settingsMap[row.key] = row.value;
    }

    const hasKey = Boolean(settingsMap["custom_api_key"]);
    const enabledSetting = settingsMap["custom_api_enabled"];
    const isEnabled = enabledSetting === "true" || (hasKey && enabledSetting !== "false");

    return NextResponse.json({
      enabled: isEnabled,
      provider: settingsMap["custom_api_provider"] ?? "openai",
      apiKey: settingsMap["custom_api_key"] ? "••••••••" + settingsMap["custom_api_key"].slice(-4) : "",
      hasApiKey: hasKey,
      endpoint: settingsMap["custom_api_endpoint"] ?? "",
      model: settingsMap["custom_api_model"] ?? "gpt-4o-mini",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_SETTINGS" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_SETTINGS", message: "Invalid settings payload." }, { status: 400 });
  }

  const data = parsed.data;
  const upsert = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");

  const transaction = db.transaction(() => {
    const hasNewKey = data.apiKey !== undefined && data.apiKey !== "" && !data.apiKey.startsWith("••");
    if (hasNewKey) {
      upsert.run("custom_api_key", data.apiKey);
    }

    const explicitEnabled = data.enabled;
    const shouldEnable = explicitEnabled !== undefined ? explicitEnabled : (hasNewKey ? true : undefined);
    if (shouldEnable !== undefined) {
      upsert.run("custom_api_enabled", String(shouldEnable));
    }

    if (data.provider !== undefined) upsert.run("custom_api_provider", data.provider);
    if (data.endpoint !== undefined) upsert.run("custom_api_endpoint", data.endpoint);
    if (data.model !== undefined) upsert.run("custom_api_model", data.model);
  });

  try {
    transaction();
    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "FAILED_TO_SAVE_SETTINGS" }, { status: 500 });
  }
}
