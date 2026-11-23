import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import type { Development } from "../types/property";
import { ArchitecturalImage } from "./ArchitecturalImage";
import { GlassButton } from "./GlassButton";
import { track } from "../analytics";
import { ApiError } from "../utils/api";
import { submitEnquiry } from "../utils/enquiries";

interface ContactSectionProps {
  developments: Development[];
}

/** "" = general enquiry. */
const GENERAL = "";

// Same rules as citadel-api's EnquiryCreate, so the form never sends what the API will reject.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;
const MIN_MESSAGE = 10;

const FIELD_LABELS: Record<string, string> = {
  name: "Full name",
  email: "Email address",
  phone: "Phone number",
  message: "Message",
};

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return "Too many enquiries from this connection. Please try again shortly.";
    const fields = Object.keys(err.fields ?? {}).map((k) => FIELD_LABELS[k] ?? k);
    if (fields.length) return `Please check: ${fields.join(", ")}.`;
    return err.message;
  }
  return "Unable to send enquiry. Please check your connection and try again.";
}

export function ContactSection({ developments }: ContactSectionProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [developmentSlug, setDevelopmentSlug] = useState("the-citadel");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Keep the selection valid if the list loads without the default development.
  const selectedSlug =
    developmentSlug === GENERAL || developments.some((d) => d.id === developmentSlug)
      ? developmentSlug
      : (developments[0]?.id ?? GENERAL);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2 || !email.trim() || !phone.trim() || !message.trim()) {
      setError("Please complete your name, email address, phone number and enquiry message.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!PHONE_RE.test(phone.trim())) {
      setError("Please enter a valid phone number, e.g. +234 800 000 0000.");
      return;
    }
    if (message.trim().length < MIN_MESSAGE) {
      setError(`Please write a little more in your message (at least ${MIN_MESSAGE} characters).`);
      return;
    }
    if (!consent) {
      setError("Please agree to be contacted about your enquiry.");
      return;
    }

    setSubmitting(true);
    try {
      await submitEnquiry({
        name: fullName,
        email,
        phone,
        developmentSlug: selectedSlug,
        message,
        marketingOptIn,
      });

      // Conversion is counted on confirmed success, not on the button press.
      track({
        name: "generate_lead",
        tag: "contact_form_submit",
        meta: { property_interest: selectedSlug || "general" },
      });

      setSubmitted(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setConsent(false);
      setMarketingOptIn(false);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative bg-[#0B1829] bg-linear-to-r from-[#1C3F66] via-[#0B1829] to-[#1C3F66] text-white overflow-hidden"
    >
      {/* Twilight architectural backdrop */}
      <div className="absolute inset-0">
        <ArchitecturalImage
          src="/src/assets/images/cta_estate_dusk_1795186677172.jpg"
          alt="Luxury residential estate illuminated at dusk"
          title="Private Client Enquiries"
          dark
          className="w-full h-full object-cover opacity-35"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-[#1C3F66]/85 via-[#0B1829]/92 to-[#1C3F66]/85"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left editorial CTA */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-sm font-medium text-[#E2B45A]">
              Private Sales &amp; Enquiries
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Your Residence Awaits
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Speak directly with the Quo Engineering &amp; Construction private
              advisory team to arrange a private viewing at The Citadel or
              register early interest in upcoming Abuja developments.
            </p>

            <div className="pt-4 space-y-4 border-t border-white/15 text-sm text-slate-200">
              <div className="flex items-start gap-3">
                <MapPin
                  className="w-4 h-4 text-[#E2B45A] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>Abuja, Nigeria · Accra, Ghana</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail
                  className="w-4 h-4 text-[#E2B45A] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>enquiries@quoec.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone
                  className="w-4 h-4 text-[#E2B45A] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>Private Viewings by Appointment</span>
              </div>
            </div>
          </div>

          {/* Right interactive enquiry form */}
          <div className="lg:col-span-7 bg-white text-[#0B1829] rounded-lg p-7 sm:p-9 border border-white/10">
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2
                  className="w-10 h-10 text-emerald-700 mx-auto"
                  aria-hidden="true"
                />
                <h3 className="font-serif text-2xl font-semibold text-[#0B1829]">
                  Enquiry Received
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Quo Engineering &amp; Construction
                  Limited. Our private advisory team will respond to your
                  enquiry shortly.
                </p>
                <GlassButton
                  onClick={() => setSubmitted(false)}
                  className="mt-2"
                >
                  Send Another Enquiry
                </GlassButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#0B1829]">
                    Request Development Information
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Register your interest or schedule a private consultation
                    with our team.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-800"
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="enquiry-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="enquiry-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adaeze Okafor"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="enquiry-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="enquiry-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="enquiry-property"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Development of Interest
                    </label>
                    <select
                      id="enquiry-property"
                      value={selectedSlug}
                      onChange={(e) => setDevelopmentSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    >
                      {developments.map((dev) => (
                        <option key={dev.id} value={dev.id}>
                          {dev.name} ({dev.status})
                        </option>
                      ))}
                      <option value={GENERAL}>General Portfolio Enquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="enquiry-message"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Message *
                  </label>
                  <textarea
                    id="enquiry-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your residence preferences, investment goals, or preferred viewing date."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                  />
                </div>

                <div className="space-y-2.5 text-sm text-slate-700">
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#C89B3C]"
                    />
                    <span>
                      I agree to Quo Engineering &amp; Construction contacting me about this
                      enquiry. *
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={marketingOptIn}
                      onChange={(e) => setMarketingOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#C89B3C]"
                    />
                    <span>Send me news about new developments (optional).</span>
                  </label>
                </div>

                <GlassButton
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3"
                >
                  <span>
                    {submitting ? "Submitting Enquiry..." : "Submit Enquiry"}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </GlassButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
