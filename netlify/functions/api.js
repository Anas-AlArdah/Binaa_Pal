const normalizeBaseUrl = (value) => (value || '').replace(/\/+$/, '');

const backendUrl = normalizeBaseUrl(
  process.env.BACKEND_URL || process.env.REACT_APP_API_URL
);

const json = (statusCode, payload) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
  },
  body: JSON.stringify(payload),
});

const getApiPath = (event) => {
  const rawPath = event.path || '';
  const functionPrefix = '/.netlify/functions/api';
  const suffix = rawPath.includes(functionPrefix)
    ? rawPath.slice(rawPath.indexOf(functionPrefix) + functionPrefix.length)
    : rawPath.replace(/^\/api/, '');

  return `/api${suffix.startsWith('/') ? suffix : `/${suffix}`}`.replace(/\/+$/, '');
};

const fallbackFor = (apiPath, method) => {
  const endpoint = apiPath.replace(/^\/api\/?/, '');
  const unavailable = {
    message:
      'الخادم الخلفي غير مربوط بعد. أضف BACKEND_URL أو REACT_APP_API_URL في Netlify بعد نشر السيرفر.',
  };

  if (method !== 'GET') {
    return json(503, unavailable);
  }

  if (endpoint.startsWith('search')) {
    return json(200, { workers: [], filters: null, ...unavailable });
  }

  if (
    endpoint === 'skills' ||
    endpoint === 'crafts' ||
    endpoint === 'worker-profiles' ||
    endpoint === 'roles' ||
    endpoint === 'reviews'
  ) {
    return json(200, []);
  }

  return json(503, unavailable);
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  const apiPath = getApiPath(event);

  if (!backendUrl) {
    return fallbackFor(apiPath, event.httpMethod);
  }

  const rawQuery =
    event.rawQuery ||
    (event.rawUrl && event.rawUrl.includes('?') ? event.rawUrl.split('?').slice(1).join('?') : '');
  const targetUrl = `${backendUrl}${apiPath}${rawQuery ? `?${rawQuery}` : ''}`;

  const requestHeaders = { ...(event.headers || {}) };
  delete requestHeaders.host;
  delete requestHeaders['content-length'];

  try {
    const requestBody = ['GET', 'HEAD'].includes(event.httpMethod)
      ? undefined
      : event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64')
        : event.body;

    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: requestBody,
    });

    const body = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json; charset=utf-8',
      },
      body,
    };
  } catch (error) {
    return json(502, {
      message: 'تعذر الاتصال بالخادم الخلفي.',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
};
