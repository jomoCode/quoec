import { apiFetch } from "./api";

/** `POST /api/v1/public/enquiries` body (citadel-api `EnquiryCreate`). */
interface EnquiryCreate {
  name: string;
  email: string;
  phone: string;
  enquiryType: "general" | "property";
  propertySlug?: string;
  message: string;
  consent_given: true;
  source_page: string;
  attribution: Record<string, string>;
  marketingOptIn: boolean;
  privacyNoticeVersion?: string;
}

export interface EnquiryReceipt {
  id: string;
  reference: string;
}

export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  /** Development slug, or "" for a general enquiry. */
  developmentSlug: string;
  message: string;
  marketingOptIn: boolean;
}

/** Bump when the privacy wording beside the consent box changes. */
export const PRIVACY_NOTICE_VERSION = "2026-11";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function attribution(): Record<string, string> {
  const out: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_KEYS) {
    const v = params.get(key)?.trim();
    if (v) out[key] = v.slice(0, 120);
  }
  if (document.referrer) out.referrer = document.referrer.slice(0, 500);
  out.landing_page = (window.location.pathname + window.location.search).slice(0, 300);
  return out;
}

export function submitEnquiry(input: EnquiryInput): Promise<EnquiryReceipt> {
  const body: EnquiryCreate = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    enquiryType: input.developmentSlug ? "property" : "general",
    ...(input.developmentSlug ? { propertySlug: input.developmentSlug } : {}),
    message: input.message.trim(),
    consent_given: true,
    source_page: window.location.pathname.slice(0, 300) || "/",
    attribution: attribution(),
    marketingOptIn: input.marketingOptIn,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
  };
  return apiFetch<EnquiryReceipt>("/public/enquiries", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
