import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './MyServicesPage.css';

const STATUS_LABELS = {
  pending: 'بانتظار الرد',
  in_progress: 'تم التواصل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('binaa_auth_user') || 'null');
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'غير محدد';
  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function MyServicesPage() {
  const [user] = useState(getStoredUser);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const counts = {
      total: requests.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
    };

    requests.forEach((req) => {
      if (counts[req.status] !== undefined) {
        counts[req.status] += 1;
      }
    });

    return counts;
  }, [requests]);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchJson(`/api/worker-request/user/${user.id}`);
        if (isMounted) {
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'تعذر تحميل الخدمات المطلوبة حالياً.'));
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
  }, [user]);

  if (!user) {
    return (
      <main className="myserv-page" dir="rtl">
        <section className="myserv-access">
          <span className="myserv-access__icon">!</span>
          <h1>الرجاء تسجيل الدخول</h1>
          <p>يجب عليك تسجيل الدخول لرؤية الطلبات والخدمات التي قمت بطلبها.</p>
          <Link to="/login" className="myserv-primary-link">تسجيل الدخول</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="myserv-page" dir="rtl">
      {/* Hero Section */}
      <section className="myserv-hero">
        <div className="myserv-hero__info">
          <span className="myserv-eyebrow">طلباتي للحرفيين</span>
          <h1>خدماتي المطلوبة</h1>
          <p>هنا يمكنك متابعة جميع طلبات الصيانة والخدمات التي أرسلتها للحرفيين الآخرين وتفاصيل التواصل معهم.</p>
        </div>
        <Link to="/craftsman" className="myserv-browse-link">
          تصفح الحرفيين
        </Link>
      </section>

      {/* Stats Summary */}
      <section className="myserv-stats" aria-label="ملخص طلباتي">
        <div className="myserv-stat">
          <span>إجمالي الطلبات</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="myserv-stat">
          <span>بانتظار الرد</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="myserv-stat font-highlight">
          <span>قيد التواصل</span>
          <strong>{stats.in_progress}</strong>
        </div>
        <div className="myserv-stat font-success">
          <span>الطلبات المكتملة</span>
          <strong>{stats.completed}</strong>
        </div>
      </section>

      {error && <div className="myserv-alert">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <section className="myserv-empty">
          <div className="myserv-loader" />
          <h2>جاري تحميل طلباتك...</h2>
        </section>
      ) : requests.length === 0 ? (
        <section className="myserv-empty">
          <span className="myserv-empty__icon">🔍</span>
          <h2>لم تطلب أي خدمات بعد</h2>
          <p>تصفح قائمة الحرفيين في المنصة واطلب خدماتهم مباشرة لتظهر طلباتك هنا.</p>
          <Link to="/craftsman" className="myserv-primary-link">ابحث عن حرفي الآن</Link>
        </section>
      ) : (
        <section className="myserv-list" aria-label="قائمة طلباتي للخدمات">
          {requests.map((request) => (
            <article className="myserv-card" key={request.id}>
              <div className="myserv-card__main">
                <div className="myserv-card__top">
                  <div>
                    <span className="myserv-card__label">{request.craftName || 'خدمة صيانة'}</span>
                    <h2>طلب من الحرفي: {request.workerName}</h2>
                  </div>
                  <span className={`myserv-status myserv-status--${request.status || 'pending'}`}>
                    {STATUS_LABELS[request.status] || request.status || 'بانتظار الرد'}
                  </span>
                </div>

                <div className="myserv-card__body">
                  <h4 className="myserv-body__title">تفاصيل الطلب:</h4>
                  <p className="myserv-card__description">{request.description}</p>
                </div>

                <div className="myserv-meta">
                  <div className="myserv-meta-item">
                    <span className="myserv-meta-label">تاريخ الطلب:</span>
                    <span className="myserv-meta-value">{formatDate(request.createdAt || request.date)}</span>
                  </div>
                  <div className="myserv-meta-item">
                    <span className="myserv-meta-label">المدينة المستهدفة:</span>
                    <span className="myserv-meta-value">{request.city || 'غير محددة'}</span>
                  </div>
                  <div className="myserv-meta-item">
                    <span className="myserv-meta-label">رقم هاتف الحرفي:</span>
                    <span className="myserv-meta-value font-ltr">{request.workerPhone || 'غير متوفر'}</span>
                  </div>
                  <div className="myserv-meta-item">
                    <span className="myserv-meta-label">بريد الحرفي:</span>
                    <span className="myserv-meta-value">{request.workerEmail || 'غير متوفر'}</span>
                  </div>
                </div>
              </div>

              <div className="myserv-card__actions">
                {request.workerProfileId && (
                  <Link
                    to={`/profile/${request.workerProfileId}`}
                    className="myserv-action-btn myserv-action-btn--profile"
                  >
                    عرض ملف الحرفي
                  </Link>
                )}
                <a
                  href={`tel:${request.workerPhone}`}
                  className={`myserv-action-btn myserv-action-btn--call ${!request.workerPhone ? 'disabled' : ''}`}
                  onClick={(e) => !request.workerPhone && e.preventDefault()}
                >
                  اتصال بالحرفي 📞
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
