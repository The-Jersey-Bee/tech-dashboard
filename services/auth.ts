import { User } from '../types';
import { ALLOWED_DOMAINS, INVITED_USERS } from '../config/allowedUsers';

const AUTH_TOKEN_KEY = 'google_auth_token';
const AUTH_USER_KEY = 'google_auth_user';

interface GoogleJwtPayload {
  sub: string;      // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  exp: number;      // Expiry timestamp (seconds since epoch)
  iat: number;      // Issued at timestamp
}

/**
 * Decode a Google JWT credential to extract user information
 * Note: This decodes without cryptographic verification since Google's
 * Identity Services library already verified the token before returning it
 */
export function decodeGoogleToken(credential: string): GoogleJwtPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (middle part) from Base64URL
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as GoogleJwtPayload;
  } catch (error) {
    console.error('Failed to decode Google token:', error);
    return null;
  }
}

/**
 * Convert JWT payload to our User type
 */
export function jwtPayloadToUser(payload: GoogleJwtPayload): User {
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

/**
 * Store auth token and user info in localStorage
 */
export function storeAuthToken(credential: string, user: User): void {
  localStorage.setItem(AUTH_TOKEN_KEY, credential);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * Get stored auth token from localStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): User | null {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (!userJson) {
    return null;
  }
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

/**
 * Clear auth token and user from localStorage
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Check if a JWT token is expired
 * Adds a 60-second buffer to account for clock skew
 */
export function isTokenExpired(credential: string): boolean {
  const payload = decodeGoogleToken(credential);
  if (!payload) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const bufferSeconds = 60; // 1 minute buffer

  return payload.exp < (nowInSeconds + bufferSeconds);
}

/**
 * Check if an email is authorized to access the dashboard
 * Returns true if email domain is in allowed list or email is in invited list
 */
export function isAuthorizedUser(email: string): boolean {
  const lowerEmail = email.toLowerCase();

  // Check if email is in the invited users list
  if (INVITED_USERS.some(invited => invited.toLowerCase() === lowerEmail)) {
    return true;
  }

  // Check if email domain is in the allowed domains list
  const domain = lowerEmail.split('@')[1];
  if (domain && ALLOWED_DOMAINS.some(allowed => allowed.toLowerCase() === domain)) {
    return true;
  }

  return false;
}

/**
 * Try to restore a valid session from localStorage
 * Returns user if session is valid, null otherwise
 */
export function tryRestoreSession(): User | null {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    clearAuthToken();
    return null;
  }

  if (isTokenExpired(token)) {
    clearAuthToken();
    return null;
  }

  // Verify user is still authorized (in case allowlist changed)
  if (!isAuthorizedUser(user.email)) {
    clearAuthToken();
    return null;
  }

  return user;
}
