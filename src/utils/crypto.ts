/**
 * Hashes a password using SHA-256 with an email-based salt.
 * This ensures the plain-text password never leaves the browser.
 */
export async function hashPassword(password: string, email: string = 'BudgetControlSalt'): Promise<string> {
  const encoder = new TextEncoder();
  // Use lowercase email as a salt to ensure the hash is unique per user
  const data = encoder.encode(password + email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export { hashPassword as hashPasswordInBrowser };
