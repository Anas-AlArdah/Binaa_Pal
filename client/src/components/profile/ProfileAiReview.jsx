import React from 'react';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';

const ProfileAiReview = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
  const qualityScore = Math.min(100, Math.round((averageRating / 5) * 100));
  const punctualityScore = reviews[0]?.punctuality
    ? Math.round((reviews.reduce((acc, curr) => acc + (curr.punctuality || curr.rating), 0) / reviews.length) * 20)
    : Math.max(0, qualityScore - 4);
  const communicationScore = Math.min(100, qualityScore + 2);

  const metrics = [
    { label: 'جودة التنفيذ', value: qualityScore, color: '#315677' },
    { label: 'الالتزام بالمواعيد', value: punctualityScore, color: '#8f6b4f' },
    { label: 'التواصل مع العميل', value: communicationScore, color: '#4b7a4d' },
  ];

  return (
    <Box>
      <Typography sx={{ color: '#1f1f1f', fontWeight: 900, fontSize: '18px', mb: 0.7 }}>
        ملخص التقييمات
      </Typography>
      <Typography sx={{ color: '#736d65', fontSize: '14px', lineHeight: 1.8, mb: 2.2 }}>
        قراءة سريعة لمتوسط أداء العامل بناءً على {reviews.length} تقييمات موجودة في الحساب.
      </Typography>

      <Box
        sx={{
          border: '1px solid #e3ddd4',
          borderRadius: '14px',
          bgcolor: '#fbfaf8',
          p: 1.8,
          mb: 2.2,
        }}
      >
        <Typography sx={{ color: '#736d65', fontSize: '12px', fontWeight: 700, mb: 0.6 }}>
          المتوسط العام
        </Typography>
        <Typography sx={{ color: '#1f1f1f', fontSize: '28px', fontWeight: 900 }}>
          {averageRating} / 5
        </Typography>
      </Box>

      <Stack spacing={1.8}>
        {metrics.map((metric) => (
          <Box key={metric.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Typography sx={{ color: '#1f1f1f', fontSize: '14px', fontWeight: 700 }}>
                {metric.label}
              </Typography>
              <Typography sx={{ color: metric.color, fontSize: '13px', fontWeight: 800 }}>
                {metric.value}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metric.value}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: '#ece5db',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: metric.color,
                  borderRadius: 999,
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileAiReview;
