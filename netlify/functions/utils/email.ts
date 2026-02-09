// Emails are sent client-side via EmailJS
// This file is kept for backward compatibility

interface EmailOptions {
  to: string
  subject: string
  html: string
  cc?: string
  attachments?: { filename: string; content: string; encoding: string }[]
}

export async function sendEmail(options: EmailOptions) {
  // No-op: emails are now handled on the client side via EmailJS
  console.log(`Email would be sent to: ${options.to}, subject: ${options.subject}`)
}
