import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiAlertTriangle,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiEdit3,
  FiFilter,
  FiGrid,
  FiLock,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiShield,
  FiTool,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import {
  FaBolt,
  FaHammer,
  FaLayerGroup,
  FaPaintRoller,
  FaThLarge,
  FaWindowMaximize,
  FaWrench,
} from 'react-icons/fa';
import { GiBrickWall } from 'react-icons/gi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './AdminPage.css';

const text = {
  title: 'لوحة تحكم الأدمن',
  subtitle: 'إدارة تشغيلية كاملة للمستخدمين، الصنايعية، الطلبات، والصنعات من مكان واحد.',
  loading: 'جاري تجهيز لوحة التحكم...',
  refresh: 'تحديث البيانات',
  logout: 'تسجيل الخروج',
  searchPlaceholder: 'ابحث بالاسم، البريد، المدينة، الخدمة...',
  allStatuses: 'كل الحالات',
  noResults: 'لا توجد نتائج مطابقة.',
  platformStatus: 'حالة المنصة',
  adminPowers: 'صلاحيات الأدمن',
  requestsManagement: 'إدارة الطلبات',
  usersManagement: 'إدارة المستخدمين',
  workersManagement: 'إدارة الصنايعية',
  craftsManagement: 'إدارة الصنعات',
  recentRequests: 'آخر الطلبات',
  recentWorkers: 'صنايعية جدد',
  addCraft: 'إضافة صنعة',
  addingCraft: 'جاري الإضافة...',
  save: 'حفظ',
  saving: 'جاري الحفظ...',
  cancel: 'إلغاء',
  deleteCraft: 'حذف',
  deletingCraft: 'جاري الحذف...',
  craftNameLabel: 'اسم الصنعة',
  craftNamePlaceholder: 'مثال: نجارة',
  craftSlugLabel: 'معرّف رابط الصنعة',
  craftSlugPlaceholder: 'مثال: appliance-repair',
  craftDescriptionLabel: 'وصف الصنعة',
  craftDescriptionPlaceholder: 'اكتب وصفاً واضحاً للخدمات التي تشملها الصنعة',
  craftIconLabel: 'أيقونة الصنعة',
  craftRequired: 'أكمل جميع مواصفات الصنعة قبل الحفظ.',
  craftDuplicate: 'الصنعة موجودة مسبقاً.',
  craftAddSuccess: 'تمت إضافة الصنعة.',
  craftUpdateSuccess: 'تم تعديل الصنعة.',
  craftDeleteSuccess: 'تم حذف الصنعة بدون حذف العمال.',
  craftAddError: 'تعذر إضافة الصنعة.',
  craftUpdateError: 'تعذر تعديل الصنعة.',
  craftDeleteError: 'تعذر حذف الصنعة.',
  craftDeleteConfirm: 'هل أنت متأكد من حذف هذه الصنعة؟ سيتم فك ارتباطها من العمال بدون حذف العمال.',
  requestsLoadError: 'تعذر تحميل الطلبات.',
  usersLoadError: 'تعذر تحميل المستخدمين.',
  workersLoadError: 'تعذر تحميل الصنايعية.',
  craftsLoadError: 'تعذر تحميل الصنعات.',
  requestStatusError: 'تعذر تحديث حالة الطلب.',
  dashboardLoadError: 'تعذر تحميل بيانات لوحة الأدمن.',
  workersLinked: 'عامل مرتبط',
  unknown: 'غير محدد',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'بانتظار الرد' },
  { value: 'in_progress', label: 'تم التواصل' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

const STATUS_LABELS = STATUS_OPTIONS.reduce(
  (labels, status) => ({
    ...labels,
    [status.value]: status.label,
  }),
  {
    done: 'مكتمل',
    closed: 'مغلق',
    new: 'جديد',
  }
);

const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: FiGrid },
  { id: 'requests', label: 'الطلبات', icon: FiClock },
  { id: 'users', label: 'المستخدمين', icon: FiUsers },
  { id: 'workers', label: 'الصنايعية', icon: FiBriefcase },
  { id: 'crafts', label: 'الصنعات', icon: FiTool },
  { id: 'permissions', label: 'الصلاحيات', icon: FiLock },
];

