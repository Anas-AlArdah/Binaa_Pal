import React from 'react';
import { Box, Typography, Stack, Paper, Rating, Chip } from '@mui/material';

const reviews = [
  {
    author: 'سارة ن.',
    text: 'التعامل كان ممتاز، الحضور بالوقت، والتنفيذ نظيف جدًا. أكثر شيء أعجبني أنه شرح المشكلة والحل قبل البدء.',
    date: '2026-02-17',
    rating: 5,
    stats: { الجودة: 5, الالتزام: 5, القيمة: 4, التواصل: 5 },
  },
  {
    author: 'أحمد ر.',
    text: 'شغل احترافي وسريع، والتكلفة كانت واضحة. الصفحة الحالية تعكس مستواه بشكل أفضل بكثير.',
    date: '2026-01-20',
    rating: 4,
    stats: { الجودة: 5, الالتزام: 4, القيمة: 4, التواصل: 5 },
  },
];

const ProfileReviews = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#26231e', fontWeight: 900, mb: 2.2 }}>
        تقييمات العملاء
      </Typography>

      <Stack spacing={2}>
        {reviews.map((review) => (
          <Paper
            key={`${review.author}-${review.date}`}
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 4,
              border: '1px solid #e7ddd0',
              bgcolor: '#fcfaf6',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1.2 }}>
              <Box>
                <Typography sx={{ color: '#26231e', fontWeight: 800 }}>{review.author}</Typography>
                <Typography sx={{ color: '#8a7d6a', fontSize: '0.82rem' }}>{review.date}</Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={review.rating} readOnly size="small" sx={{ color: '#d0a451' }} />
                <Chip label="موثّق" size="small" sx={{ bgcolor: '#eef4e7', color: '#4f6334', fontWeight: 700 }} />
              </Stack>
            </Box>

            <Typography sx={{ color: '#4f4a42', lineHeight: 1.9, mb: 1.4 }}>{review.text}</Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {Object.entries(review.stats).map(([label, value]) => (
                <Chip
                  key={label}
                  label={`${label}: ${value}/5`}
                  sx={{
                    bgcolor: '#fff',
                    color: '#5c564c',
                    border: '1px solid #e7ddd0',
                    fontWeight: 700,
                  }}
                />
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileReviews;
