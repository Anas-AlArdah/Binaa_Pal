import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './OrdersPage.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'بانتظار الرد' },
  { value: 'in_progress', label: 'تم التواصل' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

const STATUS_LABELS = STATUS_OPTIONS.reduce((labels, option) => ({
  ...labels,
  [option.value]: option.label,
}), {});

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('binaa_auth_user') || 'null');
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) {
    return 'غير محدد';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'غير محدد';
  }

  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getWorkerId(user) {
  const id = Number(user?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isWorker(user) {
  return String(user?.role?.type || '').toLowerCase() === 'worker';
}

export default function OrdersPage() {
  const [user] = useState(getStoredUser);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const workerId = getWorkerId(user);
  const canViewOrders = Boolean(workerId && isWorker(user));
  const workerProfilePath = user?.worker_profile?.id
    ? `/profile/${user.worker_profile.id}`
    : '/profile';

  const stats = useMemo(() => {
    const counts = {
      total: requests.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
    };

    requests.forEach((request) => {
      if (counts[request.status] !== undefined) {
        counts[request.status] += 1;
      }
    });

    return counts;
  }, [requests]);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      if (!canViewOrders) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchJson(`/api/worker-request/worker/${workerId}`);

        if (isMounted) {
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'تعذر تحميل الطلبات حالياً.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [canViewOrders, workerId]);

  const updateStatus = async (requestId, status) => {
    setUpdatingId(requestId);
    setError('');

    try {
      const updated = await fetchJson(`/api/worker-request/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      setRequests((current) =>
        current.map((request) => (request.id === requestId ? updated : request))
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر تحديث حالة الطلب.'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!canViewOrders) {
    return (
      <main className="orders-page" dir="rtl">
        <section className="orders-access">
          <span className="orders-access__icon">!</span>
          <h1>صفحة الطلبات مخصصة للعامل</h1>
          <p>سجّل دخولك كعامل حتى تتابع الطلبات التي يرسلها العملاء من صفحة بروفايلك.</p>
          <Link to="/login" className="orders-primary-link">تسجيل الدخول</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page" dir="rtl">
      <section className="orders-hero">
        <div>
          <span className="orders-eyebrow">لوحة العامل</span>
          <h1>طلبات العملاء</h1>
          <p>كل طلب خدمة يرسله العميل من بروفايلك يظهر هنا مع بيانات التواصل والتفاصيل.</p>
        </div>
        <Link to={workerProfilePath} className="orders-profile-link">
          عرض البروفايل
        </Link>
      </section>

      <section className="orders-stats" aria-label="ملخص الطلبات">
        <div className="orders-stat">
          <span>كل الطلبات</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="orders-stat">
          <span>بانتظار الرد</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="orders-stat">
          <span>تم التواصل</span>
          <strong>{stats.in_progress}</strong>
        </div>
        <div className="orders-stat">
          <span>مكتملة</span>
          <strong>{stats.completed}</strong>
        </div>
      </section>

      {error && <div className="orders-alert">{error}</div>}

      {loading ? (
        <section className="orders-empty">
          <div className="orders-loader" />
          <h2>جاري تحميل الطلبات...</h2>
        </section>
      ) : requests.length === 0 ? (
        <section className="orders-empty">
          <span className="orders-empty__icon">📭</span>
          <h2>لا يوجد طلبات بعد</h2>
          <p>عندما يضغط عميل على زر طلب الخدمة في بروفايلك، سيظهر الطلب هنا مباشرة.</p>
        </section>
      ) : (
        <section className="orders-list" aria-label="قائمة الطلبات">
          {requests.map((request) => (
            <article className="orders-card" key={request.id}>
              <div className="orders-card__main">
                <div className="orders-card__top">
                  <div>
                    <span className="orders-card__label">{request.craftName || 'طلب خدمة'}</span>
                    <h2>{request.clientName || 'عميل بناء بال'}</h2>
                  </div>
                  <span className={`orders-status orders-status--${request.status || 'pending'}`}>
                    {STATUS_LABELS[request.status] || request.status || 'بانتظار الرد'}
                  </span>
                </div>

                <p className="orders-card__description">{request.description}</p>

                <div className="orders-meta">
                  <span>التاريخ: {formatDate(request.createdAt || request.date)}</span>
                  <span>المدينة: {request.city || request.clientLocation || 'غير محددة'}</span>
                  <span>الهاتف: {request.clientPhone || 'غير متوفر'}</span>
                  <span>البريد: {request.clientEmail || 'غير متوفر'}</span>
                </div>
              </div>

              <div className="orders-card__actions">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={request.status === option.value ? 'active' : ''}
                    onClick={() => updateStatus(request.id, option.value)}
                    disabled={updatingId === request.id || request.status === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
