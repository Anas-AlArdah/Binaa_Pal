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
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CalendarMonthRoundedIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 900, fontFamily: 'Cairo, sans-serif' }}>
            أوقات العمل
          </Typography>
        </Stack>
        <Typography sx={{ color: '#64748b', fontStyle: 'italic', fontFamily: 'Cairo, sans-serif' }}>
          لم يتم تحديد أوقات العمل بعد.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <CalendarMonthRoundedIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 900, fontFamily: 'Cairo, sans-serif' }}>
          أوقات العمل
        </Typography>
      </Stack>

      <Stack spacing={1.2}>
        {availability.map((slot, index) => {
          const isOff = !slot.is_available;
          const timeRange = isOff ? 'مغلق' : `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`;
          
          return (
            <Paper
              key={slot.day_of_week || index}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: isOff ? '#f8fafc' : '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: isOff ? 0.7 : 1,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: isOff ? '#e2e8f0' : '#cbd5e1',
                  bgcolor: isOff ? '#f8fafc' : '#f1f5f9'
                }
              }}
            >
              <Typography sx={{ color: '#0f172a', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
                {DAY_AR[slot.day_of_week] || slot.day_of_week}
              </Typography>
              <Typography sx={{ color: isOff ? '#94a3b8' : '#10b981', fontWeight: 800, fontFamily: 'Cairo, sans-serif' }}>
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
