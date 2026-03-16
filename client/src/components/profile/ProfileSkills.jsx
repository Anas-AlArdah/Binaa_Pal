import React from 'react';
import { Box, Chip } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/Bolt'; // Using Bolt for Electrical

const ProfileSkills = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Chip 
        icon={<FlashOnIcon sx={{ fontSize: '1rem !important', color: '#fff !important' }} />} 
        label="كهرباء" 
        sx={{ 
          bgcolor: '#5a6b35', 
          color: '#fff', 
          fontWeight: 600,
          '&:hover': { bgcolor: '#4a5a2b' },
          '.MuiChip-label': { pl: 1 }
        }} 
      />
    </Box>
  );
};

export default ProfileSkills;
