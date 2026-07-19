import { z } from "zod";

// Permissive phone matcher: allows +, spaces, hyphens, parens; 8–18 digits total.
const phoneRegex = /^[+]?[\d\s()-]{8,18}$/;

const name = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(100, "Name is too long");

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(320, "Email is too long");

const phone = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(phoneRegex, "Enter a valid phone number");

export const quoteFormSchema = z.object({
  name,
  email,
  phone,
  message: z.string().trim().max(5000, "Message is too long").optional().or(z.literal("")),
});
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export const leadGateSchema = z.object({
  name,
  email,
  phone,
  company: z.string().trim().max(120, "Company name is too long").optional().or(z.literal("")),
});
export type LeadGateValues = z.infer<typeof leadGateSchema>;

export const contactFormSchema = z.object({
  name,
  email,
  phone,
  company: z.string().trim().max(120, "Company name is too long").optional().or(z.literal("")),
  inquiry_type: z.string().trim().min(1, "Please select an inquiry type"),
  message: z.string().trim().max(500, "Message is too long").optional().or(z.literal("")),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const classSaathiLeadSchema = z.object({
  name,
  email,
  phone,
  role: z.string().trim().min(2, "Please enter your role").max(80, "Role is too long"),
  school: z.string().trim().min(2, "Please enter your school name").max(120, "School name is too long"),
  city: z.string().trim().min(2, "Please enter your city").max(80, "City name is too long"),
  student_count: z.string().trim().min(1, "Please select a student count"),
  primary_goal: z.string().trim().min(1, "Please select a primary goal"),
  message: z.string().trim().max(1000, "Message is too long").optional().or(z.literal("")),
});
export type ClassSaathiLeadValues = z.infer<typeof classSaathiLeadSchema>;
