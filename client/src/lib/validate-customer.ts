export type CustomerForm = {
  name: string;
  email: string;
  phone: string;
};

export const EMPTY_CUSTOMER: CustomerForm = {
  name: "",
  email: "",
  phone: "",
};

export type CustomerErrors = {
  name?: string;
  email?: string;
  phone?: string;
  contact?: string;
};

/** Local-part @ domain with a 2+ letter TLD. Aligns with typical IsEmail checks. */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

/** At least one letter; letters, marks, digits, spaces, hyphen, apostrophe, period. */
const NAME_PATTERN = /^(?=.*\p{L})[\p{L}\p{M}\p{N} .'-]+$/u;

const NANP_LENGTH = 10;

export function extractNanpDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, NANP_LENGTH);
}

export function formatNanpNational(digits: string): string {
  const d = extractNanpDigits(digits);
  if (d.length === 0) {
    return "";
  }
  if (d.length < 4) {
    return d;
  }
  if (d.length < 7) {
    return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  }
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function toE164Na(digits: string): string | undefined {
  const d = extractNanpDigits(digits);
  if (d.length !== NANP_LENGTH) {
    return undefined;
  }
  return `+1${d}`;
}

export function validateCustomer(form: CustomerForm): CustomerErrors {
  const errors: CustomerErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phoneDigits = extractNanpDigits(form.phone);

  if (!name) {
    errors.name = "Name is required";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or less";
  } else if (!NAME_PATTERN.test(name)) {
    errors.name = "Enter a real name (letters required)";
  }

  if (email) {
    if (email.length > 120) {
      errors.email = "Email must be 120 characters or less";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "Enter a valid email, like ada@example.com";
    }
  }

  if (form.phone.trim() && phoneDigits.length !== NANP_LENGTH) {
    errors.phone = "Enter a 10-digit phone number";
  }

  if (!email && phoneDigits.length !== NANP_LENGTH) {
    errors.contact = "Provide a phone number or an email";
  }

  return errors;
}

export function hasCustomerErrors(errors: CustomerErrors): boolean {
  return Object.keys(errors).length > 0;
}
