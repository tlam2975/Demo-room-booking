const nodemailer = require('nodemailer');
const catalog = require('../catalog');

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const singleLine = (value, max) => clean(value, max).replace(/[\r\n\t\u0000-\u001f\u007f]+/g, ' ');
const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const displayDate = value => {
  const [year, month, day] = value.split('-');
  return `${Number(month)}/${Number(day)}/${year}`;
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (Number(req.headers['content-length'] || 0) > 10000) {
    return res.status(413).json({ error: 'Request too large' });
  }

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (body.website) return res.status(200).json({ ok: true });

  const name = singleLine(body.name, 100);
  const roomId = clean(body.roomId, 100);
  const room = catalog.rooms.find(item => item.id === roomId);
  const property = room && catalog.properties.find(item => item.id === room.propertyId);
  const checkIn = clean(body.checkIn, 10);
  const checkOut = clean(body.checkOut, 10);
  const guests = Number(body.guests);
  const requirements = clean(body.requirements, 2000) || 'None specified';
  const email = singleLine(body.email, 254);
  const contact = singleLine(body.contact, 100);

  if (!name || !room || !property || !contact || !validDate(checkIn) || !validDate(checkOut) || checkOut <= checkIn ||
      !Number.isInteger(guests) || guests < 1 || guests > room.capacity ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid enquiry details' });
  }

  const todayParts = new Intl.DateTimeFormat('en', { timeZone: property.timezone || 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const today = `${todayParts.find(part => part.type === 'year').value}-${todayParts.find(part => part.type === 'month').value}-${todayParts.find(part => part.type === 'day').value}`;
  if (checkIn < today) return res.status(400).json({ error: 'Check-in must not be in the past' });

  // Date ranges use [start, end): the checkout day is available for a new arrival.
  if (room.status === 'unavailable' || room.blockedDates.some(range => checkIn < range.end && checkOut > range.start)) {
    return res.status(409).json({ error: 'Room is unavailable for those dates' });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ENQUIRY_TO } = process.env;
  const port = Number(SMTP_PORT);
  if (![SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ENQUIRY_TO].every(Boolean) || !Number.isInteger(port) || port < 1 || port > 65535) {
    return res.status(503).json({ error: 'Enquiry email is unavailable' });
  }

  const message = [
    `Customer ${name} has demand!`,
    '',
    `Room: ${room.name.en}`,
    `Property: ${property.name}`,
    `Date: ${displayDate(checkIn)} - ${displayDate(checkOut)}`,
    `${guests} ${guests === 1 ? 'person' : 'people'}`,
    `Requirements: ${requirements}`,
    `email: ${email}`,
    `contact: ${contact}`,
    '',
    `Room ID: ${room.id}`,
    `Property ID: ${property.id}`
  ].join('\n');

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
    await transporter.sendMail({
      from: SMTP_FROM,
      to: ENQUIRY_TO,
      replyTo: email,
      subject: `Room enquiry: ${room.name.en} — ${property.name}`,
      text: message
    });
    return res.status(200).json({ ok: true });
  } catch {
    // Provider errors may contain account details; keep the public response generic.
    console.error('Could not send enquiry email');
    return res.status(502).json({ error: 'Could not send enquiry email' });
  }
};
