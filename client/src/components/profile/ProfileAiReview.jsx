import React from 'react';
import { Box, Typography, Stack, LinearProgress } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

const metrics = [
  { label: 'الجودة', value: 94 },
  { label: 'الالتزام', value: 91 },
  { label: 'التواصل', value: 96 },
];

const ProfileAiReview = () => {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.4 }}>
        <AutoAwesomeRoundedIcon sx={{ color: '#b78d4f' }} />
        <Typography variant="h6" sx={{ color: '#26231e', fontWeight: 900 }}>
          ملخص الذكاء الاصطناعي
        </Typography>
      </Stack>

      <Typography sx={{ color: '#5f584f', lineHeight: 1.9, mb: 2 }}>
        هذا الملف يقدّم صورة احترافية وواضحة عن الحرفي. أبرز نقاط القوة هي وضوح التخصص، التقييم المرتفع، والاستجابة السريعة للطلبات.
      </Typography>

      <Stack spacing={1.2}>
        {metrics.map((metric) => (
          <Box key={metric.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: '#4f4a42', fontSize: '0.86rem', fontWeight: 700 }}>{metric.label}</Typography>
              <Typography sx={{ color: '#5d7340', fontSize: '0.82rem', fontWeight: 800 }}>{metric.value}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metric.value}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: '#efe7db',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #b78d4f 0%, #5d7340 100%)',
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileAiReview;
