import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const ProfileStats = () => {
  const stats = [
    { label: 'السعر', value: '50–100 شيكل/ساعة' },
    { label: 'الخبرة', value: '8 سنوات' },
    { label: 'التقييم', value: '4.6/5' },
    { label: 'الموثوقية', value: '90/100', valueColor: '#5a6b35' }
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              textAlign: 'center', 
              border: '1px solid #e8e0d0', 
              borderRadius: 2,
              bgcolor: '#fafafa',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
              {stat.label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: stat.valueColor || '#2c2c2c', fontSize: '0.95rem' }}>
              {stat.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfileStats;
