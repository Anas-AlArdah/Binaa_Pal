import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

const ProfileStats = ({ profile }) => {
  if (!profile) return null;

  const reviewCount = profile.reviews ? profile.reviews.length : 0;
  const satisfaction =
    reviewCount > 0
      ? `${Math.round((profile.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount) * 20)}%`
      : 'جديد';

  const statsData = [
    {
      label: 'نطاق السعر',
      value:
        profile.min_price && profile.max_price
          ? `${profile.min_price} - ${profile.max_price} شيكل`
          : 'حسب المشروع',
    },
    {
      label: 'سنة الانضمام',
      value: profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'حديثًا',
    },
    {
      label: 'عدد التقييمات',
      value: reviewCount > 0 ? String(reviewCount) : '0',
    },
    {
      label: 'رضا العملاء',
      value: satisfaction,
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <AssessmentOutlinedIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
        <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
          إحصائيات ومعلومات
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {statsData.map((stat) => (
          <Box
            key={stat.label}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              p: 2,
              bgcolor: '#f8fafc',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#f1f5f9',
                borderColor: '#cbd5e1',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Typography sx={{ color: '#64748b', fontSize: '12px', fontWeight: 700, mb: 0.7, fontFamily: 'Cairo, sans-serif' }}>
              {stat.label}
            </Typography>
            <Typography sx={{ color: '#0f172a', fontSize: '15px', fontWeight: 800, lineHeight: 1.5, fontFamily: 'Cairo, sans-serif' }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProfileStats;
