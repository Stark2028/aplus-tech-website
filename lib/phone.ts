/**
 * Indian mobile-number helpers shared by form validation and live input.
 *
 * The site is India-focused B2B, so every lead form accepts only a standard
 * Indian mobile number: 10 digits with a 6-9 subscriber prefix, optionally
 * written with a +91 country code or a leading 0 trunk prefix. Keeping the
 * validation (`extractIndianMobile`) and the keystroke sanitiser
 * (`sanitizeIndianPhoneInput`) in one file guarantees the two never drift.
 */

import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Reduce a free-form phone string to its canonical 10-digit Indian mobile
 * number, or `null` if it isn't one. Strips the +91 country code and a leading
 * 0 trunk prefix before checking the 6-9 prefix + 10-digit shape.
 */
export function extractIndianMobile(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2); // drop +91 country code
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1); // drop leading 0 trunk prefix
  }
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/**
 * Clean a phone value as the user types: keep a leading +, keep digits and the
 * usual separators (space, hyphen, parens) for readability, drop letters and
 * other junk immediately, and cap the total digit count at 12 so nothing longer
 * than "+91" + a 10-digit mobile can be entered.
 */
export function sanitizeIndianPhoneInput(raw: string): string {
  let out = "";
  let digitCount = 0;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      if (digitCount >= 12) continue;
      digitCount++;
      out += ch;
    } else if (ch === "+") {
      if (out.length === 0) out += "+"; // only a leading +
    } else if (ch === " " || ch === "-" || ch === "(" || ch === ")") {
      out += ch;
    }
    // anything else (letters, symbols) is dropped
  }
  return out;
}

/**
 * Wrap a react-hook-form `register("phone")` result so the visible input value
 * is sanitised on every keystroke before react-hook-form records it. The inputs
 * are uncontrolled, so mutating `target.value` here updates the box directly.
 */
export function registerIndianPhone(
  field: UseFormRegisterReturn
): UseFormRegisterReturn {
  return {
    ...field,
    onChange: (event: Parameters<UseFormRegisterReturn["onChange"]>[0]) => {
      const el = event.target as HTMLInputElement;
      el.value = sanitizeIndianPhoneInput(el.value);
      return field.onChange(event);
    },
  };
}
