export type DevelopmentStatus = 'Upcoming' | 'Ongoing' | 'Completed';

/** What visitors see for each status. The API's "ongoing" is shown as "Now Selling". */
export const STATUS_LABEL: Record<DevelopmentStatus, string> = {
  Upcoming: 'Upcoming',
  Ongoing: 'Now Selling',
  Completed: 'Completed',
};

export interface Development {
  id: string;
  name: string;
  location: string;
  description: string;
  status: DevelopmentStatus;
  featured: boolean;
  displayOrder: number;
  isComingSoon: boolean;
  externalUrl: string;
  featuredImage: string;
  galleryImages: string[];
  /** Optional walkthrough video; shown in place of the featured image when present. */
  featuredVideo?: string;
  residenceSummary?: string;
  updatedAt: string;
}

export type EnquiryStatus = 'New' | 'Contacted' | 'Archived';

export interface Enquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyInterest: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}
