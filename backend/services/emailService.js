const nodemailer = require('nodemailer');

let transporter;
let warnedMissingConfig = false;

const getMailConfig = () => {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const secure = process.env.MAIL_SECURE === 'true';
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const from = process.env.MAIL_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    if (!warnedMissingConfig) {
      console.warn('Mail configuration is incomplete. Booking notifications are disabled.');
      warnedMissingConfig = true;
    }
    return null;
  }

  return {
    host,
    port,
    secure,
    from,
    auth: { user, pass }
  };
};

const getTransporter = () => {
  if (transporter) return transporter;

  const config = getMailConfig();
  if (!config) return null;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  return transporter;
};

const formatBookingDate = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const escapeHtml = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sendBookingNotification = async ({ tenant, booking }) => {
  const recipient = tenant?.owner?.email;
  const config = getMailConfig();
  const mailer = getTransporter();

  if (!recipient || !config || !mailer) {
    return { sent: false, reason: 'Mail service not configured' };
  }

  const businessName = tenant.name || tenant.content?.title || 'Your website';
  const formattedDate = formatBookingDate(booking.datetime);
  const message = booking.message?.trim() || 'No additional message provided.';

  await mailer.sendMail({
    from: config.from,
    to: recipient,
    subject: `New booking enquiry for ${businessName}`,
    text: [
      `You received a new booking enquiry for ${businessName}.`,
      '',
      `Name: ${booking.name}`,
      `Phone: ${booking.phone}`,
      `Preferred time: ${formattedDate}`,
      `Message: ${message}`
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 16px;">New booking enquiry</h2>
        <p>You received a new booking enquiry for <strong>${escapeHtml(businessName)}</strong>.</p>
        <p><strong>Name:</strong> ${escapeHtml(booking.name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(booking.phone)}</p>
        <p><strong>Preferred time:</strong> ${escapeHtml(formattedDate)}</p>
        <p><strong>Message:</strong> ${escapeHtml(message)}</p>
      </div>
    `
  });

  return { sent: true };
};

const formatCurrency = value => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return String(value);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(numericValue);
};

const sendOrderNotification = async ({ tenant, order }) => {
  const recipient = tenant?.owner?.email;
  const config = getMailConfig();
  const mailer = getTransporter();

  if (!recipient || !config || !mailer) {
    return { sent: false, reason: 'Mail service not configured' };
  }

  const businessName = tenant.name || tenant.content?.title || 'Your website';
  const items = order.items || [];
  const itemsText = items
    .map(item => `${item.quantity} x ${item.title}${item.price ? ` (${formatCurrency(item.price)})` : ''}`)
    .join('\n');
  const itemsHtml = items
    .map(
      item =>
        `<li><strong>${escapeHtml(String(item.quantity))} x ${escapeHtml(item.title)}</strong>${
          item.price ? ` - ${escapeHtml(formatCurrency(item.price))}` : ''
        }</li>`
    )
    .join('');

  await mailer.sendMail({
    from: config.from,
    to: recipient,
    subject: `New order received for ${businessName}`,
    text: [
      `You received a new order for ${businessName}.`,
      '',
      `Customer: ${order.customerName}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email || 'Not provided'}`,
      `Address: ${order.address || 'Not provided'}`,
      '',
      'Items:',
      itemsText,
      '',
      `Total: ${formatCurrency(order.totalAmount)}`,
      `Notes: ${order.notes || 'No additional notes provided.'}`
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 16px;">New restaurant order</h2>
        <p>You received a new order for <strong>${escapeHtml(businessName)}</strong>.</p>
        <p><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(order.email || 'Not provided')}</p>
        <p><strong>Address:</strong> ${escapeHtml(order.address || 'Not provided')}</p>
        <p><strong>Total:</strong> ${escapeHtml(formatCurrency(order.totalAmount))}</p>
        <p><strong>Items:</strong></p>
        <ul>${itemsHtml}</ul>
        <p><strong>Notes:</strong> ${escapeHtml(order.notes || 'No additional notes provided.')}</p>
      </div>
    `
  });

  return { sent: true };
};

module.exports = { sendBookingNotification, sendOrderNotification };
