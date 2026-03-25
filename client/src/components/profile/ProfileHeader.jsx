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
        gap: 3,
        p: { xs: 1, sm: 1.5 },
      }}
    >
      <Stack direction="row" spacing={2.5} alignItems="flex-start">
        <Avatar
          src="/images/pf1.jpg"
          alt="مروان حداد"
          sx={{
            width: { xs: 84, sm: 104 },
            height: { xs: 84, sm: 104 },
            border: '3px solid #fff',
            boxShadow: '0 10px 24px rgba(89, 69, 39, 0.12)',
          }}
        />

        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
            <Typography variant="h4" sx={{ color: '#26231e', fontWeight: 900, lineHeight: 1.15 }}>
              مروان حداد
            </Typography>
            <Chip
              icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: '1rem !important' }} />}
              label="موثّق"
              sx={{
                bgcolor: '#eef4e7',
                color: '#4f6334',
                border: '1px solid #dce7cc',
                fontWeight: 800,
              }}
            />
          </Stack>

          <Typography sx={{ color: '#6f675d', fontWeight: 700, mb: 1.5 }}>
            كهربائي معتمد للمشاريع السكنية والتجارية وصيانة الأعطال الطارئة.
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.8 }}>
            <Chip icon={<LocationOnIcon />} label="الخليل" sx={{ bgcolor: '#fff', border: '1px solid #e7ddd0' }} />
            <Chip icon={<StarIcon />} label="4.9 من 5" sx={{ bgcolor: '#fff', border: '1px solid #e7ddd0' }} />
            <Chip icon={<PhoneRoundedIcon />} label="هاتف وواتساب" sx={{ bgcolor: '#fff', border: '1px solid #e7ddd0' }} />
          </Stack>

          <Typography sx={{ color: '#4f4a42', maxWidth: 620, lineHeight: 1.9 }}>
            متخصص في التمديدات ولوحات الكهرباء وكشف الأعطال، مع أسلوب عمل منظم وشرح واضح للتكلفة وخطوات التنفيذ قبل بدء الشغل.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1.2} sx={{ minWidth: { xs: '100%', md: 220 } }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            border: '1px solid #e7ddd0',
            bgcolor: '#fcf9f4',
          }}
        >
          <Typography sx={{ color: '#b78d4f', fontSize: '0.78rem', fontWeight: 800, mb: 0.5 }}>
            جاهزية اليوم
          </Typography>
          <Typography sx={{ color: '#26231e', fontSize: '1.9rem', fontWeight: 900, lineHeight: 1.1 }}>
            متاح
          </Typography>
          <Typography sx={{ color: '#6f675d', fontSize: '0.88rem', mt: 0.6 }}>
            إمكانية البدء خلال 24 ساعة
          </Typography>
        </Box>

        <Button variant="contained" className="btn-request-olive" fullWidth>
          اطلب هذا العامل
        </Button>
      </Stack>
    </Box>
  );
};

export default ProfileHeader;
