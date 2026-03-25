import React from 'react';
import { Box, Container, Grid, Stack, Typography, Chip } from '@mui/material';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSkills from '../../components/profile/ProfileSkills';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileAiReview from '../../components/profile/ProfileAiReview';
import ProfileAvailability from '../../components/profile/ProfileAvailability';
import ProfilePortfolio from '../../components/profile/ProfilePortfolio';
import ProfileRegions from '../../components/profile/ProfileRegions';
import ProfileReviews from '../../components/profile/ProfileReviews';
import './PageProfile.css';

const highlights = [
  { label: 'ملف موثق', icon: <VerifiedRoundedIcon /> },
  { label: 'استجابة سريعة', icon: <ScheduleRoundedIcon /> },
  { label: 'خبرة كهربائية متخصصة', icon: <BoltRoundedIcon /> },
];

const PageProfile = () => {
  return (
    <Box className="profile-page">
      <Container maxWidth="lg" className="profile-shell">
        <section className="profile-banner">
          <div className="profile-banner__content">
            <Typography className="profile-banner__eyebrow">الملف الشخصي للحرفي</Typography>
            <Typography variant="h2" className="profile-banner__title">
              بروفايل احترافي يبني الثقة ويعرض القيمة بوضوح.
            </Typography>
            <Typography className="profile-banner__text">
              ترتيب أفضل للمعلومات، أسلوب بصري أنظف، ومسارات أوضح تساعد العميل يفهم الخبرة، السعر، ومعرض الأعمال من أول نظرة.
            </Typography>
            <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mt: 2.5 }}>
              {highlights.map((item) => (
                <Chip key={item.label} icon={item.icon} label={item.label} className="profile-banner__chip" />
              ))}
            </Stack>
          </div>

          <div className="profile-banner__summary">
            <div className="profile-summary-card">
              <span className="profile-summary-card__label">التقييم العام</span>
              <strong>4.9</strong>
              <p>ثقة مرتفعة ومراجعات إيجابية من العملاء</p>
            </div>
            <div className="profile-summary-card">
              <span className="profile-summary-card__label">جاهزية التنفيذ</span>
              <strong>24h</strong>
              <p>بدء سريع للطلبات الجديدة والأعمال المستعجلة</p>
            </div>
          </div>
        </section>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div className="profile-panel profile-panel--hero">
              <ProfileHeader />
            </div>
          </Grid>

          <Grid item xs={12} md={8}>
            <div className="profile-stack">
              <div className="profile-panel">
                <ProfilePortfolio />
              </div>
              <div className="profile-panel">
                <ProfileReviews />
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={4}>
            <div className="profile-stack">
              <div className="profile-panel">
                <ProfileAiReview />
              </div>
              <div className="profile-panel">
                <ProfileSkills />
                <ProfileStats />
              </div>
              <div className="profile-panel">
                <ProfileAvailability />
              </div>
              <div className="profile-panel profile-panel--soft">
                <ProfileRegions />
              </div>
              <div className="profile-cta">
                <span className="profile-cta__eyebrow">جاهز للعمل</span>
                <h3>واجهة مرتبة تعطي قرار أسرع للعميل.</h3>
                <p>عرض الخبرة والتخصص والتقييم بهذه الطريقة يجعل طلب الخدمة أوضح وأكثر إقناعًا.</p>
                <button type="button" className="profile-cta__button">
                  اطلب الخدمة الآن
                </button>
              </div>
            </div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PageProfile;
