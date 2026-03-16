import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';

const ProfileRegions = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2c2c2c', mb: 1.5 }}>
        مناطق الخدمة
      </Typography>
      <Stack direction="row" spacing={1}>
        <Chip label="الخليل" variant="outlined" sx={{ borderRadius: 6, borderColor: '#eee', color: '#666', fontSize: '0.85rem' }} />
        <Chip label="بيت لحم" variant="outlined" sx={{ borderRadius: 6, borderColor: '#eee', color: '#666', fontSize: '0.85rem' }} />
      </Stack>
    </Box>
  );
};

export default ProfileRegions;
