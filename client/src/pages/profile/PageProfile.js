import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSkills from '../../components/profile/ProfileSkills';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileAiReview from '../../components/profile/ProfileAiReview';
import ProfileAvailability from '../../components/profile/ProfileAvailability';
import ProfilePortfolio from '../../components/profile/ProfilePortfolio';
import ProfileRegions from '../../components/profile/ProfileRegions';
import ProfileReviews from '../../components/profile/ProfileReviews';
import ProfileEditDialog from '../../components/profile/ProfileEditDialog';
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
  },
  reviews: Array.isArray(profile?.reviews) ? profile.reviews : [],
  skill_ids: Array.isArray(profile?.skill_ids) ? profile.skill_ids : [],
  skill_names: Array.isArray(profile?.skill_names) ? profile.skill_names : [],
  portfolio_items: normalizePortfolioItems(profile?.portfolio_items || profile?.p_images),
  p_images: profile?.p_images ?? '',
  profile_image:
    profile?.profile_image ||
    getFirstPortfolioImage(profile?.portfolio_items || profile?.p_images) ||
    '',
});

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

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    const fetchProfile = async () => {
      try {
        const [data, skillRows] = await Promise.all([
          fetchJson(`/api/worker-profiles/${id}`),
          fetchJson('/api/skills').catch(() => []),
        ]);

        if (isMounted) {
          setProfile(normalizeProfile(data));
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

        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(err));
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#5c7c43' }} />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" color="error">
          {error || 'الملف المهني غير موجود.'}
        </Typography>
      </Box>
    );
  }

  const fullName = `${profile.user.firstname} ${profile.user.lastname}`.trim();
  const portfolioItems = profile.portfolio_items || [];
  const priceRange = formatPriceRange(profile);

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

      setProfile(normalizeProfile(updatedProfile));
      setEditOpen(false);
      setSuccessMessage('تم تحديث البروفايل بنجاح.');
      return updatedProfile;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Container maxWidth="lg" className="profile-shell">
        <header className="profile-banner">
          <div className="profile-banner__content">
            <div className="profile-banner__actions">
              <div>
                <span className="profile-banner__eyebrow">صفحة العامل</span>
                <Typography className="profile-banner__title">{fullName}</Typography>
                <Typography className="profile-banner__subtitle">
                  {profile.major || 'عامل مهني'}{profile.user.location ? ` • ${profile.user.location}` : ''}
                </Typography>
              </div>

              <Button
                type="button"
                variant="contained"
                startIcon={<EditRoundedIcon />}
                className="profile-banner__edit"
                onClick={() => setEditOpen(true)}
              >
                تعديل البروفايل
              </Button>
            </div>

            <Typography className="profile-banner__text">
              {profile.bio ||
                'هذه الصفحة تعرض نبذة مختصرة عن العامل، المهارات المرتبطة به، وسوابق الأعمال المضافة من خلال الحساب.'}
            </Typography>

            <div className="profile-banner__meta">
              <div className="profile-banner__pill">
                <span className="profile-banner__pill-label">المهارات</span>
                <strong>{profile.skill_names.length || 0}</strong>
              </div>
              <div className="profile-banner__pill">
                <span className="profile-banner__pill-label">الأعمال</span>
                <strong>{portfolioItems.length}</strong>
              </div>
              <div className="profile-banner__pill">
                <span className="profile-banner__pill-label">التسعير</span>
                <strong>{priceRange}</strong>
              </div>
            </div>
          </div>
        </header>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <section className="profile-panel">
              <ProfileHeader profile={profile} />
            </section>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box className="profile-stack">
              <section className="profile-panel">
                <ProfilePortfolio portfolio={profile.portfolio_items} />
              </section>
              <section className="profile-panel">
                <ProfileReviews reviews={profile.reviews} />
              </section>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box className="profile-stack">
              {profile.reviews && profile.reviews.length > 0 && (
                <div className="profile-panel">
                  <ProfileAiReview reviews={profile.reviews} />
                </div>
              )}

              <div className="profile-panel">
                <ProfileStats profile={profile} />
              </div>

              <div className="profile-panel">
                <ProfileSkills major={profile.major} skills={profile.skill_names} />
              </div>

              <div className="profile-panel">
                <ProfileAvailability />
              </div>

              <div className="profile-panel">
                <ProfileRegions location={profile.user.location} />
              </div>

              <div className="profile-contact-card">
                <div className="profile-contact-card__label">بيانات سريعة</div>
                <div className="profile-contact-card__row">
                  <span>الهاتف</span>
                  <strong>{profile.user.phone || 'غير مضاف'}</strong>
                </div>
                <div className="profile-contact-card__row">
                  <span>المنطقة</span>
                  <strong>{profile.user.location || 'غير محددة'}</strong>
                </div>
                <div className="profile-contact-card__row">
                  <span>نطاق السعر</span>
                  <strong>{priceRange}</strong>
                </div>
                <button type="button" className="profile-contact-card__action">
                  تواصل مع العامل
                </button>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <ProfileEditDialog
        open={editOpen}
        profile={profile}
        availableSkills={skills}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
      />

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
