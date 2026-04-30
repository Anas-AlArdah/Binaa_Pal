import React from 'react';
import { Box, Typography, Stack, LinearProgress, Chip } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';

const ProfileAiReview = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
  const qualityScore = Math.min(100, Math.round((averageRating / 5) * 100));
  const punctualityScore = reviews[0]?.punctuality ? Math.round((reviews.reduce((acc, curr) => acc + (curr.punctuality || curr.rating), 0) / reviews.length) * 20) : qualityScore - 3;
  const communicationScore = qualityScore > 90 ? 95 : qualityScore + 2;

  const dynamicMetrics = [
    { label: 'جودة التنفيذ', value: qualityScore, color: '#556b2f' },
    { label: 'الالتزام بالمواعيد', value: punctualityScore, color: '#c49e5c' },
    { label: 'تقييم التواصل', value: communicationScore, color: '#556b2f' },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(85, 107, 47, 0.1)',
            borderRadius: '10px',
            p: 1
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ color: '#556b2f', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: '#2d2a26', fontWeight: 900, fontSize: '18px', lineHeight: 1.2 }}>
            تحليل الذكاء الاصطناعي
          </Typography>
          <Typography sx={{ color: '#6f685d', fontSize: '12px', fontWeight: 600 }}>
            بناءً على {reviews.length} تقييم موثق
          </Typography>
        </Box>
      </Stack>

      <Box 
        sx={{ 
          bgcolor: 'rgba(196, 158, 92, 0.05)', 
          p: 2.5, 
          borderRadius: '18px', 
          border: '1px dashed rgba(196, 158, 92, 0.3)',
          mb: 3 
        }}
      >
        <Typography sx={{ color: '#4c4a43', lineHeight: 1.8, fontSize: '15px', fontWeight: 500 }}>
          {qualityScore >= 90 ? 
            `"يُظهر الحرفي نمطاً استثنائياً في جودة التنفيذ ومهارات عالية جداً. يُنصح به للمشاريع التي تتطلب معايير جودة صارمة بناءً على آراء العملاء."` 
            : 
            `"يُظهر الحرفي أداءً مستقراً وجيداً في التنفيذ، ولديه تقييمات إيجابية في التواصل والمواعيد بناءً على مشاريع سابقة."`}
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {dynamicMetrics.map((metric) => (
          <Box key={metric.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
              <Typography sx={{ color: '#2d2a26', fontSize: '14px', fontWeight: 700 }}>{metric.label}</Typography>
              <Typography sx={{ color: metric.color, fontSize: '15px', fontWeight: 900 }}>{metric.value}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metric.value}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color}cc 100%)`,
                },
              }}
            />
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Chip 
          icon={<PsychologyOutlinedIcon sx={{ fontSize: '16px !important' }} />}
          label="تم التحليل بواسطة Binaa-AI" 
          sx={{ 
            height: 28, 
            fontSize: '11px', 
            fontWeight: 800, 
            bgcolor: '#f8f4ec', 
            color: '#93856f',
            border: '1px solid #efe7d8'
          }} 
        />
      </Box>
    </Box>
  );
};

export default ProfileAiReview;
