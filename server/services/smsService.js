const axios = require('axios');

const TEXTBELT_URL = 'https://textbelt.com/text';
const TEXTBELT_KEY = process.env.TEXTBELT_KEY || 'textbelt';

async function sendSms(to, body) {
  if (!to) return { skipped: true, reason: 'no_recipient' };

  try {
    const { data } = await axios.post(TEXTBELT_URL, {
      phone: to,
      message: body,
      key: TEXTBELT_KEY,
    }, { timeout: 10000 });

    if (data.success) {
      console.log(`[SMS][Textbelt] Sent to ${to}`);
      return { provider: 'textbelt', status: 'sent', quotaRemaining: data.quotaRemaining };
    }

    console.warn('[SMS][Textbelt] Rejected:', data.error);
    return { provider: 'textbelt', error: data.error };
  } catch (err) {
    console.error('[SMS][Textbelt] Request failed:', err.message);
    return { error: err.message };
  }
}

function appointmentCreatedTemplate(patientName, doctorName, scheduledAt) {
  const when = new Date(scheduledAt).toLocaleString('en-MY', {
    dateStyle: 'medium', timeStyle: 'short',
  });
  return `Hi ${patientName}, your appointment with Dr. ${doctorName} is booked for ${when}.`;
}

function appointmentStatusTemplate(patientName, doctorName, scheduledAt, status) {
  const when = new Date(scheduledAt).toLocaleString('en-MY', {
    dateStyle: 'medium', timeStyle: 'short',
  });
  return `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${when} is now ${status.toUpperCase()}.`;
}

module.exports = {
  sendSms,
  appointmentCreatedTemplate,
  appointmentStatusTemplate,
};