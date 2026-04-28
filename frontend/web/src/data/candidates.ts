export interface Candidate {
  id: number;
  name: string;
  verified: boolean;
  role: string; // current/desired role title
  salary: string; // expected salary
  distance: string;
  availability: string; // e.g. "Available Now · Remote"
  tags: string[]; // skills
  avatar: string; // primary photo
  images: string[]; // portfolio / work photos
  description: string;
  experience: string[];
  education: string;
  matchScore: number; // 0–100
}

export const candidates: Candidate[] = [
  {
    id: 1,
    name: 'Alex Rivera',
    verified: true,
    role: 'Senior Full Stack Developer',
    salary: '$100k – $120k / yr',
    distance: '3.2 km away',
    availability: 'Available Now · Remote OK',
    tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    avatar: '/assets/images/img1.jpg',
    images: [
      '/assets/images/img1.jpg',
      '/assets/images/accenture2.jpg',
      '/assets/images/accenture3.jpg',
    ],
    description:
      "5+ years building scalable web apps for startups and Fortune 500 companies. Passionate about clean architecture and great developer experience.",
    experience: [
      '5 yrs @ Accenture — Full Stack Engineer',
      '2 yrs @ Socia — Lead Frontend',
      'Open Source contributor (React ecosystem)',
    ],
    education: 'BS Computer Science — UP Diliman',
    matchScore: 94,
  },
  {
    id: 2,
    name: 'Jamie Santos',
    verified: true,
    role: 'UX / Product Designer',
    salary: '$80k – $100k / yr',
    distance: '1.8 km away',
    availability: 'Open to Offers · Hybrid',
    tags: ['Figma', 'Design Systems', 'Prototyping', 'Research'],
    avatar: '/assets/images/img2.jpg',
    images: [
      '/assets/images/img2.jpg',
      '/assets/images/socia.png',
      '/assets/images/socia2.jpg',
    ],
    description:
      "Designer who bridges product thinking and pixel-perfect execution. Built design systems used by 200k+ users. Loves 0→1 product work.",
    experience: [
      '3 yrs @ Socia — Senior Product Designer',
      '2 yrs @ Freelance — Brand & UX',
    ],
    education: 'BA Communication Arts — DLSU',
    matchScore: 88,
  },
  {
    id: 3,
    name: 'Morgan Lee',
    verified: false,
    role: 'Cloud / DevOps Engineer',
    salary: '$120k – $150k / yr',
    distance: '9.5 km away',
    availability: 'Actively Looking · Remote Only',
    tags: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    avatar: '/assets/images/img3.jpg',
    images: [
      '/assets/images/img3.jpg',
      '/assets/images/accenture3.jpg',
    ],
    description:
      "AWS-certified architect who has migrated 40+ enterprise workloads to the cloud. Obsessed with reliability and cost optimisation.",
    experience: [
      '4 yrs @ Alorica — DevOps Lead',
      '3 yrs @ Accenture — Cloud Consultant',
    ],
    education: 'BS Information Technology — ADMU',
    matchScore: 91,
  },
  {
    id: 4,
    name: 'Casey Nguyen',
    verified: true,
    role: 'Data / Marketing Analyst',
    salary: '$70k – $90k / yr',
    distance: '4.1 km away',
    availability: 'Available Now · On-site OK',
    tags: ['SQL', 'Python', 'Tableau', 'Growth'],
    avatar: '/assets/images/img4.jpg',
    images: [
      '/assets/images/img4.jpg',
      '/assets/images/socia3.jpg',
    ],
    description:
      "Data-driven marketer who turns messy datasets into actionable growth playbooks. Built attribution models that reduced CAC by 32%.",
    experience: [
      '3 yrs @ Socia — Growth Analyst',
      '2 yrs @ Startup — Marketing Manager',
    ],
    education: 'BS Statistics — UST',
    matchScore: 79,
  },
  {
    id: 5,
    name: 'Jordan Kim',
    verified: true,
    role: 'Customer Success Manager',
    salary: '$65k – $85k / yr',
    distance: '7.2 km away',
    availability: 'Open to Offers · Hybrid',
    tags: ['Salesforce', 'SaaS', 'Account Management', 'NPS'],
    avatar: '/assets/images/img5.jpg',
    images: [
      '/assets/images/img5.jpg',
      '/assets/images/alorica.jpg',
      '/assets/images/alorica3.jpg',
    ],
    description:
      "CS professional with a track record of 95%+ retention rates across a portfolio of 60 enterprise SaaS accounts. People-first, data-backed.",
    experience: [
      '4 yrs @ Alorica — Sr. Customer Success Manager',
      '2 yrs @ Freelance — SaaS Consultant',
    ],
    education: 'BA Business Administration — FEU',
    matchScore: 85,
  },
];

import {
  IconHome, IconCompass, IconBriefcase, IconChat, IconUser,
} from '@/components/ui/icons';

export const TOTAL = candidates.length;

export const companyNavItems = [
  { id: 'home',       label: 'Dashboard',  Icon: IconHome },
  { id: 'candidates', label: 'Candidates', Icon: IconCompass },
  { id: 'postings',   label: 'Job Posts',  Icon: IconBriefcase },
  { id: 'messages',   label: 'Messages',   Icon: IconChat },
  { id: 'analytics',  label: 'Analytics',  Icon: IconUser },
];