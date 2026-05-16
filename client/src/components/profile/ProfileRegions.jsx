import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const ProfileRegions = ({ location }) => {
  const profileLocation = location || 'غير محدد';

  return (
    <Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#556b2f', mb: 2, textTransform: 'uppercase' }}>
        الموقع
      </Typography>
      <Chip
        label={profileLocation}
        sx={{
          bgcolor: 'transparent',
          color: '#2d2a26',
          border: '1px solid rgba(0,0,0,0.1)',
          fontWeight: 700,
          borderRadius: '10px',
        }}
      />
    </Box>
  );
};

export default ProfileRegions;
