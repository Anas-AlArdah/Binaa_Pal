import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const items = [
  {
    title: 'لوحة كهرباء رئيسية',
    caption: 'تنظيم حديث وعزل واضح وتوزيع عملي للكابلات',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'تمديدات منزلية',
    caption: 'حلول مرتبة بتشطيب نظيف يحافظ على الشكل والوظيفة',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'صيانة أعطال',
    caption: 'تشخيص سريع وخطة إصلاح واضحة قبل التنفيذ',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  },
];

const ProfilePortfolio = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#26231e', fontWeight: 900, mb: 2.2 }}>
        معرض الأعمال
      </Typography>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Box
              sx={{
                overflow: 'hidden',
                borderRadius: 5,
                border: '1px solid #e7ddd0',
                bgcolor: '#fff',
                boxShadow: '0 10px 24px rgba(84, 66, 39, 0.08)',
              }}
            >
              <Box
                sx={{
                  height: 220,
                  backgroundImage: `url('${item.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Box sx={{ p: 2 }}>
                <Typography sx={{ color: '#26231e', fontWeight: 800, mb: 0.7 }}>{item.title}</Typography>
                <Typography sx={{ color: '#6f675d', lineHeight: 1.7 }}>{item.caption}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfilePortfolio;
