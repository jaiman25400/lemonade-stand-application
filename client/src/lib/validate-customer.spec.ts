import {
  extractNanpDigits,
  formatNanpNational,
  hasCustomerErrors,
  toE164Na,
  validateCustomer,
} from "@/src/lib/validate-customer";

describe("validateCustomer", () => {
  it("accepts a name with email only", () => {
    const errors = validateCustomer({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "",
    });

    expect(errors).toEqual({});
    expect(hasCustomerErrors(errors)).toBe(false);
  });

  it("accepts a name with a 10-digit phone only", () => {
    const errors = validateCustomer({
      name: "Ada Lovelace",
      email: "",
      phone: "4165550100",
    });

    expect(errors).toEqual({});
  });

  it("requires a name with letters", () => {
    expect(validateCustomer({ name: "", email: "a@b.co", phone: "" }).name).toBe(
      "Name is required",
    );
    expect(validateCustomer({ name: "123", email: "a@b.co", phone: "" }).name).toBe(
      "Enter a real name (letters required)",
    );
  });

  it("requires phone or email", () => {
    const errors = validateCustomer({
      name: "Ada Lovelace",
      email: "",
      phone: "",
    });

    expect(errors.contact).toBe("Provide a phone number or an email");
    expect(hasCustomerErrors(errors)).toBe(true);
  });

  it("rejects an incomplete phone when typed", () => {
    const errors = validateCustomer({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "416555",
    });

    expect(errors.phone).toBe("Enter a 10-digit phone number");
  });

  it("rejects an invalid email", () => {
    const errors = validateCustomer({
      name: "Ada",
      email: "not-an-email",
      phone: "",
    });

    expect(errors.email).toBe("Enter a valid email, like ada@example.com");
  });
});

describe("NANP phone helpers", () => {
  it("strips formatting and a leading 1", () => {
    expect(extractNanpDigits("+1 (416) 555-0100")).toBe("4165550100");
    expect(formatNanpNational("4165550100")).toBe("(416) 555-0100");
    expect(toE164Na("4165550100")).toBe("+14165550100");
  });

  it("does not submit a partial number as E.164", () => {
    expect(toE164Na("416555")).toBeUndefined();
  });
});
