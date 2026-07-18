import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material';
import {
  FiCalendar,
  FiDollarSign,
  FiBriefcase,
  FiEdit3,
  FiImage,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiSend,
  FiShield,
  FiStar,
  FiTool,
  FiUserCheck,
} from 'react-icons/fi';
import ProfileAvailability from '../../components/profile/ProfileAvailability';
import AddReviewForm from '../../components/profile/AddReviewForm';
import ProfileEditDialog from '../../components/profile/ProfileEditDialog';
import ProfileCompletionCard from '../../components/profile/ProfileCompletionCard';
import { ApiError, fetchJson, getApiErrorMessage } from '../../utils/api';
import { getFirstPortfolioImage, normalizePortfolioItems } from '../../utils/workerProfile';
import './PageProfile.css';

const normalizeProfile = (profile) => ({
  ...profile,
  user: profile?.user ?? {
    firstname: 'حرفي',
    lastname: 'منصة بناء',
    location: 'فلسطين',
    phone: '',
    email: '',
  },
  reviews: Array.isArray(profile?.reviews) ? profile.reviews : [],
  skill_ids: Array.isArray(profile?.skill_ids) ? profile.skill_ids : [],
  skill_names: Array.isArray(profile?.skill_names) ? profile.skill_names : [],
  availability: Array.isArray(profile?.availability) ? profile.availability : [],
  portfolio_items: normalizePortfolioItems(profile?.portfolio_items || profile?.p_images),
  p_images: profile?.p_images ?? '',
  profile_image:
    profile?.profile_image ||
    getFirstPortfolioImage(profile?.portfolio_items || profile?.p_images) ||
    '',
});

const getProfileUserId = (profile) => {
  const value = profile?.user?.id ?? profile?.user_id ?? profile?.worker_id;
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
};

const withAvailability = async (profile) => {
  const userId = getProfileUserId(profile);

  if (!userId) {
    return profile;
  }

  const availability = await fetchJson(`/api/availability/user/${userId}`).catch(() => []);
  return {
    ...profile,
    availability: Array.isArray(availability) ? availability : [],
  };
};

function formatPriceRange(profile) {
  if (profile?.min_price && profile?.max_price) {
    return `${profile.min_price} - ${profile.max_price} شيكل`;
  }

  if (profile?.min_price) {
    return `ابتداءً من ${profile.min_price} شيكل`;
  }

  if (profile?.max_price) {
    return `حتى ${profile.max_price} شيكل`;
  }

  return 'حسب طبيعة المشروع';
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getReviewerName(review) {
  const firstname = String(review?.reviewer?.firstname || '').trim();
  const lastname = String(review?.reviewer?.lastname || '').trim();
  const fullName = `${firstname} ${lastname}`.trim();

  return fullName || 'عميل من منصة بناء';
}

function getReviewerInitial(review) {
  return getReviewerName(review).charAt(0) || 'ع';
}

function getReviewRating(review) {
  const rating = Number(review?.rating);

  if (!Number.isFinite(rating)) return 0;

  return Math.min(5, Math.max(0, rating));
}

function formatReviewRating(rating) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function renderReviewStars(rating) {
  const activeStars = Math.round(rating);

  return Array.from({ length: 5 }, (_, index) => (
    <FiStar key={index} className={index < activeStars ? 'active' : ''} aria-hidden="true" />
  ));
}

function getAverageRating(reviews = []) {
  const ratings = reviews.map((review) => Number(review.rating)).filter((rating) => Number.isFinite(rating));

  if (!ratings.length) return null;

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return (total / ratings.length).toFixed(1);
}

function getStoredAuthUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem('binaa_auth_user') || 'null');
  } catch (error) {
    return null;
  }
}

const WORKER_REQUEST_TEXT = {
  success: 'تم إرسال طلب الخدمة للعامل بنجاح.',
  error: 'تعذر إرسال طلب الخدمة. حاول مرة أخرى.',
  fallbackName: 'Binaa Pal Client',
  fallbackEmail: 'client@example.com',
};

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="profile-stat-tile">
      <span className="profile-stat-tile__icon">
        <Icon />
      </span>
      <div className="profile-stat-tile__content">
        <span className="profile-stat-tile__label">{label}</span>
        <strong className="profile-stat-tile__value">{value}</strong>
      </div>
    </div>
  );
}

