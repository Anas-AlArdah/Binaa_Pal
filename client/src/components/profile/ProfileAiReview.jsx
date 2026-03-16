import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ProfileAiReview = () => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        mb: 4,
        border: '1px solid #e8e0d0', 
        borderRadius: 2,
        bgcolor: '#fcfcf8'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AutoAwesomeIcon sx={{ fontSize: '1.1rem', color: '#b5a176' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#2c2c2c' }}>
          ملخص تقييم الذكاء الاصطناعي
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6 }}>
        بناءً على 3 تقييمات موثوقة: نقاط القوة: جودة ممتازة، تواصل جيد وموثوقية عالية.
      </Typography>
    </Paper>
  );
};

export default ProfileAiReview;
