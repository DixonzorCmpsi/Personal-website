"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, Send } from "lucide-react";

type SubmitState = "idle" | "sending" | "sent" | "error";

const topics = [
  "Project collaboration",
  "AI workflow consultation",
  "Engineering role",
  "Content or YouTube",
  "Other",
];

export default function MeetScheduler() {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("sending");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      preferredTime: String(form.get("preferredTime") ?? ""),
      topic: String(form.get("topic") ?? ""),
      message: String(form.get("message") ?? ""),
      company: String(form.get("company") ?? ""),
    };

    try {
      const response = await fetch("/api/meet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Could not send the meeting request.");
      }

      setState("sent");
      event.currentTarget.reset();
    } catch (caught) {
      setState("error");
      setError(caught instanceof Error ? caught.message : "Could not send the meeting request.");
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-zinc-200 bg-white/82 shadow-[0_30px_90px_rgba(14,116,144,0.12)] backdrop-blur-xl lg:grid-cols-[0.76fr_1.24fr]">
      <div className="relative flex min-h-[340px] flex-col justify-center overflow-hidden bg-zinc-950 p-7 text-white md:p-9">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.10)_1px,transparent_1px)] bg-[size:18px_18px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,0.46),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(56,189,248,0.24),transparent_36%)]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
            <CalendarDays size={16} /> Meet with me
          </div>
          <h2 className="mt-6 max-w-xl text-5xl font-semibold leading-[0.96] tracking-tight md:text-6xl">
            Schedule a call.
          </h2>
          <p className="mt-5 max-w-lg text-lg font-medium leading-7 text-zinc-300">
            Pick a time, share the context, and I will follow up by email.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 p-6 md:p-8">
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            Name
            <input
              required
              name="name"
              maxLength={120}
              className="h-[48px] rounded-2xl border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              placeholder="Your name"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            Email
            <input
              required
              type="email"
              name="email"
              maxLength={160}
              className="h-[48px] rounded-2xl border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              placeholder="you@example.com"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            Preferred time
            <input
              required
              type="datetime-local"
              name="preferredTime"
              maxLength={180}
              className="h-[48px] rounded-2xl border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            Topic
            <select
              name="topic"
              className="h-[48px] rounded-2xl border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              defaultValue={topics[0]}
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          Message
          <textarea
            required
            name="message"
            maxLength={1200}
            rows={5}
            className="resize-none rounded-[22px] border border-zinc-200 bg-white px-4 py-3 text-base font-medium leading-7 text-zinc-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            placeholder="What should we talk about, and what outcome would make the meeting worth it?"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-6 text-sm font-semibold">
            {state === "sent" && (
              <span className="inline-flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={17} /> Sent. I will get this in email.
              </span>
            )}
            {state === "error" && <span className="text-red-600">{error}</span>}
          </div>
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex items-center justify-center gap-3 rounded-full bg-zinc-950 px-6 py-3 text-base font-semibold text-white shadow-[0_18px_36px_rgba(24,24,27,0.18)] transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "sending" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Send meeting request
          </button>
        </div>
      </form>
    </div>
  );
}
