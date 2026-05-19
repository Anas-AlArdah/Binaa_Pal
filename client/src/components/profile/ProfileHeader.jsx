import React from 'react';
import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
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

const ProfileHeader = ({ profile, onRequestService, onShowPortfolio }) => {
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
        gap: 4,
      }}
    >
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={heroImage || '/images/pf1.jpg'}
            alt={`${user.firstname} ${user.lastname}`}
            sx={{
              width: { xs: 110, sm: 140 },
              height: { xs: 110, sm: 140 },
              borderRadius: '24px',
              border: '2px solid #fff',
              boxShadow: '0 10px 25px rgba(26, 39, 68, 0.12)',
            }}
          />

        </Box>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>

            <Chip
              label={profile.major || 'عامل مهني'}
              size="small"
              sx={{
                bgcolor: '#fef3c7',
                color: '#d97706',
                border: '1px solid #fde68a',
                fontWeight: 800,
                fontFamily: 'Cairo, sans-serif'
              }}
            />
          </Stack>

          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '28px', sm: '34px' }, fontWeight: 900, color: '#0f172a', mb: 1, fontFamily: 'Cairo, sans-serif' }}>
            {user.firstname} {user.lastname}
            <VerifiedRoundedIcon sx={{ color: '#F59E0B', fontSize: { xs: '24px', sm: '28px' } }} titleAccess="صنايعي موثق" />
          </Typography>

          <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip
              icon={<LocationOnOutlinedIcon sx={{ fontSize: '18px !important', color: '#64748b' }} />}
              label={user.location || 'فلسطين'}
              sx={{ bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', fontWeight: 700, borderRadius: '12px', color: '#475569', fontFamily: 'Cairo, sans-serif' }}
            />
            <Chip
              icon={<PhoneOutlinedIcon sx={{ fontSize: '18px !important', color: '#64748b' }} />}
              label={user.phone || 'غير مضاف'}
              sx={{ bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', fontWeight: 700, borderRadius: '12px', color: '#475569', fontFamily: 'Cairo, sans-serif' }}
            />
            <Chip
              icon={<StarBorderRoundedIcon sx={{ fontSize: '18px !important', color: '#F59E0B' }} />}
              label={`${averageRating} (${reviewCount})`}
              sx={{ bgcolor: '#fffbeb', border: '1px solid #fef08a', fontWeight: 700, borderRadius: '12px', color: '#b45309', fontFamily: 'Cairo, sans-serif' }}
            />
          </Stack>

          <Typography sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '16px', maxWidth: 680, fontFamily: 'Cairo, sans-serif' }}>
            {profile.bio || 'لم يتم إضافة وصف مختصر لهذا العامل بعد.'}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          p: 3,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
          <WorkOutlineRoundedIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
          <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '18px', fontFamily: 'Cairo, sans-serif' }}>
            ملخص سريع
          </Typography>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
          {quickStats.map((item) => (
            <Box
              key={item.label}
            sx={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                p: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  background: '#f1f5f9'
                }
              }}
            >
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 700, mb: 0.6, fontFamily: 'Cairo, sans-serif' }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '15px', color: '#0f172a', fontWeight: 800, lineHeight: 1.5, fontFamily: 'Cairo, sans-serif' }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack spacing={1.5} sx={{ mt: 'auto' }}>
          {onRequestService && (
          <Button
            variant="contained"
            fullWidth
            onClick={onRequestService}
            sx={{
              bgcolor: '#1a2744',
              '&:hover': { bgcolor: '#0f172a', transform: 'translateY(-2px)' },
              borderRadius: '16px',
              py: 1.5,
              boxShadow: '0 10px 15px -3px rgba(26, 39, 68, 0.2)',
              fontWeight: 800,
              fontSize: '16px',
              fontFamily: 'Cairo, sans-serif',
              textTransform: 'none',
              transition: 'all 0.2s'
            }}
          >
            طلب خدمة مباشرة
          </Button>
          )}
          <Button
            variant="outlined"
            fullWidth
            onClick={onShowPortfolio}
            sx={{
              borderColor: '#e2e8f0',
              color: '#475569',
              borderRadius: '16px',
              py: 1.4,
              fontWeight: 700,
              fontSize: '15px',
              fontFamily: 'Cairo, sans-serif',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#cbd5e1',
                bgcolor: '#f8fafc',
                color: '#0f172a'
              }
            }}
          >
            عرض معرض الأعمال
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ProfileHeader;
