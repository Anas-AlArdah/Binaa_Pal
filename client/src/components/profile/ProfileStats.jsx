import React from 'react';
import { Box, Typography } from '@mui/material';

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
      <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#1f1f1f', mb: 2 }}>
        معلومات عامة
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.4 }}>
        {statsData.map((stat) => (
          <Box
            key={stat.label}
            sx={{
              border: '1px solid #e3ddd4',
              borderRadius: '14px',
              p: 1.7,
              bgcolor: '#fbfaf8',
            }}
          >
            <Typography sx={{ color: '#736d65', fontSize: '12px', fontWeight: 700, mb: 0.7 }}>
              {stat.label}
            </Typography>
            <Typography sx={{ color: '#1f1f1f', fontSize: '15px', fontWeight: 800, lineHeight: 1.5 }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProfileStats;
