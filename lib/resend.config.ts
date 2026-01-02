import { Resend } from "resend";

// Initialize Resend client (will be undefined if API key not set)
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : (null as unknown as Resend);

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Tandem Dent <appointments@tandemdent.com>";
