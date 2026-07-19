const normalizeBaseUrl = (baseUrl) => (baseUrl ? baseUrl.replace(/\/+$/, '') : '');
const DEFAULT_PRODUCTION_API_URL = 'https://api-production-56d7.up.railway.app';

const buildApiBaseUrl = () => {
  const envBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL);

  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

  // In local development, we use the proxy defined in package.json.
  // By returning an empty string, the request will go to the same origin (the dev server),
  // which then proxies it to the backend.
  if (isLocalHost) {
    return '';
  }

  return DEFAULT_PRODUCTION_API_URL;
};

const apiBaseUrl = buildApiBaseUrl();

const getStoredToken = (path = '') => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const normalizedPath = String(path || '');
    const adminToken = window.localStorage.getItem('binaa_admin_token') || '';
    const userToken = window.localStorage.getItem('binaa_auth_token') || '';

    if (normalizedPath.startsWith('/api/admin')) {
      return adminToken || userToken;
    }

    return userToken || adminToken;
  } catch {
    return '';
  }
};

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const getApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

const apiFetch = (path, options = {}) => {
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  const hasAuthorization = Object.keys(headers).some(
    (key) => key.toLowerCase() === 'authorization'
  );
  const token = getStoredToken(path);

  if (token && !hasAuthorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
  });
};

export const getApiErrorMessage = (
  error,
  fallbackMessage = 'حدث خطأ غير متوقع أثناء تحميل البيانات.'
) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'تعذر الاتصال بالخادم الخلفي. تأكد من تشغيل مجلد server على المنفذ 3001.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export async function fetchJson(path, options = {}) {
  const response = await apiFetch(path, options);

  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();
  const trimmedBody = rawBody.trim();

  let data = null;

  if (trimmedBody) {
    const looksLikeHtml =
      contentType.includes('text/html') ||
      trimmedBody.startsWith('<!DOCTYPE') ||
      trimmedBody.startsWith('<html');

    if (looksLikeHtml) {
      throw new ApiError(
        'تم استلام صفحة HTML بدل JSON من الـ API. إذا كنت تعمل محلياً، تأكد أن الباكند يعمل على المنفذ 3001.',
        response.status,
        rawBody
      );
    }

    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      throw new ApiError('استجابة الخادم ليست JSON صالحاً.', response.status, rawBody);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}
