import React from 'react';
import { Box, Typography, Stack, Paper, Rating, Chip } from '@mui/material';



const ProfileReviews = ({ reviews }) => {
  const displayReviews = reviews || [];
  
  if (displayReviews.length === 0) {
    return (
      <Box>
        <Typography variant="h5" sx={{ color: '#2d2a26', fontWeight: 900, fontSize: '24px', mb: 1 }}>
          تقييمات العملاء
        </Typography>
        <Typography sx={{ color: '#6f685d', fontSize: '14px', fontWeight: 500 }}>
          لا يوجد تقييمات حتى الآن.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#2d2a26', fontWeight: 900, fontSize: '24px' }}>
            تقييمات العملاء الموثقة
          </Typography>
          <Typography sx={{ color: '#6f685d', fontSize: '14px', fontWeight: 500 }}>
            آراء العملاء الحقيقية بناءً على مشاريع سابقة
          </Typography>
        </Box>
        <Chip 
          label={`${displayReviews.length} تقييم`} 
          sx={{ bgcolor: '#fdf8ef', color: '#c49e5c', border: '1px solid rgba(196, 158, 92, 0.2)', fontWeight: 800 }} 
        />
      </Box>

      <Stack spacing={3}>
        {displayReviews.map((review, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.05)',
              bgcolor: '#fdfaf5',
              transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#fff', boxShadow: '0 10px 30px rgba(66, 52, 32, 0.05)' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Box>
                <Typography sx={{ color: '#2d2a26', fontWeight: 800, fontSize: '16px' }}>{review.reviewer ? `${review.reviewer.firstname} ${review.reviewer.lastname}` : 'عميل منصة بناء'}</Typography>
                <Typography sx={{ color: '#8a7d6a', fontSize: '12px', fontWeight: 600 }}>
                  {new Date(review.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={review.rating} readOnly size="small" sx={{ color: '#c49e5c' }} />
                <Typography sx={{ color: '#c49e5c', fontWeight: 800, fontSize: '14px' }}>{review.rating}.0</Typography>
              </Stack>
            </Box>

            <Typography sx={{ color: '#4c4a43', lineHeight: 1.8, fontSize: '15px', fontWeight: 500 }}>
              {review.comment}
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Chip label="مشروع مكتمل" size="small" sx={{ height: 24, fontSize: '11px', bgcolor: 'rgba(85, 107, 47, 0.1)', color: '#556b2f', border: '1px solid rgba(85, 107, 47, 0.2)', fontWeight: 700 }} />
              <Chip label="دفع موثق" size="small" sx={{ height: 24, fontSize: '11px', bgcolor: 'rgba(196, 158, 92, 0.1)', color: '#c49e5c', border: '1px solid rgba(196, 158, 92, 0.2)', fontWeight: 700 }} />
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};


export default ProfileReviews;