function EmptyBlock({ icon: Icon, title, text }) {
  return (
    <div className="profile-empty-block">
      <Icon />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

const PageProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceDescription, setServiceDescription] = useState('');

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    const fetchProfile = async () => {
      try {
        const [data, skillRows] = await Promise.all([
          fetchJson(`/api/worker-profiles/${id}`),
          fetchJson('/api/skills').catch(() => []),
        ]);

        const dataWithAvailability = await withAvailability(data);

        if (isMounted) {
          setProfile(normalizeProfile(dataWithAvailability));
          setSkills(Array.isArray(skillRows) ? skillRows : []);
          setError(null);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          try {
            const profiles = await fetchJson('/api/worker-profiles');

            if (Array.isArray(profiles) && profiles.length > 0) {
              navigate(`/profile/${profiles[0].id}`, { replace: true });
              return;
            }
          } catch (fallbackError) {
            if (isMounted) {
              setError(getApiErrorMessage(fallbackError));
            }
            return;
          }

          if (isMounted) {
            setError('الملف المهني المطلوب غير موجود، ولا يوجد ملف بديل لعرضه.');
          }
          return;
        }

        if (isMounted) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const authUser = getStoredAuthUser();

  const derived = useMemo(() => {
    if (!profile) return null;

    const fullName = `${profile.user.firstname || ''} ${profile.user.lastname || ''}`.trim() || 'حرفي بناء بال';
    const portfolioItems = profile.portfolio_items || [];
    const reviewCount = profile.reviews.length;
    const averageRating = getAverageRating(profile.reviews);
    const displayReviews = [...profile.reviews].sort((firstReview, secondReview) => {
      const firstDate = new Date(firstReview.createdAt || firstReview.date || 0).getTime();
      const secondDate = new Date(secondReview.createdAt || secondReview.date || 0).getTime();

      return (Number.isFinite(secondDate) ? secondDate : 0) - (Number.isFinite(firstDate) ? firstDate : 0);
    });
    const priceRange = formatPriceRange(profile);
    const profileUserId = Number(profile.user_id || profile.user?.id);
    const authUserId = Number(authUser?.id);
    const authWorkerProfileId = Number(authUser?.worker_profile?.id);
    const canEditProfile =
      (Number.isInteger(authUserId) && authUserId === profileUserId) ||
      (Number.isInteger(authWorkerProfileId) && authWorkerProfileId === Number(profile.id));
    const profileSkills = profile.skill_names.map((skill) => String(skill || '').trim()).filter(Boolean);
    const majorSkills = String(profile.major || '')
      .split(/,|،/)
      .map((skill) => skill.trim())
      .filter(Boolean);
    const primarySkill = majorSkills[0] || profileSkills[0] || '';
    const skillList = [...new Set([primarySkill, ...profileSkills, ...majorSkills.slice(1)].filter(Boolean))];
    const heroImage = profile.profile_image || getFirstPortfolioImage(portfolioItems);
    const activeAvailability = profile.availability.filter((slot) => slot.is_available !== false);
    const joinedYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'حديثًا';

    return {
      activeAvailability,
      averageRating,
      canEditProfile,
      displayReviews,
      fullName,
      heroImage,
      joinedYear,
      portfolioItems,
      priceRange,
      reviewCount,
      skillList,
    };
  }, [authUser, profile]);

  if (loading) {
    return (
      <div className="profile-page profile-page--state" dir="rtl">
        <div className="profile-state-card">
          <CircularProgress sx={{ color: '#2563eb' }} />
          <p>جاري تحميل بروفايل العامل...</p>
        </div>
      </div>
    );
  }

  if (error || !profile || !derived) {
    return (
      <div className="profile-page profile-page--state" dir="rtl">
        <div className="profile-state-card profile-state-card--error">
          <FiShield />
          <h1>{error || 'الملف المهني غير موجود.'}</h1>
          <button type="button" onClick={() => navigate('/craftsman')}>
            الرجوع للصنايعية
          </button>
        </div>
      </div>
    );
  }

  const {
    activeAvailability,
    averageRating,
    canEditProfile,
    displayReviews,
    fullName,
    heroImage,
    joinedYear,
    portfolioItems,
    priceRange,
    reviewCount,
    skillList,
  } = derived;

  const handleSaveProfile = async (payload) => {
    setSaving(true);

    try {
      const updatedProfile = await fetchJson(`/api/worker-profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const updatedProfileWithAvailability = await withAvailability(updatedProfile);

      setProfile(normalizeProfile(updatedProfileWithAvailability));
      setEditOpen(false);
      setSuccessMessage('تم تحديث البروفايل بنجاح.');
      return updatedProfile;
    } finally {
      setSaving(false);
    }
  };

  const openServiceDialog = () => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    setServiceDescription('');
    setRequestError('');
    setServiceDialogOpen(true);
  };

  const handleServiceRequestSubmit = async (event) => {
    event.preventDefault();

    const cleanedDescription = serviceDescription.trim();

    if (!cleanedDescription) {
      setRequestError('اكتب وصفًا قصيرًا للخدمة المطلوبة.');
      return;
    }

    const clientName =
      `${authUser?.firstname || ''} ${authUser?.lastname || ''}`.trim() || WORKER_REQUEST_TEXT.fallbackName;
    const payload = {
      clientName,
      clientEmail: String(authUser?.email || WORKER_REQUEST_TEXT.fallbackEmail).trim(),
      clientPhone: authUser?.phone || '',
      clientUserId: authUser?.id,
      workerId: profile.user_id || profile.user?.id,
      workerName: fullName,
      workerEmail: profile.user?.email || '',
      profileId: profile.id || Number(id),
      craftName: profile.major || profile.skill_names?.[0] || '',
      city: profile.user?.location || '',
      serviceDescription: cleanedDescription,
    };

    setRequestSending(true);
    setRequestError('');

    try {
      await fetchJson('/api/worker-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setServiceDialogOpen(false);
      setServiceDescription('');
      setSuccessMessage(WORKER_REQUEST_TEXT.success);
    } catch (err) {
      setRequestError(getApiErrorMessage(err, WORKER_REQUEST_TEXT.error));
    } finally {
      setRequestSending(false);
    }
  };

  const handleScrollToPortfolio = () => {
    const element = document.getElementById('portfolio-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const trustItems = [
    {
      icon: FiUserCheck,
      label: profile.user?.phone || profile.user?.location ? 'بيانات تواصل واضحة' : 'بانتظار بيانات التواصل',
      active: Boolean(profile.user?.phone || profile.user?.location),
    },
    {
      icon: FiImage,
      label: portfolioItems.length > 0 ? `${portfolioItems.length} أعمال مضافة` : 'لم يضف أعمالًا بعد',
      active: portfolioItems.length > 0,
    },
    {
      icon: FiStar,
      label: reviewCount > 0 ? `${reviewCount} تقييمات من العملاء` : 'بانتظار أول تقييم',
      active: reviewCount > 0,
    },
    {
      icon: FiCalendar,
      label: activeAvailability.length > 0 ? 'أوقات العمل محددة' : 'الأوقات غير محددة',
      active: activeAvailability.length > 0,
    },
  ];

  return (
    <div className="profile-page" dir="rtl">
      <section className="profile-hero">
        <div className="profile-shell profile-hero__grid">
          <div className="profile-hero__main">
            <div className="profile-hero__eyebrow">
              <FiShield />
              بروفايل عامل موثوق
            </div>

            <div className="profile-hero__identity">
              <div className="profile-avatar">
                {heroImage ? (
                  <img src={heroImage} alt={fullName} loading="lazy" />
                ) : (
                  <span>{fullName.charAt(0)}</span>
                )}
              </div>

              <div className="profile-hero__text">
                <div className="profile-hero__chips">
                  {(skillList.length ? skillList.slice(0, 2) : ['عامل مهني']).map((skill, index) => (
                    <span className={index === 0 ? 'profile-hero__chip--primary' : 'profile-hero__chip--secondary'} key={`${skill}-${index}`}>
                      {index === 0 ? <FiTool /> : <FiBriefcase />}
                      <b>{index === 0 ? 'أساسية' : 'ثانية'}</b>
                      {skill}
                    </span>
                  ))}
                  <span>
                    <FiMapPin />
                    {profile.user.location || 'فلسطين'}
                  </span>
                </div>
                <h1>{fullName}</h1>
                <p>
                  {profile.bio ||
                    'عامل مهني على منصة بناء بال. يمكنك مراجعة الأعمال السابقة، التقييمات، ومعلومات التواصل قبل إرسال طلب الخدمة.'}
                </p>
              </div>
            </div>

            <div className="profile-hero__actions">
              {!canEditProfile && (
                <button type="button" className="profile-primary-btn" onClick={openServiceDialog}>
                  <FiSend />
                  طلب خدمة مباشرة
                </button>
              )}
              {canEditProfile && (
                <button type="button" className="profile-primary-btn" onClick={() => setEditOpen(true)}>
                  <FiEdit3 />
                  تعديل البروفايل
                </button>
              )}
              <button type="button" className="profile-secondary-btn" onClick={handleScrollToPortfolio}>
                <FiImage />
                عرض الأعمال
              </button>
            </div>
          </div>

          <aside className="profile-hero__summary" aria-label="ملخص العامل">
            <div className="profile-rating-box">
              <span>
                <FiStar />
                التقييم
              </span>
              <strong>{averageRating || 'جديد'}</strong>
              <small>{reviewCount > 0 ? `${reviewCount} تقييم` : 'لم يحصل على تقييمات بعد'}</small>
            </div>

            <div className="profile-summary-grid">
              <StatTile icon={FiBriefcase} label="الأعمال" value={portfolioItems.length} />
              <StatTile icon={FiTool} label="المهارات" value={skillList.length || 0} />
              <StatTile icon={FiCalendar} label="الانضمام" value={joinedYear} />
              <StatTile icon={FiDollarSign} label="التسعير" value={priceRange} />
            </div>
          </aside>
        </div>
      </section>

      <main className="profile-shell profile-layout">
        <div className="profile-main-column">
          <section className="profile-section">
            <div className="profile-section__header">
              <div>
                <span>نبذة العامل</span>
                <h2>تفاصيل تساعدك تختار بثقة</h2>
              </div>
            </div>

            <div className="profile-info-grid">
              <div>
                <FiTool />
                <span>الصنعة الأساسية</span>
                <strong>{skillList[0] || 'غير محددة'}</strong>
              </div>
              {skillList.length > 1 && (
                <div>
                  <FiBriefcase />
                  <span>الصنعة الثانية</span>
                  <strong>{skillList.slice(1).join('، ')}</strong>
                </div>
              )}
              <div>
                <FiMapPin />
                <span>منطقة العمل</span>
                <strong>{profile.user.location || 'غير محددة'}</strong>
              </div>
              <div>
                <FiPhone />
                <span>رقم التواصل</span>
                <strong>{profile.user.phone || 'غير مضاف'}</strong>
              </div>
              <div>
                <FiMail />
                <span>البريد</span>
                <strong>{profile.user.email || 'غير مضاف'}</strong>
              </div>
            </div>
          </section>

          <section className="profile-section" id="portfolio-section">
            <div className="profile-section__header">
              <div>
                <span>معرض الأعمال</span>
                <h2>أعمال وصور من مشاريع سابقة</h2>
              </div>
              <b>{portfolioItems.length} عناصر</b>
            </div>

            {portfolioItems.length > 0 ? (
              <div className="profile-portfolio-grid">
                {portfolioItems.map((item, index) => (
                  <article className="profile-project-card" key={`${item.image || item.title || 'work'}-${index}`}>
                    <div className="profile-project-card__image">
                      {item.image ? (
                        <img src={item.image} alt={item.title || `عمل رقم ${index + 1}`} loading="lazy" />
                      ) : (
                        <FiImage />
                      )}
                    </div>
                    <div className="profile-project-card__body">
                      <span>{item.tag || 'مشروع منفذ'}</span>
                      <h3>{item.title || `عمل رقم ${index + 1}`}</h3>
                      <p>{item.description || 'تمت إضافة هذا العمل ضمن معرض إنجازات العامل.'}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={FiImage}
                title="لا توجد أعمال مضافة بعد"
                text="عند إضافة العامل لصوره وأعماله السابقة ستظهر هنا بشكل مرتب."
              />
            )}
          </section>

          <section className="profile-section">
            <div className="profile-section__header">
              <div>
                <span>تقييمات العملاء</span>
                <h2>تجارب العملاء مع هذا العامل</h2>
              </div>
              <b>{reviewCount} تقييم</b>
            </div>

            {displayReviews.length > 0 ? (
              <div className="profile-review-list">
                {displayReviews.map((review, index) => {
                  const reviewerName = getReviewerName(review);
                  const reviewerLocation = String(review.reviewer?.location || '').trim();
                  const reviewDate = formatDate(review.createdAt || review.date) || 'تاريخ غير محدد';
                  const reviewRating = getReviewRating(review);
                  const reviewComment = String(review.comment || '').trim() || 'بدون رسالة مكتوبة من العميل.';

                  return (
                    <article className="profile-review-card" key={`${review.id || 'review'}-${index}`}>
                      <div className="profile-review-card__top">
                        <div className="profile-review-card__identity">
                          <div className="profile-review-card__avatar">{getReviewerInitial(review)}</div>
                          <div className="profile-review-card__person">
                            <span className="profile-review-card__label">قيّمك</span>
                            <h3>{reviewerName}</h3>
                            <div className="profile-review-card__meta">
                              {reviewerLocation && (
                                <span>
                                  <FiMapPin />
                                  {reviewerLocation}
                                </span>
                              )}
                              <span>
                                <FiCalendar />
                                {reviewDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="profile-review-card__rating" aria-label={`تقييم ${formatReviewRating(reviewRating)} من 5`}>
                          <span className="profile-review-card__rating-label">التقييم</span>
                          <div className="profile-review-card__stars">{renderReviewStars(reviewRating)}</div>
                          <strong>{formatReviewRating(reviewRating)} من 5</strong>
                        </div>
                      </div>

                      <div className="profile-review-card__message">
                        <FiMessageSquare />
                        <div>
                          <span>رسالة العميل</span>
                          <p>{reviewComment}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyBlock
                icon={FiStar}
                title="لا توجد تقييمات حتى الآن"
                text="بعد تنفيذ الخدمات، تظهر تقييمات العملاء هنا لمساعدة الآخرين في الاختيار."
              />
            )}

            {!canEditProfile && (
              <div className="profile-review-form-shell">
                <AddReviewForm
                  workerProfileId={profile.id}
                  onReviewAdded={(newReview) => {
                    setProfile((prev) => ({
                      ...prev,
                      reviews: [newReview, ...prev.reviews],
                    }));
                  }}
                />
              </div>
            )}
          </section>
        </div>

        <aside className="profile-side-column">
          <section className="profile-action-card">
            <span>جاهز للتواصل؟</span>
            <h2>{canEditProfile ? 'إدارة بروفايلك المهني' : 'اطلب الخدمة من العامل'}</h2>
            <p>
              {canEditProfile
                ? 'حدّث بياناتك وصور أعمالك حتى يظهر ملفك بشكل أقوى للعملاء.'
                : 'اكتب تفاصيل الخدمة المطلوبة وسيصل الطلب للعامل مع بيانات التواصل.'}
            </p>
            <button
              type="button"
              className="profile-primary-btn"
              onClick={canEditProfile ? () => setEditOpen(true) : openServiceDialog}
            >
              {canEditProfile ? <FiEdit3 /> : <FiSend />}
              {canEditProfile ? 'تعديل البروفايل' : 'طلب خدمة'}
            </button>
          </section>

          {canEditProfile && (
            <section className="profile-side-panel profile-side-panel--completion">
              <ProfileCompletionCard profile={profile} onEdit={() => setEditOpen(true)} />
            </section>
          )}

          <section className="profile-side-panel">
            <div className="profile-side-panel__title">
              <FiShield />
              <h3>مؤشرات الثقة</h3>
            </div>
            <div className="profile-trust-list">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div className={`profile-trust-item ${item.active ? 'active' : ''}`} key={item.label}>
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="profile-side-panel">
            <div className="profile-side-panel__title">
              <FiTool />
              <h3>المهارات</h3>
            </div>
            {skillList.length > 0 ? (
              <div className="profile-skill-list">
                {skillList.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            ) : (
              <p className="profile-side-empty">لم يتم تحديد مهارات بعد.</p>
            )}
          </section>

          <section className="profile-side-panel">
            <ProfileAvailability availability={profile.availability} />
          </section>
        </aside>
      </main>

      <ProfileEditDialog
        open={editOpen}
        profile={profile}
        availableSkills={skills}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
      />

      <Dialog
        open={serviceDialogOpen}
        onClose={requestSending ? undefined : () => setServiceDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: 'profile-service-dialog' }}
      >
        <Box component="form" onSubmit={handleServiceRequestSubmit} dir="rtl">
          <DialogTitle sx={{ fontWeight: 900, color: 'var(--pp-text)', fontFamily: 'Cairo, sans-serif' }}>
            طلب خدمة من {fullName}
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <p className="profile-dialog-copy">
              اكتب وصفًا مختصرًا للخدمة المطلوبة، وسيصل الطلب للعامل مع بيانات التواصل الخاصة بك.
            </p>

            {requestError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {requestError}
              </Alert>
            )}

            <TextField
              autoFocus
              label="وصف الخدمة"
              value={serviceDescription}
              onChange={(event) => setServiceDescription(event.target.value)}
              multiline
              minRows={4}
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              type="button"
              onClick={() => setServiceDialogOpen(false)}
              disabled={requestSending}
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: 'Cairo, sans-serif' }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={requestSending}
              sx={{
                bgcolor: '#1a2744',
                '&:hover': { bgcolor: '#0f172a' },
                borderRadius: '12px',
                boxShadow: 'none',
                textTransform: 'none',
                fontWeight: 900,
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              {requestSending ? 'جاري إرسال الطلب...' : 'إرسال الطلب'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3500}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PageProfile;
