/**
 * Test Accounts Configuration
 * 
 * These accounts can be used for local testing without API calls.
 * Enable test mode in the login/register screens to use these accounts.
 */

export const TEST_MODE_ENABLED = true; // Set to false to disable test mode

export interface TestAccount {
  email: string;
  password: string;
  role: 'applicant' | 'hr' | 'company_admin';
  token: string;
  profile?: any;
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'applicant@test.com',
    password: 'Test1234',
    role: 'applicant',
    token: 'test_token_applicant_001',
    profile: {
      first_name: 'John',
      last_name: 'Doe',
      location: 'Manila, Metro Manila',
      bio: 'Experienced software developer looking for new opportunities',
      skills: ['JavaScript', 'React', 'Node.js', 'Leadership', 'Communication'],
    },
  },
  {
    email: 'applicant2@test.com',
    password: 'Test1234',
    role: 'applicant',
    token: 'test_token_applicant_002',
    profile: {
      first_name: 'Jane',
      last_name: 'Smith',
      location: 'Cebu City, Cebu',
      bio: 'Marketing professional with 5 years of experience',
      skills: ['Marketing', 'SEO', 'Content Strategy', 'Creativity', 'Teamwork'],
    },
  },
  {
    email: 'hr@test.com',
    password: 'Test1234',
    role: 'hr',
    token: 'test_token_hr_001',
    profile: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      company_name: 'Tech Corp',
      job_title: 'HR Manager',
    },
  },
  {
    email: 'admin@test.com',
    password: 'Test1234',
    role: 'company_admin',
    token: 'test_token_company_admin_001',
    profile: {
      first_name: 'Michael',
      last_name: 'Brown',
      company_name: 'Tech Corp',
      company_description: 'Leading technology company in the Philippines',
      company_industry: 'Technology',
      company_size: '50-200',
    },
  },
  // Additional company accounts for testing existing companies
  {
    email: 'hr@innovate.com',
    password: 'Test1234',
    role: 'hr',
    token: 'test_token_hr_002',
    profile: {
      first_name: 'Maria',
      last_name: 'Garcia',
      company_name: 'Innovate Solutions Inc.',
      job_title: 'Senior Recruiter',
    },
  },
  {
    email: 'admin@innovate.com',
    password: 'Test1234',
    role: 'company_admin',
    token: 'test_token_company_admin_002',
    profile: {
      first_name: 'Carlos',
      last_name: 'Reyes',
      company_name: 'Innovate Solutions Inc.',
      company_description: 'A fast-growing startup specializing in AI and machine learning solutions for businesses across Southeast Asia.',
      company_industry: 'Artificial Intelligence',
      company_size: '11-50',
    },
  },
  {
    email: 'hr@globalbank.ph',
    password: 'Test1234',
    role: 'hr',
    token: 'test_token_hr_003',
    profile: {
      first_name: 'Patricia',
      last_name: 'Santos',
      company_name: 'Global Bank Philippines',
      job_title: 'Talent Acquisition Lead',
    },
  },
  {
    email: 'admin@globalbank.ph',
    password: 'Test1234',
    role: 'company_admin',
    token: 'test_token_company_admin_003',
    profile: {
      first_name: 'Roberto',
      last_name: 'Cruz',
      company_name: 'Global Bank Philippines',
      company_description: 'One of the leading financial institutions in the Philippines, offering comprehensive banking and financial services.',
      company_industry: 'Banking & Finance',
      company_size: '1000+',
    },
  },
  {
    email: 'hr@healthplus.com',
    password: 'Test1234',
    role: 'hr',
    token: 'test_token_hr_004',
    profile: {
      first_name: 'Dr. Anna',
      last_name: 'Mendoza',
      company_name: 'HealthPlus Medical Center',
      job_title: 'HR Director',
    },
  },
  {
    email: 'admin@healthplus.com',
    password: 'Test1234',
    role: 'company_admin',
    token: 'test_token_company_admin_004',
    profile: {
      first_name: 'Dr. Ramon',
      last_name: 'Villanueva',
      company_name: 'HealthPlus Medical Center',
      company_description: 'Premier healthcare provider with state-of-the-art facilities and a team of highly qualified medical professionals.',
      company_industry: 'Healthcare',
      company_size: '201-500',
    },
  },
  {
    email: 'hr@creativeagency.ph',
    password: 'Test1234',
    role: 'hr',
    token: 'test_token_hr_005',
    profile: {
      first_name: 'Isabella',
      last_name: 'Torres',
      company_name: 'Creative Minds Agency',
      job_title: 'People Operations Manager',
    },
  },
  {
    email: 'admin@creativeagency.ph',
    password: 'Test1234',
    role: 'company_admin',
    token: 'test_token_company_admin_005',
    profile: {
      first_name: 'Marco',
      last_name: 'Dela Cruz',
      company_name: 'Creative Minds Agency',
      company_description: 'Award-winning creative agency specializing in branding, digital marketing, and innovative advertising campaigns.',
      company_industry: 'Marketing & Advertising',
      company_size: '11-50',
    },
  },
];

