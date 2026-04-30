import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import HistoryToggleOffOutlinedIcon from '@mui/icons-material/HistoryToggleOffOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';


const ProfileStats = ({ profile }) => {
  if (!profile) return null;

  const reviewCount = profile.reviews ? profile.reviews.length : 0;
  
  // Calculate average rating -> percent for satisfaction
  const satisfaction = reviewCount > 0 
    ? Math.round((profile.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount) * 20) + '%'
    : 'جديد';

  const statsData = [
    { 
      label: 'نطاق السعر', 
      value: profile.min_price && profile.max_price ? `${profile.min_price}-${profile.max_price} ₪` : 'حسب المشروع', 
      icon: <PaymentsOutlinedIcon sx={{ fontSize: 20 }} />, 
      color: '#556b2f' 
    },
    { 
      label: 'تاريخ الانضمام', 
      value: new Date(profile.createdAt).getFullYear() || 'قريباً', 
      icon: <HistoryToggleOffOutlinedIcon sx={{ fontSize: 20 }} />, 
      color: '#c49e5c' 
    },
    { 
      label: 'تقييمات موثقة', 
      value: reviewCount > 0 ? `+${reviewCount}` : '0', 
      icon: <FactCheckOutlinedIcon sx={{ fontSize: 20 }} />, 
      color: '#556b2f' 
    },
    { 
      label: 'رضا العملاء', 
      value: satisfaction, 
      icon: <ThumbUpOutlinedIcon sx={{ fontSize: 20 }} />, 
      color: '#c49e5c' 
    },
  ];

  return (
    <Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#556b2f', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        إحصائيات الأداء
      </Typography>
      <Stack spacing={2.5}>
        {statsData.map((stat) => (
          <Box key={stat.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${stat.color}10`,
                color: stat.color,
                border: `1px solid ${stat.color}20`
              }}
            >
              {stat.icon}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ color: '#6f685d', fontSize: '13px', fontWeight: 600 }}>
                {stat.label}
              </Typography>
              <Typography sx={{ color: '#2d2a26', fontSize: '17px', fontWeight: 800, lineHeight: 1.2 }}>
                {stat.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};


export default ProfileStats;

