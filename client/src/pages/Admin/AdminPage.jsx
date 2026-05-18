import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaClipboardList,
  FaHardHat,
  FaPlus,
  FaRegClock,
  FaShieldAlt,
  FaTrash,
  FaTools,
  FaUsers,
} from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './AdminPage.css';

const text = {
  craftsManagement: '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0635\u0646\u0639\u0627\u062a',
  craftNameLabel: '\u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0639\u0629',
  craftNamePlaceholder: '\u0645\u062b\u0627\u0644: \u0646\u062c\u0627\u0631\u0629',
  addCraft: '\u0625\u0636\u0627\u0641\u0629 \u0635\u0646\u0639\u0629',
  addingCraft: '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0636\u0627\u0641\u0629...',
  craftsLoading: '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0646\u0639\u0627\u062a...',
  emptyCrafts: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0646\u0639\u0627\u062a \u0628\u0639\u062f.',
  deleteCraft: '\u062d\u0630\u0641',
  deletingCraft: '\u062c\u0627\u0631\u064a \u0627\u0644\u062d\u0630\u0641...',
  workersLinked: '\u0639\u0627\u0645\u0644 \u0645\u0631\u062a\u0628\u0637',
  craftAddSuccess: '\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0635\u0646\u0639\u0629.',
  craftDeleteSuccess:
    '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0635\u0646\u0639\u0629 \u0628\u062f\u0648\u0646 \u062d\u0630\u0641 \u0627\u0644\u0639\u0645\u0627\u0644.',
  craftRequired:
    '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0639\u0629 \u0623\u0648\u0644\u0627\u064b.',
  craftDuplicate:
    '\u0627\u0644\u0635\u0646\u0639\u0629 \u0645\u0648\u062c\u0648\u062f\u0629 \u0645\u0633\u0628\u0642\u0627\u064b.',
  craftAddError:
    '\u062a\u0639\u0630\u0631 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0635\u0646\u0639\u0629.',
  craftDeleteError:
    '\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u0627\u0644\u0635\u0646\u0639\u0629.',
  craftsLoadError:
    '\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0646\u0639\u0627\u062a.',
  craftDeleteConfirm:
    '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0635\u0646\u0639\u0629\u061f \u0627\u0644\u0639\u0645\u0627\u0644 \u0644\u0646 \u064a\u062a\u0645 \u062d\u0630\u0641\u0647\u0645.',
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

function normalizeDashboard(data) {
  return {
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
  };
}

function normalizeCraftRows(data) {
  const rows = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

  return rows
    .filter(Boolean)
    .map((craft) => ({
      id: craft.id,
      name: craft.name || craft.skill_name || '',
      createdAt: craft.createdAt,
      workersCount: Number(craft.workersCount || craft.workers || 0),
    }))
    .filter((craft) => craft.id && craft.name);
}

function AdminPage() {
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [error, setError] = useState('');
  const [crafts, setCrafts] = useState([]);
  const [craftsLoading, setCraftsLoading] = useState(true);
  const [craftName, setCraftName] = useState('');
  const [craftActionError, setCraftActionError] = useState('');
  const [craftActionSuccess, setCraftActionSuccess] = useState('');
  const [addingCraft, setAddingCraft] = useState(false);
  const [deletingCraftId, setDeletingCraftId] = useState(null);

  const handleAdminAuthError = (err) => {
    if (err?.status === 401 || err?.status === 403) {
      localStorage.removeItem('binaa_admin_token');
      localStorage.removeItem('binaa_admin_user');
      navigate('/login', { replace: true });
      return true;
    }

    return false;
  };

  const getAdminHeaders = () => {
    const token = localStorage.getItem('binaa_admin_token');

    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

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
        setDashboard(normalizeDashboard(data));
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

  useEffect(() => {
    const token = localStorage.getItem('binaa_admin_token');
    let isMounted = true;

    if (!token) {
      return () => {
        isMounted = false;
      };
    }

    setCraftsLoading(true);

    fetchJson('/api/admin/crafts?limit=50', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setCrafts(normalizeCraftRows(data));
        setCraftActionError('');
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        if (err?.status === 401 || err?.status === 403) {
          localStorage.removeItem('binaa_admin_token');
          localStorage.removeItem('binaa_admin_user');
          navigate('/login', { replace: true });
          return;
        }

        setCraftActionError(getApiErrorMessage(err, text.craftsLoadError));
      })
      .finally(() => {
        if (isMounted) {
          setCraftsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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

  const refreshCraftStat = (change) => {
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      stats: {
        ...currentDashboard.stats,
        crafts: Math.max(0, Number(currentDashboard.stats.crafts || 0) + change),
      },
    }));
  };

  const handleAddCraft = async (event) => {
    event.preventDefault();

    const cleanName = craftName.trim();

    if (!cleanName) {
      setCraftActionError(text.craftRequired);
      setCraftActionSuccess('');
      return;
    }

    const headers = getAdminHeaders();

    if (!headers) {
      return;
    }

    setAddingCraft(true);
    setCraftActionError('');
    setCraftActionSuccess('');

    try {
      const data = await fetchJson('/api/admin/crafts', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: cleanName }),
      });
      const [createdCraft] = normalizeCraftRows({ items: [data?.item] });

      if (createdCraft) {
        setCrafts((currentCrafts) =>
          [...currentCrafts, createdCraft].sort((first, second) =>
            first.name.localeCompare(second.name, 'ar')
          )
        );
        refreshCraftStat(1);
      }

      setCraftName('');
      setCraftActionSuccess(text.craftAddSuccess);
    } catch (err) {
      if (handleAdminAuthError(err)) {
        return;
      }

      setCraftActionError(err?.status === 409 ? text.craftDuplicate : getApiErrorMessage(err, text.craftAddError));
    } finally {
      setAddingCraft(false);
    }
  };

  const handleDeleteCraft = async (craft) => {
    if (!window.confirm(text.craftDeleteConfirm)) {
      return;
    }

    const headers = getAdminHeaders();

    if (!headers) {
      return;
    }

    setDeletingCraftId(craft.id);
    setCraftActionError('');
    setCraftActionSuccess('');

    try {
      await fetchJson(`/api/admin/crafts/${craft.id}`, {
        method: 'DELETE',
        headers,
      });

      setCrafts((currentCrafts) => currentCrafts.filter((currentCraft) => currentCraft.id !== craft.id));
      refreshCraftStat(-1);
      setCraftActionSuccess(text.craftDeleteSuccess);
    } catch (err) {
      if (handleAdminAuthError(err)) {
        return;
      }

      setCraftActionError(getApiErrorMessage(err, text.craftDeleteError));
    } finally {
      setDeletingCraftId(null);
    }
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

          <section className="admin-panel admin-crafts-panel" aria-labelledby="admin-crafts-title">
            <div className="admin-panel-heading">
              <h2 id="admin-crafts-title">{text.craftsManagement}</h2>
              <FaTools />
            </div>

            <form className="admin-craft-form" onSubmit={handleAddCraft}>
              <label htmlFor="admin-craft-name">{text.craftNameLabel}</label>
              <div className="admin-craft-form-row">
                <input
                  id="admin-craft-name"
                  type="text"
                  value={craftName}
                  onChange={(event) => setCraftName(event.target.value)}
                  placeholder={text.craftNamePlaceholder}
                  disabled={addingCraft}
                />
                <button type="submit" className="admin-primary-action admin-craft-submit" disabled={addingCraft}>
                  <FaPlus />
                  <span>{addingCraft ? text.addingCraft : text.addCraft}</span>
                </button>
              </div>
            </form>

            {craftActionError && <div className="admin-inline-message error">{craftActionError}</div>}
            {craftActionSuccess && <div className="admin-inline-message success">{craftActionSuccess}</div>}

            <div className="admin-craft-list">
              {craftsLoading ? (
                <div className="admin-empty">{text.craftsLoading}</div>
              ) : crafts.length > 0 ? (
                crafts.map((craft) => (
                  <div className="admin-craft-item" key={craft.id}>
                    <div>
                      <strong>{craft.name}</strong>
                      <span>
                        {formatNumber(craft.workersCount)} {text.workersLinked}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="admin-delete-craft-button"
                      onClick={() => handleDeleteCraft(craft)}
                      disabled={deletingCraftId === craft.id}
                      title={text.deleteCraft}
                    >
                      <FaTrash />
                      <span>{deletingCraftId === craft.id ? text.deletingCraft : text.deleteCraft}</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="admin-empty">{text.emptyCrafts}</div>
              )}
            </div>
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
