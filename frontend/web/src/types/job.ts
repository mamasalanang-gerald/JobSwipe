export interface Job {
  id: number;
  company: string;
  verified: boolean;
  role: string;
  salary: string;
  distance: string;
  type: string;
  tags: string[];
  logo: string;
  images: string[];
  description: string;
  requirements: string[];
  benefits: string[];
}
