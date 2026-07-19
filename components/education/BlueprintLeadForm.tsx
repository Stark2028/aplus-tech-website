"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import posthog from "posthog-js";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { classSaathiLeadSchema, type ClassSaathiLeadValues } from "@/lib/formSchemas";
import { leadFormOptions } from "@/data/education";
import { trackEvent } from "@/lib/analytics";

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm";
const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

export default function BlueprintLeadForm() {
  const [submitted, setSubmitted] = useState<ClassSaathiLeadValues | null>(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ClassSaathiLeadValues>({
    resolver: zodResolver(classSaathiLeadSchema),
    defaultValues: { message: "", student_count: "", primary_goal: "" },
  });

  const onSubmit = async (values: ClassSaathiLeadValues) => {
    setServerError("");
    const summary = [
      `Role: ${values.role}`,
      `School: ${values.school}`,
      `City: ${values.city}`,
      `Students: ${values.student_count}`,
      `Primary Goal: ${values.primary_goal}`,
      values.message ? `Message: ${values.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const payload: Record<string, string> = {
      lead_source: "Class Saathi",
      subject: `Class Saathi Lead — ${values.school}`,
      from_name: "Aplus Website — Class Saathi",
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.school,
      role: values.role,
      city: values.city,
      student_count: values.student_count,
      primary_goal: values.primary_goal,
      message: summary,
      // Honeypot: not in the Zod schema, read directly from the form. Humans
      // leave it empty; bots that fill it are silently dropped server-side.
      company_website: (getValues() as Record<string, string>).company_website ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        trackEvent("class_saathi_lead_submitted", {
          student_count: values.student_count,
          primary_goal: values.primary_goal,
        });
        if (posthog.__loaded) {
          posthog.capture("class_saathi_lead_submitted", {
            student_count: values.student_count,
            primary_goal: values.primary_goal,
          });
        }
        setSubmitted(values);
      } else {
        setServerError(
          res.status === 429
            ? "Too many requests — please try again in a few minutes."
            : "Something went wrong sending your request. Please try again."
        );
      }
    } catch {
      setServerError("We couldn't reach our server. Check your connection and try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* Persuasion panel */}
      <div className="lg:col-span-5 lg:sticky lg:top-28">
        <p className="edu-eyebrow text-emerald-700 mb-3">Request a school demo</p>
        <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Get your school&apos;s Class Saathi blueprint
        </h2>
        <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">
          Tell us about your school and an Aplus education specialist will reach out within 1 business day with
          pricing, a live demonstration and a rollout plan sized to your classrooms.
        </p>
        <ul className="mt-8 space-y-4">
          {[
            "Live demo for your teachers — online or on-site",
            "Pricing and rollout options sized to your classrooms",
            "Deployment and ongoing support across India",
          ].map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Form / success card */}
      <div className="lg:col-span-7">
        {submitted ? (
          <div className="bg-white border border-emerald-200 ring-4 ring-emerald-50 rounded-3xl p-8 md:p-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
              <GraduationCap size={26} className="text-emerald-700" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Request received</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Thanks, {submitted.name.split(/\s+/)[0]} — our education specialist will reach out within 1 business
              day.
            </p>
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-gray-100 pt-6">
              {[
                ["School", submitted.school],
                ["City", submitted.city],
                ["Students", submitted.student_count],
                ["Primary goal", submitted.primary_goal],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="bg-white border border-gray-100 rounded-3xl shadow-lg shadow-gray-100/70 p-8 md:p-10 space-y-5"
          >
            {/* Honeypot — hidden from users; bots that fill it are silently dropped */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sr-only"
              {...register("company_website" as keyof ClassSaathiLeadValues)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="cs-name" className={labelClass}>Full name</label>
                <input id="cs-name" type="text" placeholder="Priya Sharma" className={inputClass} {...register("name")} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="cs-role" className={labelClass}>Your role</label>
                <input id="cs-role" type="text" placeholder="Principal, Director, Trustee…" className={inputClass} {...register("role")} />
                {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="cs-school" className={labelClass}>School name</label>
              <input id="cs-school" type="text" placeholder="Sunrise Public School" className={inputClass} {...register("school")} />
              {errors.school && <p className="mt-1 text-xs text-red-600">{errors.school.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="cs-city" className={labelClass}>City</label>
                <input id="cs-city" type="text" placeholder="Noida" className={inputClass} {...register("city")} />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label htmlFor="cs-phone" className={labelClass}>Phone</label>
                <input id="cs-phone" type="tel" placeholder="+91 99999 99999" className={inputClass} {...register("phone")} />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="cs-email" className={labelClass}>Email</label>
              <input id="cs-email" type="email" placeholder="you@school.edu" className={inputClass} {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="cs-students" className={labelClass}>Students</label>
                <select id="cs-students" className={inputClass} {...register("student_count")}>
                  <option value="" disabled>Select a range</option>
                  {leadFormOptions.studentCounts.map((band) => (
                    <option key={band} value={band}>{band}</option>
                  ))}
                </select>
                {errors.student_count && <p className="mt-1 text-xs text-red-600">{errors.student_count.message}</p>}
              </div>
              <div>
                <label htmlFor="cs-goal" className={labelClass}>Primary goal</label>
                <select id="cs-goal" className={inputClass} {...register("primary_goal")}>
                  <option value="" disabled>Select a goal</option>
                  {leadFormOptions.goals.map((goal) => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
                {errors.primary_goal && <p className="mt-1 text-xs text-red-600">{errors.primary_goal.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="cs-message" className={labelClass}>
                Anything else <span className="text-gray-300 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                id="cs-message"
                rows={3}
                placeholder="Boards, grades, timelines, current tools…"
                className={`${inputClass} resize-none`}
                {...register("message")}
              />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
            </div>

            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                "Sending…"
              ) : (
                <>
                  Request a school demo
                  <ArrowRight size={17} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
