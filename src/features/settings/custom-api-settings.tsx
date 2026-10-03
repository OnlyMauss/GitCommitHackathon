"use client";

import { useEffect, useState } from "react";
import { Bot, Key, Loader2, Save, Server } from "lucide-react";

export function CustomApiSettings() {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/v1/settings");
        if (response.ok) {
          const data = await response.json();
          setEnabled(data.enabled);
          setProvider(data.provider || "openai");
          setApiKey(data.apiKey || "");
          setEndpoint(data.endpoint || "");
          setModel(data.model || "gpt-4o-mini");
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    void loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/v1/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, provider, apiKey, endpoint, model }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Failed to save settings.");
        return;
      }

      setMessage("Custom API settings saved successfully.");
    } catch {
      setError("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0a91b8]" />
      </div>
    );
  }

  return (
    <div className="card-shadow rounded-3xl border border-[#e5e8ef] bg-white p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-[#edf0f4] pb-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1838] text-[#25d0f2]">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[16px] font-extrabold text-[#0b1838]">FinPilot Copilot · Custom API & LLM Backend</h2>
          <p className="mt-0.5 text-xs text-slate-500">Configure your own OpenAI, Anthropic, or custom OpenAI-compatible endpoint for Copilot.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-[#e1e5ec] bg-[#f8f9fc] p-4">
          <div>
            <strong className="block text-xs font-extrabold text-[#0b1838]">Enable Custom API / LLM Backend</strong>
            <span className="mt-0.5 block text-[11px] text-slate-500">When enabled, Copilot routes queries through your configured API key and endpoint.</span>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0b1838] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0b1838]">API Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="focus-ring mt-2 h-11 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] px-3 text-xs font-semibold text-[#0b1838] outline-none focus:border-[#13bfe9]">
              <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
              <option value="anthropic">Anthropic (Claude 3.5)</option>
              <option value="custom">Custom OpenAI-Compatible Endpoint</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0b1838]">Model Name</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o-mini" className="focus-ring mt-2 h-11 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] px-3 text-xs font-semibold text-[#0b1838] outline-none focus:border-[#13bfe9]" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0b1838]">API Key</label>
          <div className="relative mt-2">
            <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="focus-ring h-11 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] pl-10 pr-3 text-xs font-semibold text-[#0b1838] outline-none focus:border-[#13bfe9]" />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-450">Leave blank to keep existing key if already configured.</p>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0b1838]">Custom Base URL / Endpoint (Optional)</label>
          <div className="relative mt-2">
            <Server className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.openai.com/v1 or local proxy" className="focus-ring h-11 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] pl-10 pr-3 text-xs font-semibold text-[#0b1838] outline-none focus:border-[#13bfe9]" />
          </div>
        </div>

        {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">{message}</div>}
        {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</div>}

        <div className="flex justify-end pt-3">
          <button type="submit" disabled={saving} className="focus-ring flex items-center gap-2 rounded-xl bg-[#0b1838] px-6 py-3 text-xs font-extrabold text-white hover:bg-[#142754] disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Custom API Settings
          </button>
        </div>
      </form>
    </div>
  );
}
