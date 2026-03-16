import React from 'react';
import { Box, Typography, Stack, Paper, Rating, Divider, Chip } from '@mui/material';

const ProfileReviews = () => {
  const reviews = [
    {
      author: 'مروان خبير جداً. تسليك بيتنا القديم أصبح حديثاً وآمناً.',
      date: '2025-04-17',
      rating: 5,
      verified: true,
      stats: { quality: 5, punctuality: 4, value: 4, communication: 5 }
    },
    {
      author: 'كهربائي ممتاز ولكن السعر كان مرتفعاً قليلاً.',
      date: '2025-06-20',
      rating: 4,
      verified: true,
      stats: { quality: 5, punctuality: 5, value: 3, communication: 4 }
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2c2c2c', mb: 2 }}>
        التقييمات لأعمال الكهرباء (3)
      </Typography>
      <Stack spacing={2}>
        {reviews.map((review, index) => (
          <Paper 
            key={index}
            elevation={0}
            sx={{ 
              p: 2.5, 
              border: '1px solid #e8e0d0', 
              borderRadius: 2,
              bgcolor: '#fff'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={review.rating} readOnly size="small" sx={{ color: '#e8a630' }} />
                <Chip label="موثوق" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#eee', color: '#999' }} />
              </Stack>
              <Typography variant="caption" sx={{ color: '#999' }}>{review.date}</Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#444', mb: 1.5, lineHeight: 1.6 }}>
              {review.author}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ color: '#999', fontSize: '0.75rem' }}>
              <Box>الجودة: {review.stats.quality}</Box>
              <Box>الالتزام بالوقت: {review.stats.punctuality}</Box>
              <Box>القيمة: {review.stats.value}</Box>
              <Box>التواصل: {review.stats.communication}</Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileReviews;
