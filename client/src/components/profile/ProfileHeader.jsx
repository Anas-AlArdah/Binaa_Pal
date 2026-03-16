import React from 'react';
import { Box, Typography, Button, Avatar, Stack } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ProfileHeader = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: 3,
        mb: 2
      }}
    >
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: '#e0dbcf', 
            color: '#7a766a',
            fontSize: '2rem',
            fontWeight: 700,
            border: '1px solid #d1ccc0'
          }}
        >
          M
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c2c2c', mb: 0.5 }}>
            مروان حداد
          </Typography>
          <Stack direction="row" spacing={2} sx={{ color: '#777', fontSize: '0.85rem', mb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: '1rem', color: '#999' }} />
              الخليل
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: '1rem', color: '#e8a630' }} />
              4.6 (3 تقييمات)
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <RestartAltIcon sx={{ fontSize: '1rem', color: '#999' }} />
              90 موثوقية
            </Box>
          </Stack>
          <Typography variant="body2" sx={{ color: '#555', maxWidth: 450, mb: 1.5, lineHeight: 1.6 }}>
            كهربائي مرخص. أعمال كهربائية آمنة ومعتمدة وموثوقة للمنازل والشركات.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#777', fontSize: '0.85rem' }}>
            <i className="fas fa-phone-alt" style={{ fontSize: '0.8rem', color: '#999' }}></i>
            <Typography variant="caption" sx={{ color: '#777' }}>
              هاتف, واتساب
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Button 
        variant="contained" 
        className="btn-request-olive"
      >
        طلب هذا العامل
      </Button>
    </Box>
  );
};

export default ProfileHeader;
