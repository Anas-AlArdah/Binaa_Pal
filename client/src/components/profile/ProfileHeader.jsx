import React from 'react';
import { Box, Typography, Button, Avatar, Stack, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

const ProfileHeader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        gap: 4,
        p: { xs: 1, sm: 2 },
      }}
    >
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Avatar
          src="/images/pf1.jpg"
          alt="مروان حداد"
          sx={{
            width: { xs: 100, sm: 130 },
            height: { xs: 100, sm: 130 },
            border: '4px solid #fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          }}
        />

        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1.5 }}>
            <Typography variant="h4" sx={{ color: '#1f1f1f', fontWeight: 800, fontSize: { xs: '24px', sm: '32px' } }}>
              مروان حداد
            </Typography>
            <Chip
              icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: '1rem !important', color: '#5c7c43 !important' }} />}
              label="حرفي موثّق"
              sx={{
                bgcolor: '#edf5ee',
                color: '#2f7a36',
                border: '1px solid #c9e2cd',
                fontWeight: 700,
                borderRadius: '8px',
              }}
            />
          </Stack>

          <Typography sx={{ color: '#5c7c43', fontWeight: 700, mb: 1.5, fontSize: '18px' }}>
            كهربائي معتمد للمشاريع السكنية والتجارية
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip 
              icon={<LocationOnIcon sx={{ fontSize: '14px !important' }} />} 
              label="الخليل، فلسطين" 
              sx={{ bgcolor: '#f8f6f2', border: '1px solid #e3ddd4', color: '#736d65' }} 
            />
            <Chip 
              icon={<StarIcon sx={{ fontSize: '14px !important', color: '#d59b1d !important' }} />} 
              label="4.9 (120 تقييم)" 
              sx={{ bgcolor: '#f8f6f2', border: '1px solid #e3ddd4', color: '#736d65' }} 
            />
          </Stack>

          <Typography sx={{ color: '#736d65', maxWidth: 650, lineHeight: 1.8, fontSize: '16px' }}>
            متخصص في التمديدات الكهربائية ولوحات التحكم وكشف الأعطال. أقدم حلولاً هندسية دقيقة مع ضمان الجودة والالتزام بالوقت المجدول.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2} sx={{ minWidth: { xs: '100%', md: 240 } }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #e3ddd4',
            bgcolor: '#fbf9f6',
            textAlign: 'center'
          }}
        >
          <Typography sx={{ color: '#736d65', fontSize: '13px', fontWeight: 700, mb: 0.5, textTransform: 'uppercase' }}>
            حالة التوفر
          </Typography>
          <Typography sx={{ color: '#2f7a36', fontSize: '28px', fontWeight: 800, lineHeight: 1.1 }}>
            متاح الآن
          </Typography>
          <Typography sx={{ color: '#736d65', fontSize: '14px', mt: 1 }}>
            جاهز للبدء خلال 24 ساعة
          </Typography>
        </Box>

        <Button 
          variant="contained" 
          fullWidth
          sx={{
            bgcolor: '#5c7c43',
            '&:hover': { bgcolor: '#4d6a37' },
            borderRadius: '12px',
            py: 1.5,
            fontWeight: 800,
            fontSize: '16px',
            boxShadow: 'none'
          }}
        >
          اطلب خدمة الآن
        </Button>
      </Stack>
    </Box>
  );
};

export default ProfileHeader;

