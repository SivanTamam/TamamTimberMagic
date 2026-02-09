import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID_QUOTE = import.meta.env.VITE_EMAILJS_TEMPLATE_QUOTE || ''
const TEMPLATE_ID_CONFIRM = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRM || ''
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}

export async function sendQuoteNotification(params: {
  name: string
  email: string
  phone: string
  description: string
  imageCount?: number
}) {
  if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID_QUOTE) {
    console.warn('EmailJS not configured, skipping quote notification email')
    return
  }

  await emailjs.send(SERVICE_ID, TEMPLATE_ID_QUOTE, {
    from_name: params.name,
    from_email: params.email,
    phone: params.phone,
    message: params.description,
    image_count: params.imageCount || 0,
  })
}

export async function sendQuoteConfirmation(params: {
  name: string
  email: string
}) {
  if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID_CONFIRM) {
    console.warn('EmailJS not configured, skipping confirmation email')
    return
  }

  await emailjs.send(SERVICE_ID, TEMPLATE_ID_CONFIRM, {
    to_name: params.name,
    to_email: params.email,
  })
}
