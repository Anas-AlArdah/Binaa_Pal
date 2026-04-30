import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSkills from '../../components/profile/ProfileSkills';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileAiReview from '../../components/profile/ProfileAiReview';
import ProfileAvailability from '../../components/profile/ProfileAvailability';
import ProfilePortfolio from '../../components/profile/ProfilePortfolio';
import ProfileRegions from '../../components/profile/ProfileRegions';
import ProfileReviews from '../../components/profile/ProfileReviews';
import { ApiError, fetchJson, getApiErrorMessage } from '../../utils/api';
import './PageProfile.css';

const normalizeProfile = (profile) => ({
  ...profile,
  user: profile?.user ?? {
    firstname: 'حرفي',
    lastname: 'منصة بناء',
    location: 'فلسطين',
  },
  reviews: Array.isArray(profile?.reviews) ? profile.reviews : [],
  p_images: profile?.p_images ?? '',
});

const PageProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    const fetchProfile = async () => {
      try {
        const data = await fetchJson(`/api/worker-profiles/${id}`);

        if (isMounted) {
          setProfile(normalizeProfile(data));
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
        <CircularProgress sx={{ color: '#556b2f' }} />
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

  return (
    <div className="profile-page">
      <Container maxWidth="lg" className="profile-shell">
        <header className="profile-banner">
          <div className="profile-banner__content">
            <span className="profile-banner__eyebrow">منصة بناء | الملف المهني</span>
            <Typography variant="h2" className="profile-banner__title">
              {fullName}
              <br />
              بين يديك بكل شفافية.
            </Typography>
            <Typography className="profile-banner__text">
              {profile.bio ||
                'استكشف المهارات، شاهد سوابق الأعمال، واطلع على تقييمات العملاء الموثقة. نحن هنا لنضمن لك تجربة بناء قائمة على الثقة والاحترافية العالية.'}
            </Typography>
          </div>
        </header>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <section className="profile-panel">
              <ProfileHeader profile={profile} />
            </section>
          </Grid>

          <Grid item xs={12} md={8.5}>
            <Box className="profile-stack">
              <section className="profile-panel">
                <ProfilePortfolio portfolio={profile.p_images} />
              </section>
              <section className="profile-panel">
                <ProfileReviews reviews={profile.reviews} />
              </section>
            </Box>
          </Grid>

          <Grid item xs={12} md={3.5}>
            <Box className="profile-stack">
              {profile.reviews && profile.reviews.length > 0 && (
                <div className="profile-panel" style={{ background: 'linear-gradient(145deg, #ffffff, #f9fbf7)' }}>
                  <ProfileAiReview reviews={profile.reviews} />
                </div>
              )}

              <div className="profile-panel">
                <ProfileStats profile={profile} />
                <hr style={{ margin: '24px 0', opacity: 0.1 }} />
                <ProfileSkills major={profile.major} />
              </div>

              <div className="profile-panel">
                <ProfileAvailability />
              </div>

              <div className="profile-panel">
                <ProfileRegions location={profile.user.location} />
              </div>

              <div className="profile-cta">
                <div className="profile-cta__badge">متاح للمشاريع</div>
                <h3>تحدث مع {profile.user.firstname}</h3>
                <p>ابدأ بمناقشة تفاصيل مشروعك والحصول على عرض سعر أولي.</p>
                <button type="button" className="profile-cta__button">
                  إرسال رسالة
                </button>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default PageProfile;