const CRAFT_ICON_OPTIONS = [
  { value: 'tiling', label: 'تبليط', Icon: FaThLarge },
  { value: 'painting', label: 'دهان', Icon: FaPaintRoller },
  { value: 'electrical', label: 'كهرباء', Icon: FaBolt },
  { value: 'plumbing', label: 'سباكة', Icon: FaWrench },
  { value: 'gypsum', label: 'جبس وأسقف', Icon: FaLayerGroup },
  { value: 'carpentry', label: 'نجارة', Icon: FaHammer },
  { value: 'aluminum', label: 'ألمنيوم وحديد', Icon: FaWindowMaximize },
  { value: 'masonry', label: 'بناء وحجر', Icon: GiBrickWall },
];

const CRAFT_ICON_BY_KEY = Object.fromEntries(
  CRAFT_ICON_OPTIONS.map(({ value, Icon }) => [value, Icon])
);

const EMPTY_CRAFT_DRAFT = Object.freeze({
  skill_name: '',
  slug: '',
  description: '',
  icon_key: '',
});

function cleanCraftDraft(draft = {}) {
  return {
    skill_name: String(draft.skill_name || draft.name || '').trim(),
    slug: String(draft.slug || '').trim().toLowerCase(),
    description: String(draft.description || '').trim(),
    icon_key: String(draft.icon_key || draft.iconKey || '').trim().toLowerCase(),
  };
}

function getCraftDraftError(draft) {
  const cleanDraft = cleanCraftDraft(draft);

  if (Object.values(cleanDraft).some((value) => !value)) {
    return text.craftRequired;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanDraft.slug)) {
    return 'معرّف الرابط يقبل أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط.';
  }

  if (cleanDraft.description.length < 10) {
    return 'اكتب وصفاً واضحاً للصنعة من 10 أحرف على الأقل.';
  }

  if (!CRAFT_ICON_BY_KEY[cleanDraft.icon_key]) {
    return 'اختر أيقونة الصنعة من الخيارات المتاحة.';
  }

  return '';
}

