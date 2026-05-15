import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const ProfileSkills = ({ major, skills = [] }) => {
  const parsedSkills =
    Array.isArray(skills) && skills.length > 0
      ? skills.filter(Boolean)
      : String(major || '')
          .split(',')
          .map((skill) => skill.trim())
          .filter((skill) => skill);

  if (parsedSkills.length === 0) return null;

  // Function to generate a semi-random rating based on skill name length to keep it consistent
  const getSkillRating = (skillName) => {
    const minRating = 4.0;
    const maxRating = 5.0;
    const hash = skillName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = minRating + (hash % 11) / 10; 
    return rating.toFixed(1);
  };

  return (
    <Box>
      <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#1f1f1f', mb: 2 }}>
        المهارات
      </Typography>
      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
        {parsedSkills.map((skill) => (
          <Chip
            key={skill}
            icon={<StarRoundedIcon sx={{ color: '#f59e0b', fontSize: '18px !important' }} />}
            label={`${skill} (${getSkillRating(skill)})`}
            sx={{
              bgcolor: '#fcfbf9',
              color: '#1f1f1f',
              border: '1px solid #e3ddd4',
              fontWeight: 700,
              borderRadius: '10px',
              padding: '4px',
              '& .MuiChip-icon': {
                marginLeft: '4px',
                marginRight: '-4px'
              }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileSkills;
