"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Bot, Building2, CircleAlert, Eye, EyeOff, FileCheck2, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles, User } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Unable to create account. Please check your details.");
        return;
      }

      window.localStorage.setItem("finpilot_demo_session", JSON.stringify(result.user));
      router.replace("/dashboard");
    } catch {
      setError("The registration service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(420px,0.94fr)_minmax(520px,1.06fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#081632] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div aria-hidden className="absolute -left-32 -top-36 h-[430px] w-[430px] rounded-full border border-cyan-300/10 bg-cyan-400/[0.04]" />
        <div aria-hidden className="absolute -bottom-44 -right-28 h-[520px] w-[520px] rounded-full border border-violet-300/10 bg-violet-400/[0.04]" />
        <div aria-hidden className="absolute right-[12%] top-[18%] h-2 w-2 rounded-full bg-[#22d3f5] shadow-[0_0_28px_7px_rgba(34,211,245,0.28)]" />

        <div className="relative z-10">
          <Link href="/login" aria-label="FinPilot AI home" className="inline-block rounded-xl bg-white px-4 py-2.5">
            <Image src="/finpilot-logo.png" alt="FinPilot AI" width={202} height={67} className="h-auto w-[180px]" priority />
          </Link>
        </div>

        <div className="relative z-10 max-w-[560px] py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-200"><Sparkles className="h-3.5 w-3.5" />New Workspace Registration</span>
          <h1 className="mt-7 text-[44px] font-extrabold leading-[1.08] tracking-[-0.045em] xl:text-[52px]">Build your books with<br /><span className="text-[#2bd1f2]">intelligent automation.</span></h1>
          <p className="mt-6 max-w-[490px] text-sm font-medium leading-7 text-blue-100/65">Set up your company ledger, invite team members, and connect verified accounting pipelines in seconds.</p>

          <div className="mt-10 grid max-w-[520px] gap-3 sm:grid-cols-3">
            {[{ icon: FileCheck2, value: "Instant", label: "setup" }, { icon: ShieldCheck, value: "SQLite", label: "persistent DB" }, { icon: Bot, value: "AI Copilot", label: "ready" }].map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm"><item.icon className="h-5 w-5 text-[#2bd1f2]" /><strong className="mt-4 block text-xl font-extrabold tracking-[-0.04em]">{item.value}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-blue-100/45">{item.label}</span></div>)}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[9px] font-semibold text-blue-100/35"><span>© 2026 FinPilot AI</span><span className="flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" />Secure · Tenant-isolated · Encrypted</span></div>
      </section>

      <section className="flex min-h-screen flex-col bg-[#f8f9fc]">
        <header className="flex h-[76px] items-center justify-between px-5 sm:px-9 lg:justify-end">
          <Link href="/login" aria-label="FinPilot AI home" className="rounded-lg bg-white px-3 py-2 shadow-sm lg:hidden"><Image src="/finpilot-logo.png" alt="FinPilot AI" width={160} height={53} className="h-auto w-[138px]" priority /></Link>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">Already have an account? <Link href="/login" className="font-extrabold text-[#0788ae] hover:underline">Sign in</Link></div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-9 lg:pb-[76px]">
          <div className="w-full max-w-[440px] animate-float-in">
            <div className="mb-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0a91b8]">Get started</p>
              <h2 className="mt-2.5 text-[30px] font-extrabold tracking-[-0.045em] text-[#0b1838] sm:text-[34px]">Create your account</h2>
              <p className="mt-2 text-xs font-medium text-slate-500">Set up your company workspace and database profile.</p>
            </div>

            <form onSubmit={submit} className="card-shadow rounded-3xl border border-[#e5e8ef] bg-white p-6 sm:p-8" noValidate>
              <label htmlFor="name" className="block text-[10px] font-extrabold text-[#0b1838]">Full name</label>
              <div className="relative mt-2">
                <User className="absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" />
                <input id="name" name="name" type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ana Vlas" className="focus-ring h-12 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] pl-11 pr-4 text-[12px] font-semibold text-[#0b1838] outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-[#13bfe9]" />
              </div>

              <label htmlFor="email" className="mt-4 block text-[10px] font-extrabold text-[#0b1838]">Email address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" />
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" className="focus-ring h-12 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] pl-11 pr-4 text-[12px] font-semibold text-[#0b1838] outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-[#13bfe9]" />
              </div>

              <label htmlFor="company" className="mt-4 block text-[10px] font-extrabold text-[#0b1838]">Company legal name</label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" />
                <input id="company" name="company" type="text" required value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Nordic Retail SRL" className="focus-ring h-12 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] pl-11 pr-4 text-[12px] font-semibold text-[#0b1838] outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-[#13bfe9]" />
              </div>

              <label htmlFor="password" className="mt-4 block text-[10px] font-extrabold text-[#0b1838]">Password (min 6 characters)</label>
              <div className="relative mt-2">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" />
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a secure password" className="focus-ring h-12 w-full rounded-xl border border-[#dfe4eb] bg-[#fbfcfe] pl-11 pr-12 text-[12px] font-semibold text-[#0b1838] outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-[#13bfe9]" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="focus-ring absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>

              {error && <div role="alert" aria-live="polite" className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-[10px] font-semibold leading-4 text-rose-700"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

              <button type="submit" disabled={pending} className="focus-ring mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b1838] text-[11px] font-extrabold text-white shadow-[0_10px_24px_rgba(11,24,56,0.18)] transition-all hover:bg-[#142754] disabled:cursor-not-allowed disabled:opacity-45">{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</> : <>Create workspace <ArrowRight className="h-4 w-4" /></>}</button>
            </form>

            <p className="mt-6 text-center text-[9px] font-medium leading-4 text-slate-400">Already registered? <Link href="/login" className="font-bold text-[#0788ae] hover:underline">Sign in to your workspace</Link>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
