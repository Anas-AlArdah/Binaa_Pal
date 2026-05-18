import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';

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
    const rating = minRating + ((hash % 11) / 10) * (maxRating - minRating);
    return rating.toFixed(1);
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <BuildCircleOutlinedIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
        <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
          المهارات والخبرات
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
        {parsedSkills.map((skill) => (
          <Chip
            key={skill}
            icon={<StarRoundedIcon sx={{ color: '#F59E0B', fontSize: '18px !important' }} />}
            label={`${skill} (${getSkillRating(skill)})`}
            sx={{
              bgcolor: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              fontWeight: 700,
              borderRadius: '12px',
              padding: '6px',
              fontFamily: 'Cairo, sans-serif',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#f1f5f9',
                borderColor: '#cbd5e1',
                transform: 'translateY(-2px)'
              },
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
