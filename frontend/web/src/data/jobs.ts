import { Job } from '../types/job';
import {
  IconHome, IconCompass, IconBriefcase, IconChat, IconUser,
} from '../components/ui/icons';

export const jobs: Job[] = [
  {
    id: 1,
    company: 'Accenture',
    verified: true,
    role: 'Senior Full Stack Developer',
    salary: '$95k – $120k / yr',
    distance: '5.3 km away',
    type: 'Full-time · Remote Hybrid',
    tags: ['React', 'Node.js', 'TypeScript'],
    logo: '/assets/images/accenture.jpg',
    images: [
      '/assets/images/accenture2.jpg',
      '/assets/images/accenture3.jpg',
      '/assets/images/accenture.jpg',
    ],
    description:
      "Join Accenture's digital engineering team to build scalable web applications used by Fortune 500 clients. You'll work across the full stack delivering high-impact features with a cross-functional team.",
    requirements: [
      '5+ years of full-stack development experience',
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with REST and GraphQL APIs',
      'Familiarity with CI/CD pipelines and cloud platforms',
    ],
    benefits: ['Health & Dental', 'Remote Flexibility', '401(k) Match', 'Learning Budget'],
  },
  {
    id: 2,
    company: 'Alorica',
    verified: true,
    role: 'Customer Success Manager',
    salary: '$65k – $80k / yr',
    distance: '8.7 km away',
    type: 'Full-time · On-site',
    tags: ['CRM', 'Leadership', 'SaaS'],
    logo: '/assets/images/alorica2.jpg',
    images: [
      '/assets/images/alorica.jpg',
      '/assets/images/alorica3.jpg',
      '/assets/images/alorica2.jpg',
    ],
    description:
      "Lead customer relationships for a portfolio of enterprise SaaS clients. You'll drive adoption, reduce churn, and act as the voice of the customer internally.",
    requirements: [
      '3+ years in customer success or account management',
      'Experience with CRM platforms (Salesforce, HubSpot)',
      'Strong communication and presentation skills',
      'Proven ability to manage multiple accounts simultaneously',
    ],
    benefits: ['PTO Policy', 'Health Insurance', 'Annual Bonus', 'Career Growth'],
  },
  {
    id: 3,
    company: 'Socia',
    verified: false,
    role: 'Product Designer',
    salary: '$80k – $100k / yr',
    distance: '2.1 km away',
    type: 'Contract · Remote',
    tags: ['Figma', 'UX Research', 'Design Systems'],
    logo: '/assets/images/socia.jpg',
    images: [
      '/assets/images/socia.png',
      '/assets/images/socia2.jpg',
      '/assets/images/socia3.jpg',
    ],
    description:
      "Shape the end-to-end design of Socia's consumer mobile app. From discovery research to polished high-fidelity prototypes, you'll own the design process.",
    requirements: [
      'Portfolio demonstrating product design work',
      'Expert-level Figma skills',
      'Experience conducting user research and usability testing',
      'Ability to create and maintain design systems',
    ],
    benefits: ['Fully Remote', 'Flexible Hours', 'Equipment Stipend', 'Stock Options'],
  },
  {
    id: 4,
    company: 'Accenture',
    verified: true,
    role: 'Cloud Solutions Architect',
    salary: '$130k – $160k / yr',
    distance: '12.4 km away',
    type: 'Full-time · Remote',
    tags: ['AWS', 'Kubernetes', 'Terraform'],
    logo: '/assets/images/accenture.jpg',
    images: [
      '/assets/images/accenture3.jpg',
      '/assets/images/accenture2.jpg',
      '/assets/images/accenture.jpg',
    ],
    description:
      "Design and implement cloud infrastructure solutions for enterprise clients. You'll lead architecture reviews, define best practices, and guide engineering teams through cloud migrations.",
    requirements: [
      'AWS Solutions Architect certification (preferred)',
      '7+ years in infrastructure or cloud engineering',
      'Hands-on with Kubernetes, Docker, and Terraform',
      'Experience with multi-cloud and hybrid environments',
    ],
    benefits: ['Top-tier Salary', 'Remote First', 'Training Budget', 'Stock Grants'],
  },
  {
    id: 5,
    company: 'Socia',
    verified: false,
    role: 'Marketing Analytics Lead',
    salary: '$70k – $90k / yr',
    distance: '6.9 km away',
    type: 'Full-time · Hybrid',
    tags: ['Data Studio', 'SQL', 'Growth'],
    logo: '/assets/images/socia2.jpg',
    images: [
      '/assets/images/socia3.jpg',
      '/assets/images/socia2.jpg',
    ],
    description:
      'Own the marketing analytics function at Socia. Build dashboards, run experiments, and translate data into growth insights for the marketing and product teams.',
    requirements: [
      '4+ years in marketing analytics or growth',
      'Strong SQL and data visualization skills',
      'Experience with A/B testing and attribution models',
      'Comfortable presenting insights to executives',
    ],
    benefits: ['Hybrid Schedule', 'Performance Bonus', 'Health Benefits', 'Equity'],
  },
];

export const TOTAL = jobs.length;

export const navItems = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'explore', label: 'Explore', Icon: IconCompass },
  { id: 'applications', label: 'Applications', Icon: IconBriefcase },
  { id: 'messages', label: 'Messages', Icon: IconChat },
  { id: 'profile', label: 'Profile', Icon: IconUser },
];
