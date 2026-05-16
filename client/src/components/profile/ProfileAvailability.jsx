import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

const DAY_AR = {
  'Sunday': 'الأحد',
  'Monday': 'الإثنين',
  'Tuesday': 'الثلاثاء',
  'Wednesday': 'الأربعاء',
  'Thursday': 'الخميس',
  'Friday': 'الجمعة',
  'Saturday': 'السبت'
};

const ProfileAvailability = ({ availability }) => {
  // If no availability data, show a message or default
  if (!availability || availability.length === 0) {
    return (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.8 }}>
          <CalendarMonthRoundedIcon sx={{ color: '#5d7340' }} />
          <Typography variant="h6" sx={{ color: '#26231e', fontWeight: 900 }}>
            أوقات العمل
          </Typography>
        </Stack>
        <Typography sx={{ color: '#9b9285', fontStyle: 'italic' }}>
          لم يتم تحديد أوقات العمل بعد.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.8 }}>
        <CalendarMonthRoundedIcon sx={{ color: '#5d7340' }} />
        <Typography variant="h6" sx={{ color: '#26231e', fontWeight: 900 }}>
          أوقات العمل
        </Typography>
      </Stack>

      <Stack spacing={1}>
        {availability.map((slot, index) => {
          const isOff = !slot.is_available;
          const timeRange = isOff ? 'مغلق' : `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`;
          
          return (
            <Paper
              key={slot.day_of_week || index}
              elevation={0}
              sx={{
                p: 1.4,
                borderRadius: 3,
                border: '1px solid #e7ddd0',
                bgcolor: isOff ? '#fff' : '#fcfaf6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: isOff ? 0.6 : 1
              }}
            >
              <Typography sx={{ color: '#3e3933', fontWeight: 700 }}>
                {DAY_AR[slot.day_of_week] || slot.day_of_week}
              </Typography>
              <Typography sx={{ color: isOff ? '#9b9285' : '#5d7340', fontWeight: 700 }}>
                {timeRange}
              </Typography>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ProfileAvailability;
