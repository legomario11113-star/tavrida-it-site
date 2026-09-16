const express = require('express');
const rateLimit = require('express-rate-limit');
const { insertSubmission } = require('../db');
const { sendRequestNotification } = require('../mailer');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 минут
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Слишком много заявок с вашего IP. Попробуйте позже.' }
});

router.post('/request', requestLimiter, async (req, res) => {
  const body = req.body || {};

  const first_name = String(body.first_name || '').trim();
  const last_name = String(body.last_name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const message = String(body.message || '').trim();
  const website = String(body.website || '').trim(); // honeypot

  // Honeypot: скрытое от людей поле. Бот его заполнил — тихо отвечаем
  // успехом, ничего не сохраняем и не отправляем.
  if (website) {
    return res.json({ ok: true });
  }

  if (!first_name || !last_name || !email) {
    return res.status(400).json({
      ok: false,
      error: 'Заполните имя, фамилию и email.'
    });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ ok: false, error: 'Укажите корректный email.' });
  }

  const submission = { first_name, last_name, email, phone, message, ip: req.ip };

  try {
    insertSubmission(submission);
  } catch (err) {
    console.error('Ошибка сохранения заявки в БД:', err);
    return res.status(500).json({ ok: false, error: 'Не удалось сохранить заявку. Попробуйте позже.' });
  }

  try {
    await sendRequestNotification(submission);
  } catch (err) {
    console.error('Ошибка отправки письма:', err);
    // Заявка уже сохранена — не отвечаем ошибкой, чтобы клиент не решил,
    // что заявка потерялась и не отправил её повторно.
    return res.json({ ok: true, warning: 'Заявка сохранена, но письмо не отправлено.' });
  }

  res.json({ ok: true });
});

module.exports = router;
