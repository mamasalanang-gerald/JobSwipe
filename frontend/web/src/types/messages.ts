// ─── Shared message types ─────────────────────────────────────────────────────

export interface Message {
  id: number;
  sender: 'me' | 'them' | 'company' | 'candidate';
  text: string;
  time: string;
}

export interface BaseThread {
  id: number;
  role: string;
  status: string;
  lastMessage: string;
  time: string;
  unread: number;
  color: string;
  bg: string;
  messages: Message[];
}

export interface UserThread extends BaseThread {
  company: string;
  initials: string;
  status: 'applied' | 'interview' | 'reviewing' | 'offer' | 'closed';
}

export interface CompanyThread extends BaseThread {
  candidateId: number;
  name: string;
  initials: string;
  avatar: string;
  status: 'invited' | 'interviewing' | 'reviewing' | 'offer' | 'passed';
}

export interface RatingSubmission {
  threadId: number;
  company: string;
  role: string;
  overall: number;
  comment: string;
}

export interface StatusStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
}