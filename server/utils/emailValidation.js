'use strict';

const { promises: dns } = require('dns');

const DNS_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const domainCache = new Map();

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'dispostable.com',
  'emailondeck.com',
  'fakeinbox.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'maildrop.cc',
  'mailinator.com',
  'mintemail.com',
  'mohmal.com',
  'sharklasers.com',
  'temp-mail.org',
  'tempail.com',
  'tempmail.com',
  'tempmail.net',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
]);

function getEmailDomain(email) {
  const parts = String(email || '').trim().toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : '';
}

function isDisposableEmailDomain(domain) {
  const normalizedDomain = String(domain || '').trim().toLowerCase();

  return [...DISPOSABLE_EMAIL_DOMAINS].some(
    (blockedDomain) => normalizedDomain === blockedDomain
      || normalizedDomain.endsWith(`.${blockedDomain}`)
  );
}

function readCachedDomain(domain) {
  const cached = domainCache.get(domain);

  if (!cached || cached.expiresAt <= Date.now()) {
    domainCache.delete(domain);
    return null;
  }

  return cached.result;
}

function cacheDomainResult(domain, result) {
  if (domainCache.size >= 500) {
    const oldestKey = domainCache.keys().next().value;
    domainCache.delete(oldestKey);
  }

  domainCache.set(domain, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function resolveDomainAddress(domain) {
  let timeoutId;

  try {
    const address = await Promise.race([
      dns.lookup(domain),
      new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(null), DNS_TIMEOUT_MS);
      }),
    ]);

    return address ? { status: 'valid' } : { status: 'unavailable' };
  } catch (error) {
    return ['ENODATA', 'ENOTFOUND'].includes(error.code)
      ? { status: 'invalid' }
      : { status: 'unavailable' };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function resolveMailDomain(domain) {
  const cached = readCachedDomain(domain);

  if (cached) {
    return cached;
  }

  let timeoutId;

  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(null), DNS_TIMEOUT_MS);
      }),
    ]);

    const result = records === null
      ? { status: 'unavailable' }
      : { status: records.length > 0 ? 'valid' : 'invalid' };

    cacheDomainResult(domain, result);
    return result;
  } catch (error) {
    const invalidDomainCodes = new Set(['ENODATA', 'ENOTFOUND']);
    const result = invalidDomainCodes.has(error.code)
      ? { status: 'invalid' }
      : await resolveDomainAddress(domain);

    cacheDomainResult(domain, result);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function validateRegistrationEmail(email) {
  const domain = getEmailDomain(email);

  if (!domain) {
    return { valid: false, code: 'INVALID_EMAIL' };
  }

  if (isDisposableEmailDomain(domain)) {
    return { valid: false, code: 'DISPOSABLE_EMAIL' };
  }

  const domainResult = await resolveMailDomain(domain);

  if (domainResult.status === 'invalid') {
    return { valid: false, code: 'EMAIL_DOMAIN_NOT_FOUND' };
  }

  if (domainResult.status === 'unavailable') {
    return { valid: true, domainCheckSkipped: true };
  }

  return { valid: true };
}

module.exports = {
  getEmailDomain,
  isDisposableEmailDomain,
  validateRegistrationEmail,
};
