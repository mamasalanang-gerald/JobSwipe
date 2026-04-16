export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  tags: string[];
  postedAt: string;
}

export interface SwipeAction {
  jobId: string;
  direction: 'left' | 'right';
  timestamp: Date;
}   