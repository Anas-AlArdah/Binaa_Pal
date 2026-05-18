import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
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
import ProfileVideoStats from '../../components/profile/ProfileVideoStats';
import ProfileReviews from '../../components/profile/ProfileReviews';
import AddReviewForm from '../../components/profile/AddReviewForm';
import ProfileEditDialog from '../../components/profile/ProfileEditDialog';
import ProfileCompletionCard from '../../components/profile/ProfileCompletionCard';
import ProfileTrustBadges from '../../components/profile/ProfileTrustBadges';
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

const WORKER_REQUEST_TEXT = {
  sending: 'جاري إرسال الطلب...',
  success:
    'تم إرسال طلب الخدمة للعامل بنجاح.',
  error:
    'تعذر إرسال طلب الخدمة. حاول مرة أخرى.',
  fallbackName: 'Binaa Test Client',
  fallbackEmail: 'client@example.com',
};

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
  const authUser = getStoredAuthUser();
  const authUserId = Number(authUser?.id);
  const profileUserId = Number(profile.user_id || profile.user?.id);
  const authWorkerProfileId = Number(authUser?.worker_profile?.id);
  const canEditProfile =
    (Number.isInteger(authUserId) && authUserId === profileUserId) ||
    (Number.isInteger(authWorkerProfileId) && authWorkerProfileId === Number(profile.id));

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

    const clientName = `${authUser?.firstname || ''} ${authUser?.lastname || ''}`.trim() ||
      WORKER_REQUEST_TEXT.fallbackName;
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

              {canEditProfile && (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<EditRoundedIcon />}
                  className="profile-banner__edit"
                  onClick={() => setEditOpen(true)}
                >
                  تعديل البروفايل
                </Button>
              )}
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
              <ProfileHeader 
                profile={profile} 
                onRequestService={openServiceDialog} 
                onShowPortfolio={handleScrollToPortfolio} 
              />
            </section>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box className="profile-stack">
              <section className="profile-panel" id="portfolio-section">
                <ProfilePortfolio portfolio={profile.portfolio_items} />
              </section>
              <section className="profile-panel">
                <ProfileReviews reviews={profile.reviews} />
                <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #e3ddd4' }}>
                   <AddReviewForm 
                     workerProfileId={profile.id} 
                     onReviewAdded={(newReview) => {
                       setProfile(prev => ({
                         ...prev,
                         reviews: [newReview, ...prev.reviews]
                       }));
                     }} 
                   />
                </Box>
              </section>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box className="profile-stack">
              {canEditProfile && (
                <div className="profile-panel">
                  <ProfileCompletionCard profile={profile} onEdit={() => setEditOpen(true)} />
                </div>
              )}

              <div className="profile-panel">
                <ProfileTrustBadges profile={profile} />
              </div>

              {profile.reviews && profile.reviews.length > 0 && (
                <div className="profile-panel">
                  <ProfileAiReview reviews={profile.reviews} />
                </div>
              )}

              <div className="profile-panel" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <ProfileVideoStats />
              </div>

              <div className="profile-panel">
                <ProfileStats profile={profile} />
              </div>

              <div className="profile-panel">
                <ProfileSkills major={profile.major} skills={profile.skill_names} />
              </div>

              <div className="profile-panel">
                <ProfileAvailability availability={profile.availability} />
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

      <Dialog
        open={serviceDialogOpen}
        onClose={requestSending ? undefined : () => setServiceDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleServiceRequestSubmit}>
          <DialogTitle sx={{ fontWeight: 900, color: '#1f1f1f' }}>
            طلب خدمة من {fullName}
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography sx={{ color: '#736d65', mb: 2, lineHeight: 1.8 }}>
              اكتب وصفًا مختصرًا للخدمة المطلوبة، وسيصل الطلب للعامل عبر الأوتوميشن.
            </Typography>

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
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={requestSending}
              sx={{
                bgcolor: '#5c7c43',
                '&:hover': { bgcolor: '#4d6a37' },
                borderRadius: '12px',
                boxShadow: 'none',
                textTransform: 'none',
                fontWeight: 800,
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