function CraftFields({ idPrefix, value, onChange, disabled = false, autoFocus = false }) {
  const updateField = (field, fieldValue) => {
    onChange((current) => ({
      ...current,
      [field]: fieldValue,
    }));
  };

  return (
    <div className="admin-craft-fields">
      <label htmlFor={`${idPrefix}-name`}>
        <span>{text.craftNameLabel}</span>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={value.skill_name}
          onChange={(event) => updateField('skill_name', event.target.value)}
          placeholder={text.craftNamePlaceholder}
          maxLength={120}
          disabled={disabled}
          autoFocus={autoFocus}
          required
        />
      </label>

      <label htmlFor={`${idPrefix}-slug`}>
        <span>{text.craftSlugLabel}</span>
        <input
          id={`${idPrefix}-slug`}
          type="text"
          dir="ltr"
          value={value.slug}
          onChange={(event) => updateField('slug', event.target.value)}
          placeholder={text.craftSlugPlaceholder}
          maxLength={120}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          disabled={disabled}
          required
        />
      </label>

      <label className="admin-craft-fields__description" htmlFor={`${idPrefix}-description`}>
        <span>{text.craftDescriptionLabel}</span>
        <textarea
          id={`${idPrefix}-description`}
          value={value.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder={text.craftDescriptionPlaceholder}
          minLength={10}
          maxLength={1000}
          rows={3}
          disabled={disabled}
          required
        />
      </label>

      <fieldset className="admin-craft-icon-picker" disabled={disabled}>
        <legend>{text.craftIconLabel}</legend>
        <div className="admin-craft-icon-options">
          {CRAFT_ICON_OPTIONS.map(({ value: iconKey, label, Icon }) => (
            <button
              key={iconKey}
              type="button"
              className={value.icon_key === iconKey ? 'is-selected' : ''}
              aria-pressed={value.icon_key === iconKey}
              onClick={() => updateField('icon_key', iconKey)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

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
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('ar');
}

function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase();
}

function compact(values) {
  return values.filter(Boolean).join(' ');
}

function statusLabel(status) {
  const cleanStatus = normalizeSearch(status);
  return STATUS_LABELS[cleanStatus] || status || text.unknown;
}

function statusClass(status) {
  const cleanStatus = normalizeSearch(status).replace(/\s+/g, '_');
  const aliases = {
    مكتمل: 'completed',
    مغلق: 'closed',
    جديد: 'new',
  };

  if (aliases[cleanStatus]) {
    return aliases[cleanStatus];
  }

  return cleanStatus || 'unknown';
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

function getItems(data) {
  return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
}

function normalizeCraftRows(data) {
  return getItems(data)
    .filter(Boolean)
    .map((craft) => ({
      id: craft.id,
      name: craft.name || craft.skill_name || '',
      skill_name: craft.skill_name || craft.name || '',
      slug: craft.slug || '',
      description: craft.description || '',
      icon_key: craft.icon_key || craft.iconKey || '',
      createdAt: craft.createdAt,
      workersCount: Number(craft.workersCount || craft.workers || 0),
    }))
    .filter((craft) => craft.id && craft.name);
}

function normalizeUserRows(data) {
  return getItems(data).map((user) => ({
    id: user.id,
    name: user.name || compact([user.firstname, user.lastname]) || user.email || text.unknown,
    email: user.email || '',
    phone: user.phone || '',
    city: user.location || '',
    role: user.role || text.unknown,
    createdAt: user.createdAt,
  }));
}

function normalizeWorkerRows(data) {
  return getItems(data).map((worker) => ({
    id: worker.id,
    name: worker.name || text.unknown,
    email: worker.email || '',
    phone: worker.phone || '',
    city: worker.city || '',
    service: Array.isArray(worker.skill_names) && worker.skill_names.length
      ? worker.skill_names.join('، ')
      : worker.major || text.unknown,
    price:
      worker.min_price && worker.max_price
        ? `${worker.min_price} - ${worker.max_price}`
        : text.unknown,
    rating: worker.rating || null,
    reviewsCount: Number(worker.reviewsCount || 0),
    createdAt: worker.createdAt,
  }));
}

function normalizeRequestRows(data) {
  return getItems(data).map((request) => ({
    id: request.id,
    description: request.description || '',
    service: request.craftName || request.description || 'طلب خدمة',
    city: request.city || request.customer?.location || '',
    status: request.status || 'pending',
    date: request.date || request.createdAt,
    customerName:
      request.customer?.name ||
      request.clientName ||
      compact([request.customer?.firstname, request.customer?.lastname]) ||
      request.clientEmail ||
      text.unknown,
    customerEmail: request.customer?.email || request.clientEmail || '',
    customerPhone: request.customer?.phone || request.clientPhone || '',
    workerName: request.worker?.name || compact([request.worker?.firstname, request.worker?.lastname]) || '',
    workerEmail: request.worker?.email || '',
    workerPhone: request.worker?.phone || '',
    updatedAt: request.updatedAt,
  }));
}

function rowMatchesSearch(row, searchTerm, fields) {
  const cleanSearch = normalizeSearch(searchTerm);
  if (!cleanSearch) return true;

  return fields.some((field) => normalizeSearch(row[field]).includes(cleanSearch));
}

function SectionEmpty({ message = text.noResults }) {
  return (
    <div className="admin-empty-state">
      <FiSearch />
      <span>{message}</span>
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState({
    dashboard: false,
    requests: false,
    users: false,
    workers: false,
    crafts: false,
  });
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [craftDraft, setCraftDraft] = useState({ ...EMPTY_CRAFT_DRAFT });
  const [editingCraftId, setEditingCraftId] = useState(null);
  const [editingCraftDraft, setEditingCraftDraft] = useState({ ...EMPTY_CRAFT_DRAFT });
  const [craftMessage, setCraftMessage] = useState({ type: '', text: '' });
  const [addingCraft, setAddingCraft] = useState(false);
  const [updatingCraftId, setUpdatingCraftId] = useState(null);
  const [deletingCraftId, setDeletingCraftId] = useState(null);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  const setSectionLoading = useCallback((section, value) => {
    setLoading((current) => ({
      ...current,
      [section]: value,
    }));
  }, []);

  const handleAdminAuthError = useCallback(
    (err) => {
      if (err?.status === 401 || err?.status === 403) {
        localStorage.removeItem('binaa_admin_token');
        localStorage.removeItem('binaa_admin_user');
        navigate('/login', { replace: true });
        return true;
      }

      return false;
    },
    [navigate]
  );

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('binaa_admin_token');

    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }

    return { Authorization: `Bearer ${token}` };
  }, [navigate]);

  const fetchAdmin = useCallback(
    (path, options = {}) => {
      const headers = getAdminHeaders();

      if (!headers) {
        return Promise.reject(new Error('Missing admin token.'));
      }

      return fetchJson(path, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });
    },
    [getAdminHeaders]
  );

  const loadDashboard = useCallback(async () => {
    setSectionLoading('dashboard', true);
    try {
      const data = await fetchAdmin('/api/admin/dashboard');
      setDashboard(normalizeDashboard(data));
      setError('');
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setError(getApiErrorMessage(err, text.dashboardLoadError));
      }
    } finally {
      setSectionLoading('dashboard', false);
    }
  }, [fetchAdmin, handleAdminAuthError, setSectionLoading]);

  const loadRequests = useCallback(async () => {
    setSectionLoading('requests', true);
    try {
      const data = await fetchAdmin('/api/admin/requests?limit=50');
      setRequests(normalizeRequestRows(data));
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setError(getApiErrorMessage(err, text.requestsLoadError));
      }
    } finally {
      setSectionLoading('requests', false);
    }
  }, [fetchAdmin, handleAdminAuthError, setSectionLoading]);

  const loadUsers = useCallback(async () => {
    setSectionLoading('users', true);
    try {
      const data = await fetchAdmin('/api/admin/users?limit=50');
      setUsers(normalizeUserRows(data));
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setError(getApiErrorMessage(err, text.usersLoadError));
      }
    } finally {
      setSectionLoading('users', false);
    }
  }, [fetchAdmin, handleAdminAuthError, setSectionLoading]);

  const loadWorkers = useCallback(async () => {
    setSectionLoading('workers', true);
    try {
      const data = await fetchAdmin('/api/admin/workers?limit=50');
      setWorkers(normalizeWorkerRows(data));
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setError(getApiErrorMessage(err, text.workersLoadError));
      }
    } finally {
      setSectionLoading('workers', false);
    }
  }, [fetchAdmin, handleAdminAuthError, setSectionLoading]);

  const loadCrafts = useCallback(async () => {
    setSectionLoading('crafts', true);
    try {
      const data = await fetchAdmin('/api/admin/crafts?limit=50');
      setCrafts(normalizeCraftRows(data));
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setCraftMessage({ type: 'error', text: getApiErrorMessage(err, text.craftsLoadError) });
      }
    } finally {
      setSectionLoading('crafts', false);
    }
  }, [fetchAdmin, handleAdminAuthError, setSectionLoading]);

  const refreshAll = useCallback(async () => {
    setError('');
    setCraftMessage({ type: '', text: '' });
    await Promise.all([loadDashboard(), loadRequests(), loadUsers(), loadWorkers(), loadCrafts()]);
  }, [loadCrafts, loadDashboard, loadRequests, loadUsers, loadWorkers]);

  useEffect(() => {
    const token = localStorage.getItem('binaa_admin_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    let isMounted = true;

    setCheckingAccess(true);
    refreshAll().finally(() => {
      if (isMounted) {
        setCheckingAccess(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [navigate, refreshAll]);

  const handleLogout = () => {
    localStorage.removeItem('binaa_admin_token');
    localStorage.removeItem('binaa_admin_user');
    navigate('/login', { replace: true });
  };

  const stats = useMemo(
    () => [
      {
        label: 'المستخدمون',
        value: dashboard.stats.users,
        note: 'كل الحسابات المسجلة',
        icon: FiUsers,
        tone: 'blue',
      },
      {
        label: 'الصنايعية',
        value: dashboard.stats.workers,
        note: 'بروفايلات العمال',
        icon: FiBriefcase,
        tone: 'amber',
      },
      {
        label: 'الطلبات',
        value: dashboard.stats.requests,
        note: `${formatNumber(dashboard.stats.openRequests)} طلب مفتوح`,
        icon: FiClock,
        tone: 'green',
      },
      {
        label: 'الصنعات',
        value: dashboard.stats.crafts,
        note: 'الخدمات المتاحة',
        icon: FiTool,
        tone: 'violet',
      },
      {
        label: 'الطلبات المكتملة',
        value: dashboard.stats.completedRequests,
        note: 'طلبات منتهية',
        icon: FiCheckCircle,
        tone: 'emerald',
      },
      {
        label: 'التقييمات',
        value: dashboard.stats.reviews,
        note: 'مراجعات العملاء',
        icon: FiShield,
        tone: 'slate',
      },
    ],
    [dashboard.stats]
  );

  const filteredRequests = useMemo(
    () =>
      requests
        .filter((request) => statusFilter === 'all' || request.status === statusFilter)
        .filter((request) =>
          rowMatchesSearch(request, query, [
            'customerName',
            'customerEmail',
            'customerPhone',
            'workerName',
            'workerEmail',
            'service',
            'city',
            'description',
          ])
        ),
    [query, requests, statusFilter]
  );

  const filteredUsers = useMemo(
    () => users.filter((user) => rowMatchesSearch(user, query, ['name', 'email', 'phone', 'city', 'role'])),
    [query, users]
  );

  const filteredWorkers = useMemo(
    () =>
      workers.filter((worker) =>
        rowMatchesSearch(worker, query, ['name', 'email', 'phone', 'city', 'service', 'price'])
      ),
    [query, workers]
  );

  const filteredCrafts = useMemo(
    () => crafts.filter((craft) => rowMatchesSearch(craft, query, ['name'])),
    [crafts, query]
  );

  const visibleCountByTab = {
    overview: stats.length,
    requests: filteredRequests.length,
    users: filteredUsers.length,
    workers: filteredWorkers.length,
    crafts: filteredCrafts.length,
    permissions: 6,
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

    const validationError = getCraftDraftError(craftDraft);
    const payload = cleanCraftDraft(craftDraft);

    if (validationError) {
      setCraftMessage({ type: 'error', text: validationError });
      return;
    }

    setAddingCraft(true);
    setCraftMessage({ type: '', text: '' });

    try {
      const data = await fetchAdmin('/api/admin/crafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const [createdCraft] = normalizeCraftRows({ items: [data?.item] });

      if (createdCraft) {
        setCrafts((currentCrafts) =>
          [...currentCrafts, createdCraft].sort((first, second) => first.name.localeCompare(second.name, 'ar'))
        );
        refreshCraftStat(1);
      }

      setCraftDraft({ ...EMPTY_CRAFT_DRAFT });
      setCraftMessage({ type: 'success', text: text.craftAddSuccess });
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setCraftMessage({
          type: 'error',
          text: err?.status === 409 ? text.craftDuplicate : getApiErrorMessage(err, text.craftAddError),
        });
      }
    } finally {
      setAddingCraft(false);
    }
  };

  const startEditCraft = (craft) => {
    setEditingCraftId(craft.id);
    setEditingCraftDraft(cleanCraftDraft(craft));
    setCraftMessage({ type: '', text: '' });
  };

  const cancelEditCraft = () => {
    setEditingCraftId(null);
    setEditingCraftDraft({ ...EMPTY_CRAFT_DRAFT });
  };

  const handleUpdateCraft = async (craft) => {
    const validationError = getCraftDraftError(editingCraftDraft);
    const payload = cleanCraftDraft(editingCraftDraft);

    if (validationError) {
      setCraftMessage({ type: 'error', text: validationError });
      return;
    }

    if (JSON.stringify(payload) === JSON.stringify(cleanCraftDraft(craft))) {
      cancelEditCraft();
      return;
    }

    setUpdatingCraftId(craft.id);
    setCraftMessage({ type: '', text: '' });

    try {
      const data = await fetchAdmin(`/api/admin/crafts/${craft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const [updatedCraft] = normalizeCraftRows({ items: [data?.item] });

      if (updatedCraft) {
        setCrafts((currentCrafts) =>
          currentCrafts
            .map((currentCraft) => (currentCraft.id === craft.id ? updatedCraft : currentCraft))
            .sort((first, second) => first.name.localeCompare(second.name, 'ar'))
        );
      }

      cancelEditCraft();
      setCraftMessage({ type: 'success', text: text.craftUpdateSuccess });
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setCraftMessage({
          type: 'error',
          text: err?.status === 409 ? text.craftDuplicate : getApiErrorMessage(err, text.craftUpdateError),
        });
      }
    } finally {
      setUpdatingCraftId(null);
    }
  };

  const handleDeleteCraft = async (craft) => {
    if (!window.confirm(text.craftDeleteConfirm)) {
      return;
    }

    setDeletingCraftId(craft.id);
    setCraftMessage({ type: '', text: '' });

    try {
      await fetchAdmin(`/api/admin/crafts/${craft.id}`, {
        method: 'DELETE',
      });

      setCrafts((currentCrafts) => currentCrafts.filter((currentCraft) => currentCraft.id !== craft.id));
      refreshCraftStat(-1);
      setCraftMessage({ type: 'success', text: text.craftDeleteSuccess });
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setCraftMessage({ type: 'error', text: getApiErrorMessage(err, text.craftDeleteError) });
      }
    } finally {
      setDeletingCraftId(null);
    }
  };

  const handleRequestStatusChange = async (request, nextStatus) => {
    if (!nextStatus || nextStatus === request.status) {
      return;
    }

    setUpdatingRequestId(request.id);
    setError('');

    try {
      const data = await fetchAdmin(`/api/admin/requests/${request.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const [updatedRequest] = normalizeRequestRows({ items: [data?.item] });

      if (updatedRequest) {
        setRequests((currentRequests) =>
          currentRequests.map((currentRequest) =>
            currentRequest.id === request.id ? updatedRequest : currentRequest
          )
        );
      }

      loadDashboard();
    } catch (err) {
      if (!handleAdminAuthError(err)) {
        setError(getApiErrorMessage(err, text.requestStatusError));
      }
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const renderContactStack = (email, phone) => (
    <div className="admin-contact-stack">
      {email && (
        <span>
          <FiMail />
          {email}
        </span>
      )}
      {phone && (
        <span>
          <FiPhone />
          {phone}
        </span>
      )}
      {!email && !phone && <span>{text.unknown}</span>}
    </div>
  );

  const permissions = [
    {
      title: 'الطلبات',
      detail: 'عرض الطلبات وتغيير حالتها مباشرة.',
      icon: FiClock,
      action: 'تحديث الحالة',
      available: true,
    },
    {
      title: 'الصنعات',
      detail: 'إضافة، تعديل، وحذف الصنعات وربطها بتقارير العمال.',
      icon: FiTool,
      action: 'إدارة كاملة',
      available: true,
    },
    {
      title: 'المستخدمون',
      detail: 'عرض كل الحسابات وتتبّع بيانات التواصل والدور.',
      icon: FiUsers,
      action: 'عرض وبحث',
      available: true,
    },
    {
      title: 'الصنايعية',
      detail: 'مراجعة بروفايلات العمال، التقييمات، الأسعار، والتخصصات.',
      icon: FiBriefcase,
      action: 'مراجعة تشغيلية',
      available: true,
    },
    {
      title: 'حالة المنصة',
      detail: 'مراقبة اتصال الخادم وقاعدة البيانات من نفس الصفحة.',
      icon: FiDatabase,
      action: 'مراقبة',
      available: true,
    },
    {
      title: 'إجراءات حساسة',
      detail: 'الحذف محصور بالصنعات فقط حتى لا تتأثر بيانات العملاء والطلبات.',
      icon: FiAlertTriangle,
      action: 'محمي',
      available: true,
    },
  ];

  if (checkingAccess) {
    return (
      <div className="admin-screen">
        <Header />
        <main className="admin-page" dir="rtl">
          <div className="admin-shell">
            <div className="admin-loading">
              <FiActivity />
              <span>{text.loading}</span>
            </div>
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
            <div className="admin-header__copy">
              <span className="admin-eyebrow">
                <FiShield />
                Admin Console
              </span>
              <h1>{text.title}</h1>
              <p>{text.subtitle}</p>
            </div>

            <div className="admin-owner-actions">
              <span className="admin-owner-email">
                <FiMail />
                {dashboard.platform.adminEmail || text.unknown}
              </span>
              <button type="button" className="admin-secondary-action" onClick={refreshAll}>
                <FiRefreshCw className={loading.dashboard ? 'is-spinning' : ''} />
                <span>{text.refresh}</span>
              </button>
              <button type="button" className="admin-logout-action" onClick={handleLogout}>
                <FiLogOut />
                <span>{text.logout}</span>
              </button>
            </div>
          </header>

          {error && <div className="admin-error">{error}</div>}

          <section className="admin-stats" aria-label="Admin statistics">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <article className={`admin-stat-card admin-stat-card--${item.tone}`} key={item.label}>
                  <div className="admin-stat-icon">
                    <Icon />
                  </div>
                  <div>
                    <span>{item.label}</span>
                    <strong>{formatNumber(item.value)}</strong>
                    <small>{item.note}</small>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="admin-command-bar" aria-label="Admin controls">
            <div className="admin-tabs" role="tablist" aria-label="أقسام لوحة الأدمن">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                  >
                    <Icon />
                    <span>{tab.label}</span>
                    <b>{formatNumber(visibleCountByTab[tab.id] || 0)}</b>
                  </button>
                );
              })}
            </div>

            {activeTab !== 'overview' && activeTab !== 'permissions' && (
              <div className="admin-tools">
                <label className="admin-search-control">
                  <FiSearch />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={text.searchPlaceholder}
                  />
                </label>

                {activeTab === 'requests' && (
                  <label className="admin-filter-control">
                    <FiFilter />
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="all">{text.allStatuses}</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
          </section>

          {activeTab === 'overview' && (
            <section className="admin-overview-grid">
              <div className="admin-panel admin-panel--wide">
                <div className="admin-panel-heading">
                  <h2>{text.recentRequests}</h2>
                  <FiClock />
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>العميل</th>
                        <th>الخدمة</th>
                        <th>المدينة</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentRequests.map((request) => (
                        <tr key={request.id}>
                          <td>{request.customer || text.unknown}</td>
                          <td>
                            {request.service || text.unknown}
                            {formatDate(request.date) && (
                              <small className="admin-table-date">{formatDate(request.date)}</small>
                            )}
                          </td>
                          <td>{request.city || text.unknown}</td>
                          <td>
                            <span className={`admin-status admin-status--${statusClass(request.status)}`}>
                              {statusLabel(request.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dashboard.recentRequests.length === 0 && <SectionEmpty />}
                </div>
              </div>

              <aside className="admin-side-stack">
                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <h2>{text.platformStatus}</h2>
                    <FiDatabase />
                  </div>
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
                      <span>إيميل الأدمن</span>
                      <strong>{dashboard.platform.adminEmail || text.unknown}</strong>
                    </div>
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <h2>{text.recentWorkers}</h2>
                    <FiBriefcase />
                  </div>
                  <div className="admin-worker-list">
                    {dashboard.recentWorkers.map((worker) => (
                      <div className="admin-worker-item" key={worker.id}>
                        <div>
                          <strong>{worker.name}</strong>
                          <span className="admin-worker-summary">
                            <em className="admin-worker-summary__chip admin-worker-summary__chip--craft">
                              <FiTool />
                              {worker.service || text.unknown}
                            </em>
                            {worker.city && (
                              <em className="admin-worker-summary__chip admin-worker-summary__chip--city">
                                <FiMapPin />
                                {worker.city}
                              </em>
                            )}
                          </span>
                        </div>
                        <b>{worker.priceRange || text.unknown}</b>
                      </div>
                    ))}
                    {dashboard.recentWorkers.length === 0 && <SectionEmpty />}
                  </div>
                </div>
              </aside>
            </section>
          )}

          {activeTab === 'requests' && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>{text.requestsManagement}</h2>
                <FiClock />
              </div>

              <div className="admin-request-list">
                {loading.requests ? (
                  <div className="admin-inline-loader">جاري تحميل الطلبات...</div>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <article className="admin-request-card" key={request.id}>
                      <div className="admin-request-card__main">
                        <div className="admin-request-card__top">
                          <div>
                            <span className="admin-mini-label">{request.service}</span>
                            <h3>{request.customerName}</h3>
                          </div>
                          <span className={`admin-status admin-status--${statusClass(request.status)}`}>
                            {statusLabel(request.status)}
                          </span>
                        </div>

                        <p>{request.description || 'لا توجد تفاصيل إضافية.'}</p>

                        <div className="admin-meta-grid">
                          <span>
                            <FiMapPin />
                            {request.city || text.unknown}
                          </span>
                          <span>
                            <FiClock />
                            {formatDate(request.date) || text.unknown}
                          </span>
                          <span>
                            <FiBriefcase />
                            {request.workerName || 'غير مرتبط بعامل'}
                          </span>
                          <span>
                            <FiPhone />
                            {request.customerPhone || text.unknown}
                          </span>
                        </div>
                      </div>

                      <div className="admin-request-card__actions">
                        <label>تغيير الحالة</label>
                        <select
                          value={STATUS_OPTIONS.some((status) => status.value === request.status) ? request.status : 'pending'}
                          onChange={(event) => handleRequestStatusChange(request, event.target.value)}
                          disabled={updatingRequestId === request.id}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <div className="admin-request-contact">
                          {renderContactStack(request.customerEmail, request.customerPhone)}
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <SectionEmpty />
                )}
              </div>
            </section>
          )}

          {activeTab === 'users' && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>{text.usersManagement}</h2>
                <FiUsers />
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--comfortable">
                  <thead>
                    <tr>
                      <th>المستخدم</th>
                      <th>الدور</th>
                      <th>التواصل</th>
                      <th>المدينة</th>
                      <th>تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name}</strong>
                          <small className="admin-table-date">{user.email}</small>
                        </td>
                        <td>
                          <span className="admin-role-chip">{user.role}</span>
                        </td>
                        <td>{renderContactStack(user.email, user.phone)}</td>
                        <td>{user.city || text.unknown}</td>
                        <td>{formatDate(user.createdAt) || text.unknown}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {loading.users ? <div className="admin-inline-loader">جاري تحميل المستخدمين...</div> : null}
                {!loading.users && filteredUsers.length === 0 && <SectionEmpty />}
              </div>
            </section>
          )}

          {activeTab === 'workers' && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>{text.workersManagement}</h2>
                <FiBriefcase />
              </div>
              <div className="admin-worker-directory">
                {loading.workers ? (
                  <div className="admin-inline-loader">جاري تحميل الصنايعية...</div>
                ) : filteredWorkers.length > 0 ? (
                  filteredWorkers.map((worker) => (
                    <article className="admin-directory-card" key={worker.id}>
                      <div className="admin-directory-card__avatar">{worker.name.charAt(0)}</div>
                      <div className="admin-directory-card__body">
                        <h3>{worker.name}</h3>
                        <span>{worker.service}</span>
                        <div className="admin-directory-card__meta">
                          <b>
                            <FiMapPin />
                            {worker.city || text.unknown}
                          </b>
                          <b>
                            <FiCheckCircle />
                            {worker.rating ? `${worker.rating}/5` : 'بدون تقييم'}
                          </b>
                          <b>{worker.price}</b>
                        </div>
                      </div>
                      <div className="admin-directory-card__contact">
                        {renderContactStack(worker.email, worker.phone)}
                      </div>
                    </article>
                  ))
                ) : (
                  <SectionEmpty />
                )}
              </div>
            </section>
          )}

          {activeTab === 'crafts' && (
            <section className="admin-panel admin-crafts-panel" aria-labelledby="admin-crafts-title">
              <div className="admin-panel-heading">
                <h2 id="admin-crafts-title">{text.craftsManagement}</h2>
                <FiTool />
              </div>

              <form className="admin-craft-form" onSubmit={handleAddCraft}>
                <CraftFields
                  idPrefix="admin-new-craft"
                  value={craftDraft}
                  onChange={setCraftDraft}
                  disabled={addingCraft}
                />
                <button type="submit" className="admin-primary-action admin-craft-submit" disabled={addingCraft}>
                  <FiPlus />
                  <span>{addingCraft ? text.addingCraft : text.addCraft}</span>
                </button>
              </form>

              {craftMessage.text && (
                <div className={`admin-inline-message ${craftMessage.type}`}>{craftMessage.text}</div>
              )}

              <div className="admin-craft-list">
                {loading.crafts ? (
                  <div className="admin-inline-loader">جاري تحميل الصنعات...</div>
                ) : filteredCrafts.length > 0 ? (
                  filteredCrafts.map((craft) => {
                    const isEditing = editingCraftId === craft.id;

                    return (
                      <div className={`admin-craft-item${isEditing ? ' is-editing' : ''}`} key={craft.id}>
                        <div className="admin-craft-item__body">
                          {isEditing ? (
                            <CraftFields
                              idPrefix={`admin-craft-${craft.id}`}
                              value={editingCraftDraft}
                              onChange={setEditingCraftDraft}
                              disabled={updatingCraftId === craft.id}
                              autoFocus
                            />
                          ) : (
                            <>
                              <div className="admin-craft-item__heading">
                                <span className="admin-craft-item__icon" aria-hidden="true">
                                  {React.createElement(CRAFT_ICON_BY_KEY[craft.icon_key] || FiTool)}
                                </span>
                                <div>
                                  <strong>{craft.name}</strong>
                                  <code dir="ltr">/{craft.slug}</code>
                                </div>
                              </div>
                              <p>{craft.description}</p>
                              <span className="admin-craft-item__workers">
                                {formatNumber(craft.workersCount)} {text.workersLinked}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="admin-craft-item__actions">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                className="admin-save-craft-button"
                                onClick={() => handleUpdateCraft(craft)}
                                disabled={updatingCraftId === craft.id}
                              >
                                <FiSave />
                                <span>{updatingCraftId === craft.id ? text.saving : text.save}</span>
                              </button>
                              <button type="button" className="admin-cancel-craft-button" onClick={cancelEditCraft}>
                                <FiX />
                                <span>{text.cancel}</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="admin-edit-craft-button" onClick={() => startEditCraft(craft)}>
                                <FiEdit3 />
                                <span>تعديل</span>
                              </button>
                              <button
                                type="button"
                                className="admin-delete-craft-button"
                                onClick={() => handleDeleteCraft(craft)}
                                disabled={deletingCraftId === craft.id}
                                title={text.deleteCraft}
                              >
                                <FiTrash2 />
                                <span>{deletingCraftId === craft.id ? text.deletingCraft : text.deleteCraft}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <SectionEmpty />
                )}
              </div>
            </section>
          )}

          {activeTab === 'permissions' && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>{text.adminPowers}</h2>
                <FiLock />
              </div>
              <div className="admin-permission-grid">
                {permissions.map((permission) => {
                  const Icon = permission.icon;

                  return (
                    <article className="admin-permission-card" key={permission.title}>
                      <div className="admin-permission-card__icon">
                        <Icon />
                      </div>
                      <div>
                        <h3>{permission.title}</h3>
                        <p>{permission.detail}</p>
                        <span>{permission.action}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminPage;
