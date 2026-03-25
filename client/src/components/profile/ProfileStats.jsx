import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const stats = [
  { label: 'السعر', value: '50-100 شيكل', hint: 'للساعة الواحدة' },
  { label: 'الخبرة', value: '8 سنوات', hint: 'في المجال' },
  { label: 'المشاريع', value: '+120', hint: 'منفذة بنجاح' },
  { label: 'الرضا', value: '97%', hint: 'توصية العملاء' },
];

const ProfileStats = () => {
  return (
    <Grid container spacing={1.5} sx={{ mt: 2 }}>
      {stats.map((stat) => (
        <Grid item xs={6} key={stat.label}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              border: '1px solid #e7ddd0',
              bgcolor: '#fcfaf6',
            }}
          >
            <Typography sx={{ color: '#8a7d6a', fontSize: '0.78rem', fontWeight: 700, mb: 0.8 }}>
              {stat.label}
            </Typography>
            <Typography sx={{ color: '#26231e', fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1 }}>
              {stat.value}
            </Typography>
            <Typography sx={{ color: '#6f675d', fontSize: '0.76rem', mt: 0.6 }}>
              {stat.hint}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfileStats;
