import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';


const ProfileSkills = ({ major }) => {
  if (!major) return null;
  const parsedSkills = major.split(',').map(s => s.trim()).filter(s => s);
  
  if (parsedSkills.length === 0) return null;

  return (
    <Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#556b2f', mb: 2, textTransform: 'uppercase' }}>
        التخصص والمهارات
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {parsedSkills.map((skill, index) => (
          <Chip
            key={skill}
            icon={index === 0 ? <BoltRoundedIcon sx={{ fontSize: '1rem !important' }} /> : undefined}
            label={skill}
            sx={{
              bgcolor: index === 0 ? '#556b2f' : 'transparent',
              color: index === 0 ? '#fff' : '#2d2a26',
              border: '1px solid',
              borderColor: index === 0 ? '#556b2f' : 'rgba(0,0,0,0.1)',
              fontWeight: 700,
              borderRadius: '10px'
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};


export default ProfileSkills;
