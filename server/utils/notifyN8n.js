const axios = require('axios');

const DEFAULT_TIMEOUT_MS = 10000;

async function notifyN8n(payload) {
  const webhookUrl = process.env.N8N_WORKER_REQUEST_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      ok: false,
      status: 0,
      error: 'N8N_WORKER_REQUEST_WEBHOOK_URL is not configured.',
    };
  }

  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: Number(process.env.N8N_WEBHOOK_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
      validateStatus: () => true,
    });

    const responseIndicatesError =
      response.data &&
      typeof response.data === 'object' &&
      (response.data.success === false || response.data.error);

    return {
      ok: response.status >= 200 && response.status < 300 && !responseIndicatesError,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error('Failed to notify n8n worker request webhook:', error.message);

    return {
      ok: false,
      status: error.response?.status || 0,
      data: error.response?.data,
      error: error.message,
    };
  }
}

module.exports = {
  notifyN8n,
};
