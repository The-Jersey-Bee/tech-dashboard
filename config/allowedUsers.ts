/**
 * Access control configuration for Google Sign-In
 * Users must have an email from an allowed domain OR be in the invited users list
 */

// Allowed email domains (users with emails from these domains can sign in)
export const ALLOWED_DOMAINS: string[] = [
  'comminfo.org',
  'jerseybee.org',
];

// Specific invited user emails (for users outside allowed domains)
export const INVITED_USERS: string[] = [
  // Add specific email addresses here, e.g.:
  // 'partner@gmail.com',
  // 'contractor@example.com',
];
