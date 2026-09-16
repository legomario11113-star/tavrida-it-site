const nodemailer = require('nodemailer');

let transporter = null;

// Транспорт собирается лениво (при первой отправке), а не при загрузке
// модуля — так переменные окружения гарантированно уже подгружены
// dotenv-ом в index.js, независимо от порядка require().
function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT) {
    throw new Error('SMTP_HOST/SMTP_PORT не заданы — проверьте .env');
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });

  return transporter;
}

async function sendRequestNotification({ first_name, last_name, email, phone, message, ip }) {
  const { TO_EMAIL, SMTP_FROM } = process.env;

  if (!TO_EMAIL) {
    throw new Error('TO_EMAIL не задан — проверьте .env');
  }

  const bodyLines = [
    `Имя: ${first_name}`,
    `Фамилия: ${last_name}`,
    `Email: ${email}`,
    `Телефон: ${phone || '—'}`,
    `Комментарий: ${message || '—'}`,
    `IP: ${ip || '—'}`
  ];

  await getTransporter().sendMail({
    from: SMTP_FROM || TO_EMAIL,
    to: TO_EMAIL,
    replyTo: email,
    subject: 'Новая заявка с сайта',
    text: bodyLines.join('\n')
  });
}

module.exports = { sendRequestNotification };
