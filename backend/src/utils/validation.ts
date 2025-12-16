// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Password validation - minimum 8 characters
export function validatePassword(password: string): boolean {
  return !!(password && password.length >= 8);
}

// Username validation - alphanumeric and underscore, 3-50 chars
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
}

// SQL injection prevention - prepared statements are used
// XSS prevention - input sanitization on frontend + escaping on backend
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"']/g, '');
}
