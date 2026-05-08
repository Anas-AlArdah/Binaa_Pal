import React from 'react';
import { Box, Rating, Stack, Typography } from '@mui/material';

const ProfileReviews = ({ reviews }) => {
  const displayReviews = reviews || [];

  if (displayReviews.length === 0) {
    return (
      <Box>
        <Typography variant="h5" sx={{ color: '#1f1f1f', fontWeight: 900, fontSize: '24px', mb: 1 }}>
          تقييمات العملاء
        </Typography>
        <Typography sx={{ color: '#736d65', fontSize: '14px', fontWeight: 500 }}>
          لا توجد تقييمات حتى الآن.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#1f1f1f', fontWeight: 900, fontSize: '24px', mb: 0.6 }}>
            تقييمات العملاء
          </Typography>
          <Typography sx={{ color: '#736d65', fontSize: '14px', lineHeight: 1.8 }}>
            تعليقات العملاء على المشاريع السابقة كما ظهرت في حساب العامل.
          </Typography>
        </Box>
        <Typography sx={{ color: '#5c7c43', fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap' }}>
          {displayReviews.length} تقييمات
        </Typography>
      </Box>

      <Stack spacing={2}>
        {displayReviews.map((review, index) => (
          <Box
            key={index}
            sx={{
              p: 2.2,
              borderRadius: '18px',
              border: '1px solid #e3ddd4',
              bgcolor: '#fbfaf8',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
              <Box>
                <Typography sx={{ color: '#1f1f1f', fontWeight: 800, fontSize: '16px', mb: 0.5 }}>
                  {review.reviewer
                    ? `${review.reviewer.firstname} ${review.reviewer.lastname}`
                    : 'عميل من منصة بناء'}
                </Typography>
                <Typography sx={{ color: '#736d65', fontSize: '12px', fontWeight: 600 }}>
                  {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: 110,
                  border: '1px solid #ead8b3',
                  borderRadius: '12px',
                  bgcolor: '#fff8eb',
                  px: 1.2,
                  py: 0.9,
                }}
              >
                <Rating value={review.rating} readOnly size="small" sx={{ color: '#c48b2d', mb: 0.4 }} />
                <Typography sx={{ color: '#7b5d2f', fontWeight: 800, fontSize: '13px' }}>
                  {review.rating} / 5
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ color: '#4c4a43', lineHeight: 1.9, fontSize: '15px' }}>
              {review.comment}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileReviews;
