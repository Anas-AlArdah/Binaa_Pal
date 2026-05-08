import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

const ProfileSkills = ({ major, skills = [] }) => {
  const parsedSkills =
    Array.isArray(skills) && skills.length > 0
      ? skills.filter(Boolean)
      : String(major || '')
          .split(',')
          .map((skill) => skill.trim())
          .filter((skill) => skill);

  if (parsedSkills.length === 0) return null;

  return (
    <Box>
      <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#1f1f1f', mb: 2 }}>
        المهارات
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {parsedSkills.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            sx={{
              bgcolor: '#f8f6f2',
              color: '#1f1f1f',
              border: '1px solid #e3ddd4',
              fontWeight: 700,
              borderRadius: '10px',
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileSkills;
