import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

const regions = ['الخليل', 'بيت لحم', 'دورا', 'يطا', 'الظاهرية'];

const ProfileRegions = ({ location }) => {
  const regions = location ? [location] : ['الخليل', 'بيت لحم'];

  return (
    <Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#556b2f', mb: 2, textTransform: 'uppercase' }}>
        مناطق الخدمة
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {regions.map((region) => (
          <Chip
            key={region}
            label={region}
            sx={{
              bgcolor: 'transparent',
              color: '#2d2a26',
              border: '1px solid rgba(0,0,0,0.1)',
              fontWeight: 700,
              borderRadius: '10px'
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};


export default ProfileRegions;
