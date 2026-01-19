// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Password validation - minimum 8 characters, at least one uppercase, one lowercase, and one digit
export function validatePassword(password: string): boolean {
  if (!password) return false;
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
}

// Username validation - start with letter; allow alphanumeric, underscore, hyphen; 3-20 chars
export function validateUsername(username: string): boolean {
  if (!username) return false;
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;
  return usernameRegex.test(username);
}

// SQL injection prevention - prepared statements are used
// XSS prevention - input sanitization on frontend + escaping on backend
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"']/g, '');
}
