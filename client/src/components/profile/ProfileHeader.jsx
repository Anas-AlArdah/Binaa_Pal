import React from 'react';
import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { getFirstPortfolioImage } from '../../utils/workerProfile';

function formatPriceRange(profile) {
  if (profile?.min_price && profile?.max_price) {
    return `${profile.min_price} - ${profile.max_price} شيكل`;
  }

  if (profile?.min_price) {
    return `ابتداءً من ${profile.min_price} شيكل`;
  }

  if (profile?.max_price) {
    return `حتى ${profile.max_price} شيكل`;
  }

  return 'حسب الاتفاق';
}

const ProfileHeader = ({ profile }) => {
  if (!profile) return null;

  const { user } = profile;
  const heroImage = profile.profile_image || getFirstPortfolioImage(profile.portfolio_items || profile.p_images);
  const reviewCount = profile.reviews?.length || 0;
  const averageRating =
    reviewCount > 0
      ? (profile.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1)
      : 'جديد';

  const quickStats = [
    { label: 'التقييم', value: averageRating },
    { label: 'عدد المراجعات', value: reviewCount },
    { label: 'الانضمام', value: profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'حديثًا' },
    { label: 'نطاق السعر', value: formatPriceRange(profile) },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(280px, 360px)' },
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Avatar
          src={heroImage || '/images/pf1.jpg'}
          alt={`${user.firstname} ${user.lastname}`}
          sx={{
            width: { xs: 104, sm: 132 },
            height: { xs: 104, sm: 132 },
            borderRadius: '22px',
            border: '1px solid #d9d2c7',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
          }}
        />

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
            <Chip
              label="متاح للعمل"
              size="small"
              sx={{
                bgcolor: '#edf5ee',
                color: '#256d3f',
                border: '1px solid #c8e3d0',
                fontWeight: 800,
              }}
            />
            <Chip
              label={profile.major || 'عامل مهني'}
              size="small"
              sx={{
                bgcolor: '#f4efe8',
                color: '#8f6b3f',
                border: '1px solid #e3ddd4',
                fontWeight: 800,
              }}
            />
          </Stack>

          <Typography sx={{ fontSize: { xs: '28px', sm: '34px' }, fontWeight: 900, color: '#1f1f1f', mb: 1 }}>
            {user.firstname} {user.lastname}
          </Typography>

          <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip
              icon={<LocationOnOutlinedIcon sx={{ fontSize: '18px !important' }} />}
              label={user.location || 'فلسطين'}
              sx={{ bgcolor: '#f8f6f2', border: '1px solid #e3ddd4', fontWeight: 700, borderRadius: '12px' }}
            />
            <Chip
              icon={<PhoneOutlinedIcon sx={{ fontSize: '18px !important' }} />}
              label={user.phone || 'غير مضاف'}
              sx={{ bgcolor: '#f8f6f2', border: '1px solid #e3ddd4', fontWeight: 700, borderRadius: '12px' }}
            />
            <Chip
              icon={<StarBorderRoundedIcon sx={{ fontSize: '18px !important' }} />}
              label={`${averageRating} (${reviewCount})`}
              sx={{ bgcolor: '#fff8eb', border: '1px solid #ead8b3', fontWeight: 700, borderRadius: '12px' }}
            />
          </Stack>

          <Typography sx={{ color: '#736d65', lineHeight: 1.95, fontSize: '15.5px', maxWidth: 680 }}>
            {profile.bio || 'لم يتم إضافة وصف مختصر لهذا العامل بعد.'}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          background: '#fbfaf8',
          border: '1px solid #d9d2c7',
          borderRadius: '18px',
          p: 2.25,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <WorkOutlineRoundedIcon sx={{ color: '#5c7c43', fontSize: 22 }} />
          <Typography sx={{ color: '#1f1f1f', fontWeight: 900, fontSize: '18px' }}>
            ملخص سريع
          </Typography>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
          {quickStats.map((item) => (
            <Box
              key={item.label}
            sx={{
                border: '1px solid #e3ddd4',
                borderRadius: '14px',
                p: 1.5,
                bgcolor: '#fff',
              }}
            >
              <Typography sx={{ fontSize: '12px', color: '#736d65', fontWeight: 700, mb: 0.6 }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '15px', color: '#1f1f1f', fontWeight: 800, lineHeight: 1.5 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack spacing={1.2}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#5c7c43',
              '&:hover': { bgcolor: '#4d6a37' },
              borderRadius: '12px',
              py: 1.4,
              boxShadow: 'none',
              fontWeight: 800,
              textTransform: 'none',
            }}
          >
            طلب خدمة
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: '#e3ddd4',
              color: '#1f1f1f',
              borderRadius: '12px',
              py: 1.3,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            عرض الأعمال
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ProfileHeader;
