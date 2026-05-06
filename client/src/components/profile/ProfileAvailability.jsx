import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

const schedule = [
  { day: 'الأحد', time: '08:00 - 17:00' },
  { day: 'الإثنين', time: '08:00 - 17:00' },
  { day: 'الثلاثاء', time: '08:00 - 17:00' },
  { day: 'الأربعاء', time: '08:00 - 17:00' },
  { day: 'الخميس', time: '08:00 - 14:00' },
  { day: 'الجمعة', time: 'مغلق', off: true },
  { day: 'السبت', time: 'مغلق', off: true },
];

const ProfileAvailability = () => {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.8 }}>
        <CalendarMonthRoundedIcon sx={{ color: '#5d7340' }} />
        <Typography variant="h6" sx={{ color: '#26231e', fontWeight: 900 }}>
          أوقات العمل
        </Typography>
      </Stack>

      <Stack spacing={1}>
        {schedule.map((slot) => (
          <Paper
            key={slot.day}
            elevation={0}
            sx={{
              p: 1.4,
              borderRadius: 3,
              border: '1px solid #e7ddd0',
              bgcolor: slot.off ? '#fff' : '#fcfaf6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: '#3e3933', fontWeight: 700 }}>{slot.day}</Typography>
            <Typography sx={{ color: slot.off ? '#9b9285' : '#5d7340', fontWeight: 700 }}>{slot.time}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileAvailability;
