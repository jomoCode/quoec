/**
 * Legal pages, served at /legal/<slug> and linked from the footer. Modelled on The Citadel website's legal pages.
 * DRAFT wording for the client and counsel to review before launch.
 */

export interface LegalSection {
  heading?: string;
  body: string[];
}

export interface LegalPage {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: Record<"privacy" | "terms" | "disclaimer", LegalPage> = {
  privacy: {
    title: "Privacy policy",
    updated: "24 November 2026",
    sections: [
      {
        body: [
          "This privacy notice explains how Quo Engineering & Construction Limited (“Quo”, “we”) collects and uses personal information through this website, in line with the Nigeria Data Protection Act 2023 and, for visitors in Ghana, the Data Protection Act 2012.",
        ],
      },
      {
        heading: "What we collect",
        body: [
          "Enquiries: the details you choose to give us in the contact form — your name, email address, phone number, the development you are interested in and your message.",
          "Usage information: anonymous information about how the website is used, such as the pages viewed, the buttons clicked, the type of device and the website or campaign that brought you here. It is linked to a random identifier stored in your browser, never to your name or contact details.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "We use your enquiry details to respond to you, arrange viewings and follow up on your interest in our developments. If you opt in, we will also send you news about new developments; you can unsubscribe at any time.",
          "We use usage information to understand which developments and pages are most useful, and to improve the website and our marketing.",
        ],
      },
      {
        heading: "Cookies and similar technologies",
        body: [
          "The website stores a small amount of information in your browser (local storage) to recognise a returning visit and to send usage information reliably. If Google Analytics or Google Tag Manager is enabled, Google may also set cookies. You can clear this information at any time in your browser settings.",
        ],
      },
      {
        heading: "Sharing and retention",
        body: [
          "We do not sell your information. We share it only with service providers who host our website, store our data or help us run our analytics, under contracts that protect it, or where the law requires us to.",
          "We keep enquiry details for as long as needed to deal with your enquiry and any purchase that follows, and usage information for up to 26 months.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may ask to see, correct or delete the personal data we hold about you, or object to how we use it, by emailing enquiries@quoec.com. You may also complain to the Nigeria Data Protection Commission.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & conditions",
    updated: "24 November 2026",
    sections: [
      {
        body: [
          "These terms govern your use of this website, operated by Quo Engineering & Construction Limited. By using the website you accept them.",
        ],
      },
      {
        heading: "Information on this website",
        body: [
          "Descriptions, images, floor areas, specifications and prices are provided for guidance only. They do not form part of any offer or contract and may change without notice. Please confirm all details with our sales team before making any decision.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "The content of this website, including text, renders, photographs, logos and designs, belongs to Quo or its licensors. You may view and share it for personal use, but not copy or reuse it commercially without our written permission.",
        ],
      },
      {
        heading: "Links and liability",
        body: [
          "Links to our individual development websites and to third-party sites are provided for convenience. We are not responsible for third-party content.",
          "We work to keep the website accurate and available, but we cannot guarantee it will always be error-free or uninterrupted. To the extent the law allows, we are not liable for losses arising from its use.",
        ],
      },
      {
        heading: "Governing law",
        body: ["These terms are governed by the laws of the Federal Republic of Nigeria."],
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    updated: "24 November 2026",
    sections: [
      {
        body: [
          "Images on this website include computer-generated architectural renders and illustrative photography. Final finishes, landscaping and specifications may differ.",
          "Floor areas, unit mixes, prices and completion dates are indicative and may change without notice. Nothing on this website constitutes an offer, a contract or financial advice.",
        ],
      },
    ],
  },
};

export type LegalSlug = keyof typeof LEGAL_PAGES;

export const LEGAL_LINKS: { slug: LegalSlug; label: string }[] = [
  { slug: "privacy", label: "Privacy policy" },
  { slug: "terms", label: "Terms & conditions" },
  { slug: "disclaimer", label: "Disclaimer" },
];

/** "/legal/privacy" → "privacy"; anything else → null. */
export function legalSlugFromPath(pathname: string): LegalSlug | null {
  const match = /^\/legal\/([a-z-]+)\/?$/.exec(pathname);
  return match && match[1] in LEGAL_PAGES ? (match[1] as LegalSlug) : null;
}
