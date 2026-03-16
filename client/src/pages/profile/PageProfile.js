import React from 'react';
import { Box, Paper, Container } from '@mui/material';
import './PageProfile.css';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSkills from '../../components/profile/ProfileSkills';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileAiReview from '../../components/profile/ProfileAiReview';
import ProfileAvailability from '../../components/profile/ProfileAvailability';
import ProfilePortfolio from '../../components/profile/ProfilePortfolio';
import ProfileRegions from '../../components/profile/ProfileRegions';
import ProfileReviews from '../../components/profile/ProfileReviews';

const PageProfile = () => {
  return (
    <Box className="profile-page">
      <Container maxWidth="md" className="profile-container">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 3, 
            bgcolor: '#fff',
            border: '1px solid #e8e0d0',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Header */}
          <ProfileHeader />

          {/* Type of work Tag */}
          <ProfileSkills />

          {/* Main Pricing/Stats Row */}
          <ProfileStats />

          {/* AI Summary Box */}
          <ProfileAiReview />

          {/* Detailed Sections */}
          <ProfileAvailability />
          
          <ProfilePortfolio />
          
          <ProfileRegions />
          
          <ProfileReviews />
        </Paper>
      </Container>
    </Box>
  );
};

export default PageProfile;
