import type { Lead } from '@/app/api/leads/route';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatLeadMessage(lead: Lead): string {
  const lines = [
    '<b>Новая заявка с сайта</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
  ];

  if (lead.comment) {
    lines.push(`<b>Комментарий:</b> ${escapeHtml(lead.comment)}`);
  }
  if (lead.context) {
    lines.push(`<b>Страница:</b> ${escapeHtml(lead.context)}`);
  }

  const utmParts = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean);
  if (utmParts.length > 0) {
    lines.push(`<b>UTM:</b> ${escapeHtml(utmParts.join(' / '))}`);
  }
  if (lead.utmContent) {
    lines.push(`<b>utm_content:</b> ${escapeHtml(lead.utmContent)}`);
  }
  if (lead.utmTerm) {
    lines.push(`<b>utm_term:</b> ${escapeHtml(lead.utmTerm)}`);
  }
  if (lead.landingPage) {
    lines.push(`<b>Посадочная:</b> ${escapeHtml(lead.landingPage)}`);
  }
  if (lead.referrer) {
    lines.push(`<b>Referrer:</b> ${escapeHtml(lead.referrer)}`);
  }

  const when = new Date(lead.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  lines.push('', `<i>${when} (МСК)</i>`);

  return lines.join('\n');
}

export async function notifyTelegramLead(lead: Lead): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return false;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatLeadMessage(lead),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('[telegram] send failed:', detail);
    return false;
  }

  return true;
}