export const TEST_OTP_CODE = '123456';

export interface TestCompanyInvite {
  code: string;
  company_name: string;
  valid: boolean;
  company_email_domain?: string;
}

export const TEST_COMPANY_INVITES: TestCompanyInvite[] = [
  {
    code: 'INVITE123',
    company_name: 'Tech Corp',
    valid: true,
    company_email_domain: 'techcorp.com',
  },
  {
    code: 'INNOVATE2024',
    company_name: 'Innovate Solutions Inc.',
    valid: true,
    company_email_domain: 'innovate.com',
  },
  {
    code: 'BANK2024',
    company_name: 'Global Bank Philippines',
    valid: true,
    company_email_domain: 'globalbank.ph',
  },
  {
    code: 'HEALTH2024',
    company_name: 'HealthPlus Medical Center',
    valid: true,
    company_email_domain: 'healthplus.com',
  },
  {
    code: 'CREATIVE2024',
    company_name: 'Creative Minds Agency',
    valid: true,
    company_email_domain: 'creativeagency.ph',
  },
];

// Legacy export for backward compatibility
export const TEST_COMPANY_INVITE = TEST_COMPANY_INVITES[0];

/**
 * Find a test account by email
 */
export function findTestAccount(email: string): TestAccount | undefined {
  return TEST_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Validate test account credentials
 */
export function validateTestCredentials(
  email: string,
  password: string
): TestAccount | null {
  const account = findTestAccount(email);
  if (account && account.password === password) {
    return account;
  }
  return null;
}

/**
 * Check if email is a test account
 */
export function isTestAccount(email: string): boolean {
  return findTestAccount(email) !== undefined;
}

/**
 * Generate mock registration response
 */
export function mockRegistrationResponse(email: string, role: string) {
  return {
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: {
      email,
      role,
      verification_required: true,
    },
  };
}

/**
 * Generate mock OTP verification response
 */
export function mockOtpVerificationResponse(email: string, code: string) {
  if (code !== TEST_OTP_CODE) {
    throw new Error('Invalid verification code');
  }

  const account = findTestAccount(email);
  if (!account) {
    throw new Error('Account not found');
  }

  return {
    success: true,
    token: account.token,
    user: {
      email: account.email,
      role: account.role,
      profile: account.profile,
    },
  };
}

/**
 * Generate mock invite validation response
 */
export function mockInviteValidation(code: string) {
  const invite = TEST_COMPANY_INVITES.find(inv => inv.code === code);
  if (invite) {
    return {
      valid: true,
      company_name: invite.company_name,
      role: 'hr',
    };
  }
  throw new Error('Invalid invite code');
}

/**
 * Get company by email domain
 */
export function getCompanyByEmailDomain(email: string): TestCompanyInvite | undefined {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return undefined;
  
  return TEST_COMPANY_INVITES.find(
    invite => invite.company_email_domain?.toLowerCase() === domain
  );
}

/**
 * Check if email belongs to a test company
 */
export function isCompanyEmail(email: string): boolean {
  return getCompanyByEmailDomain(email) !== undefined;
}

/**
 * Get all test companies
 */
export function getAllTestCompanies(): Array<{
  name: string;
  domain: string;
  inviteCode: string;
  adminEmail: string;
  hrEmail: string;
}> {
  return [
    {
      name: 'Tech Corp',
      domain: 'techcorp.com',
      inviteCode: 'INVITE123',
      adminEmail: 'admin@test.com',
      hrEmail: 'hr@test.com',
    },
    {
      name: 'Innovate Solutions Inc.',
      domain: 'innovate.com',
      inviteCode: 'INNOVATE2024',
      adminEmail: 'admin@innovate.com',
      hrEmail: 'hr@innovate.com',
    },
    {
      name: 'Global Bank Philippines',
      domain: 'globalbank.ph',
      inviteCode: 'BANK2024',
      adminEmail: 'admin@globalbank.ph',
      hrEmail: 'hr@globalbank.ph',
    },
    {
      name: 'HealthPlus Medical Center',
      domain: 'healthplus.com',
      inviteCode: 'HEALTH2024',
      adminEmail: 'admin@healthplus.com',
      hrEmail: 'hr@healthplus.com',
    },
    {
      name: 'Creative Minds Agency',
      domain: 'creativeagency.ph',
      inviteCode: 'CREATIVE2024',
      adminEmail: 'admin@creativeagency.ph',
      hrEmail: 'hr@creativeagency.ph',
    },
  ];
}
