export type DevelopmentStatus = 'Upcoming' | 'Ongoing' | 'Completed';

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
