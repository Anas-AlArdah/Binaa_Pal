import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const ProfileAvailability = () => {
  const schedule = [
    { day: 'الأحد', time: '08:00–17:00' },
    { day: 'الإثنين', time: '08:00–17:00' },
    { day: 'الثلاثاء', time: '08:00–17:00' },
    { day: 'الأربعاء', time: '08:00–17:00' },
    { day: 'الخميس', time: '08:00–14:00' },
    { day: 'الجمعة', time: 'مغلق', off: true },
    { day: 'السبت', time: 'مغلق', off: true },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <CalendarMonthIcon sx={{ fontSize: '1.2rem', color: '#2c2c2c' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2c2c2c', fontSize: '1rem' }}>
          أوقات العمل
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {schedule.map((slot, index) => (
          <Paper 
            key={index} 
            elevation={0}
            sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              minWidth: 70, 
              border: '1px solid #eee', 
              borderRadius: 2,
              bgcolor: slot.off ? '#fff' : '#e8ecd9',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
              {slot.day}
            </Typography>
            <Typography variant="caption" sx={{ color: slot.off ? '#ddd' : '#666', fontWeight: 600, fontSize: '0.65rem' }}>
              {slot.time}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileAvailability;
