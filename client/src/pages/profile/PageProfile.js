import React from 'react';
import { Container, Grid, Stack, Typography } from '@mui/material';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSkills from '../../components/profile/ProfileSkills';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileAiReview from '../../components/profile/ProfileAiReview';
import ProfileAvailability from '../../components/profile/ProfileAvailability';
import ProfilePortfolio from '../../components/profile/ProfilePortfolio';
import ProfileRegions from '../../components/profile/ProfileRegions';
import ProfileReviews from '../../components/profile/ProfileReviews';
import './PageProfile.css';

const PageProfile = () => {
  return (
    <div className="profile-page">
      <Container maxWidth="lg" className="profile-shell">
        {/* Banner Section */}
        <section className="profile-banner">
          <div className="profile-banner__content">
            <span className="profile-banner__eyebrow">الملف الشخصي الاحترافي</span>
            <Typography variant="h2" className="profile-banner__title">
              بناء الثقة عبر عرض الخبرة والقيمة بوضوح.
            </Typography>
            <Typography className="profile-banner__text">
              هذا البروفايل مصمم لمساعدة العملاء على فهم مهاراتك، أسعارك، ومعرض أعمالك من النظرة الأولى، مما يزيد من فرص اختيارك للمشاريع.
            </Typography>
          </div>
        </section>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div className="profile-panel">
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
              <div className="profile-panel">
                <ProfileRegions />
              </div>
              
              <div className="profile-cta">
                <h3>جاهز للعمل؟</h3>
                <p>تواصل مع العميل مباشرة وابدأ مشروعك القادم اليوم.</p>
                <button type="button" className="profile-cta__button">
                  تواصل معي الآن
                </button>
              </div>
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default PageProfile;

