export type SupportContact = { name: string; email: string; privacyEmail?: string; legalEmail?: string; timezone: string };
export function validateSupportContact(contact: SupportContact): string[] {
  const errors: string[] = [];
  const validEmail = (x?: string) => Boolean(x && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
  if (!contact.name.trim()) errors.push('name-required');
  if (!validEmail(contact.email)) errors.push('email-invalid');
  if (contact.privacyEmail && !validEmail(contact.privacyEmail)) errors.push('privacy-email-invalid');
  if (contact.legalEmail && !validEmail(contact.legalEmail)) errors.push('legal-email-invalid');
  if (!contact.timezone.trim()) errors.push('timezone-required');
  return errors;
}
export function redactContact(contact: SupportContact): Omit<SupportContact, 'email'|'privacyEmail'|'legalEmail'> & { hasPrivacyContact: boolean } {
  return { name: contact.name, timezone: contact.timezone, hasPrivacyContact: Boolean(contact.privacyEmail) };
}
