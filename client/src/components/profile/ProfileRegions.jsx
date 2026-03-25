import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

const regions = ['الخليل', 'بيت لحم', 'دورا', 'يطا', 'الظاهرية'];

const ProfileRegions = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#26231e', fontWeight: 900, mb: 1.5 }}>
        مناطق الخدمة
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {regions.map((region) => (
          <Chip
            key={region}
            label={region}
            sx={{
              bgcolor: '#fff',
              color: '#4f4a42',
              border: '1px solid #e7ddd0',
              fontWeight: 700,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileRegions;
