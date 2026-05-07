import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaClipboardList,
  FaHardHat,
  FaRegClock,
  FaShieldAlt,
  FaTools,
  FaUsers,
} from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './AdminPage.css';

const text = {
  title: 'لوحة الآدمن',
  subtitle: 'متابعة حالة الموقع، المستخدمين، الصنايعية، الطلبات، والصنعات من مكان واحد',
  quickActions: 'إجراءات سريعة',
  recentRequests: 'آخر الطلبات',
  recentWorkers: 'آخر الصنايعية المسجلين',
  platformStatus: 'حالة المنصة',
  customer: 'العميل',
  service: 'الخدمة',
  city: 'المدينة',
  status: 'الحالة',
  priceRange: 'السعر',
  loading: 'جاري تجهيز لوحة الآدمن...',
  emptyRequests: 'لا يوجد طلبات لعرضها حالياً.',
  emptyWorkers: 'لا يوجد صنايعية لعرضهم حالياً.',
};

const fallbackDashboard = {
  stats: {
    users: 0,
    workers: 0,
    requests: 0,
    crafts: 0,
    reviews: 0,
    openRequests: 0,
    completedRequests: 0,
  },
  recentRequests: [],
  recentWorkers: [],
  platform: {
    apiStatus: 'غير معروف',
    databaseStatus: 'غير معروف',
    adminEmail: '',
  },
};

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('ar');
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('ar');
}

function AdminPage() {
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('binaa_admin_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    fetchJson('/api/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        setDashboard({
          ...fallbackDashboard,
          ...data,
          recentRequests: Array.isArray(data?.recentRequests) ? data.recentRequests : [],
          recentWorkers: Array.isArray(data?.recentWorkers) ? data.recentWorkers : [],
          stats: {
            ...fallbackDashboard.stats,
            ...(data?.stats || {}),
          },
          platform: {
            ...fallbackDashboard.platform,
            ...(data?.platform || {}),
          },
        });
        setCheckingAccess(false);
      })
      .catch((err) => {
        if (err?.status === 401 || err?.status === 403) {
          localStorage.removeItem('binaa_admin_token');
          localStorage.removeItem('binaa_admin_user');
          navigate('/login', { replace: true });
          return;
        }

        setError(getApiErrorMessage(err, 'تعذر تحميل بيانات لوحة الآدمن.'));
        setCheckingAccess(false);
      });
  }, [navigate]);

  const stats = useMemo(
    () => [
      {
        label: 'المستخدمون',
        value: dashboard.stats.users,
        note: 'كل الحسابات المسجلة',
        icon: <FaUsers />,
      },
      {
        label: 'الصنايعية',
        value: dashboard.stats.workers,
        note: 'بروفايلات العمال',
        icon: <FaHardHat />,
      },
      {
        label: 'الطلبات',
        value: dashboard.stats.requests,
        note: `${formatNumber(dashboard.stats.openRequests)} طلب مفتوح`,
        icon: <FaClipboardList />,
      },
      {
        label: 'الصنعات',
        value: dashboard.stats.crafts,
        note: 'الخدمات المتاحة',
        icon: <FaTools />,
      },
      {
        label: 'الطلبات المكتملة',
        value: dashboard.stats.completedRequests,
        note: 'طلبات منتهية',
        icon: <FaRegClock />,
      },
      {
        label: 'التقييمات',
        value: dashboard.stats.reviews,
        note: 'مراجعات العملاء',
        icon: <FaShieldAlt />,
      },
    ],
    [dashboard.stats]
  );

  const handleLogout = () => {
    localStorage.removeItem('binaa_admin_token');
    localStorage.removeItem('binaa_admin_user');
    navigate('/login', { replace: true });
  };

  if (checkingAccess) {
    return (
      <div className="admin-screen">
        <Header />
        <main className="admin-page" dir="rtl">
          <div className="admin-shell">
            <div className="admin-loading">{text.loading}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-screen">
      <Header />

      <main className="admin-page" dir="rtl">
        <div className="admin-shell">
          <header className="admin-header">
            <div>
              <span className="admin-eyebrow">
                <FaShieldAlt />
                Admin
              </span>
              <h1>{text.title}</h1>
              <p>{text.subtitle}</p>
            </div>
            <div className="admin-owner-actions">
              <span className="admin-owner-email">{dashboard.platform.adminEmail}</span>
              <button type="button" className="admin-logout-action" onClick={handleLogout}>
                تسجيل الخروج
              </button>
            </div>
          </header>

          {error && <div className="admin-error">{error}</div>}

          <section className="admin-stats" aria-label="Admin statistics">
            {stats.map((item) => (
              <article className="admin-stat-card" key={item.label}>
                <div className="admin-stat-icon">{item.icon}</div>
                <div>
                  <span>{item.label}</span>
                  <strong>{formatNumber(item.value)}</strong>
                  <small>{item.note}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="admin-grid">
            <div className="admin-panel">
              <div className="admin-panel-heading">
                <h2>{text.recentRequests}</h2>
                <FaRegClock />
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{text.customer}</th>
                      <th>{text.service}</th>
                      <th>{text.city}</th>
                      <th>{text.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.customer}</td>
                        <td>
                          {request.service}
                          {formatDate(request.date) && (
                            <small className="admin-table-date">{formatDate(request.date)}</small>
                          )}
                        </td>
                        <td>{request.city}</td>
                        <td>
                          <span className="admin-status">{request.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dashboard.recentRequests.length === 0 && (
                  <div className="admin-empty">{text.emptyRequests}</div>
                )}
              </div>
            </div>

            <aside className="admin-side-stack">
              <div className="admin-panel">
                <h2>{text.platformStatus}</h2>
                <div className="admin-platform-list">
                  <div>
                    <span>الخادم</span>
                    <strong>{dashboard.platform.apiStatus}</strong>
                  </div>
                  <div>
                    <span>قاعدة البيانات</span>
                    <strong>{dashboard.platform.databaseStatus}</strong>
                  </div>
                  <div>
                    <span>إيميل الآدمن</span>
                    <strong>{dashboard.platform.adminEmail || 'غير محدد'}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <h2>{text.recentWorkers}</h2>
                <div className="admin-worker-list">
                  {dashboard.recentWorkers.map((worker) => (
                    <div className="admin-worker-item" key={worker.id}>
                      <div>
                        <strong>{worker.name}</strong>
                        <span>
                          {worker.service} - {worker.city}
                        </span>
                      </div>
                      <b>{worker.priceRange || text.priceRange}</b>
                    </div>
                  ))}
                  {dashboard.recentWorkers.length === 0 && (
                    <div className="admin-empty">{text.emptyWorkers}</div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminPage;
