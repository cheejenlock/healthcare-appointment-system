const { google } = require('googleapis');
const googleAuth = require('./googleAuthService');

/**
 * Create a Google Calendar event for an appointment.
 * Requires: user has authorized via /api/external/calendar/auth first.
 */
async function createCalendarEvent(appointment) {
  const auth = googleAuth.loadAuthorizedClient();
  if (!auth) {
    return {
      error: 'not_authorized',
      message: 'Visit /api/external/calendar/auth first to authorize Google Calendar',
    };
  }

  const calendar = google.calendar({ version: 'v3', auth });

  const startTime = new Date(appointment.scheduled_at);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // +30 min

  const event = {
    summary: `Appointment: ${appointment.patient_name} with Dr. ${appointment.doctor_name}`,
    description: `Specialty: ${appointment.specialty}\nStatus: ${appointment.status}\nNotes: ${appointment.notes || 'N/A'}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Asia/Kuala_Lumpur',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Asia/Kuala_Lumpur',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return {
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
    start: response.data.start,
    end: response.data.end,
  };
}

/**
 * List upcoming events (demo purpose).
 */
async function listUpcomingEvents(maxResults = 5) {
  const auth = googleAuth.loadAuthorizedClient();
  if (!auth) return { error: 'not_authorized' };

  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return (response.data.items || []).map((e) => ({
    id: e.id,
    summary: e.summary,
    start: e.start?.dateTime || e.start?.date,
    htmlLink: e.htmlLink,
  }));
}

module.exports = { createCalendarEvent, listUpcomingEvents };