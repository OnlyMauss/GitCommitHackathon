import { BellRing, Building2, ChevronRight, Landmark, Languages, SlidersHorizontal, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CustomApiSettings } from "@/features/settings/custom-api-settings";

const sections = [
  { icon: Building2, title: "Company profile", description: "Legal name, IDNO, fiscal year and base currency", value: "Nordic Retail SRL" },
  { icon: Landmark, title: "Chart of accounts", description: "Account structure and category mappings", value: "48 accounts" },
  { icon: SlidersHorizontal, title: "Automation policy", description: "Confidence thresholds and approval rules", value: "Policy v2.1" },
  { icon: UserRound, title: "People & permissions", description: "Roles, access and reviewer assignments", value: "4 users" },
  { icon: Languages, title: "Language & region", description: "Interface language and accounting locale", value: "English · MDL" },
  { icon: BellRing, title: "Notifications", description: "Review alerts and processing summaries", value: "Enabled" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-9">
      <PageHeader title="Workspace Settings" description="Manage company profile, chart of accounts, AI custom endpoints, and automation policies." />

      <div className="mt-8 space-y-8">
        <CustomApiSettings />

        <div className="card-shadow rounded-3xl border border-[#e5e8ef] bg-white p-6 sm:p-8">
          <h2 className="text-[16px] font-extrabold text-[#0b1838]">General Workspace Configuration</h2>
          <p className="mt-0.5 text-xs text-slate-500">Core parameters and policies for Nordic Retail SRL.</p>

          <div className="mt-6 divide-y divide-[#edf0f4]">
            {sections.map((section) => (
              <div key={section.title} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f4f7fb] text-[#0883a9]">
                    <section.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-extrabold text-[#0b1838]">{section.title}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-[#f4f7fb] px-3 py-1.5 text-[11px] font-bold text-[#0b1838]">{section.value}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
