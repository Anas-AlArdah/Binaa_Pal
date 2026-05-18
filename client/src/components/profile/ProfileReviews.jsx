import React from 'react';
import { Box, Rating, Stack, Typography, Avatar } from '@mui/material';

const ProfileReviews = ({ reviews }) => {
  const displayReviews = reviews || [];

  if (displayReviews.length === 0) {
    return (
      <Box>
        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 900, fontSize: '24px', mb: 1, fontFamily: 'Cairo, sans-serif' }}>
          تقييمات العملاء
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '15px', fontWeight: 500, fontFamily: 'Cairo, sans-serif' }}>
          لا توجد تقييمات حتى الآن. كن أول من يقيّم هذا الحرفي!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 900, fontSize: '24px', mb: 0.6, fontFamily: 'Cairo, sans-serif' }}>
            تقييمات العملاء
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '14px', lineHeight: 1.8, fontFamily: 'Cairo, sans-serif' }}>
            تعليقات العملاء على المشاريع السابقة تعكس مدى جودة والتزام العامل.
          </Typography>
        </Box>
        <Typography sx={{ color: '#1a2744', fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap', bgcolor: '#f0f4ff', padding: '6px 14px', borderRadius: '12px', fontFamily: 'Cairo, sans-serif' }}>
          {displayReviews.length} تقييمات
        </Typography>
      </Box>

      <Stack spacing={3}>
        {displayReviews.map((review, index) => (
          <Box
            key={index}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              bgcolor: '#fff',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#cbd5e1',
                boxShadow: '0 10px 20px -5px rgba(26, 39, 68, 0.05)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, width: 48, height: 48, fontFamily: 'Cairo, sans-serif' }}>
                  {review.reviewer ? review.reviewer.firstname.charAt(0) : 'ع'}
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '16px', mb: 0.5, fontFamily: 'Cairo, sans-serif' }}>
                    {review.reviewer
                      ? `${review.reviewer.firstname} ${review.reviewer.lastname}`
                      : 'عميل من منصة بناء'}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, fontFamily: 'Cairo, sans-serif' }}>
                    {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  minWidth: 100,
                  border: '1px solid #fef08a',
                  borderRadius: '14px',
                  bgcolor: '#fffbeb',
                  px: 1.5,
                  py: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Rating value={review.rating} readOnly size="small" sx={{ color: '#F59E0B', mb: 0.5 }} />
                <Typography sx={{ color: '#b45309', fontWeight: 800, fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>
                  {review.rating} / 5
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ color: '#475569', lineHeight: 1.9, fontSize: '15px', fontFamily: 'Cairo, sans-serif', pr: { xs: 0, sm: 8 } }}>
              {review.comment}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileReviews;
