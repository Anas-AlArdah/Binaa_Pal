import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

const skills = ['كهرباء', 'تمديدات', 'صيانة أعطال', 'لوحات كهرباء', 'فحص أحمال', 'تشطيب نهائي'];

const ProfileSkills = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#26231e', fontWeight: 900, mb: 1.5 }}>
        التخصصات
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {skills.map((skill, index) => (
          <Chip
            key={skill}
            icon={index === 0 ? <BoltRoundedIcon sx={{ fontSize: '1rem !important', color: '#fff !important' }} /> : undefined}
            label={skill}
            sx={{
              bgcolor: index === 0 ? '#5d7340' : '#fff',
              color: index === 0 ? '#fff' : '#4f4a42',
              border: index === 0 ? 'none' : '1px solid #e7ddd0',
              fontWeight: 700,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileSkills;
