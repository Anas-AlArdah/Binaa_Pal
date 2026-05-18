import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import ReviewsRoundedIcon from '@mui/icons-material/ReviewsRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

const ProfileTrustBadges = ({ profile }) => {
  if (!profile) return null;

  const portfolioCount = profile.portfolio_items?.length || 0;
  const reviewCount = profile.reviews?.length || 0;
  const hasContact = Boolean(profile.user?.phone || profile.user?.location);
  const hasAvailability = profile.availability?.some((slot) => slot.is_available !== false);

  const badges = [
    {
      icon: VerifiedRoundedIcon,
      label: hasContact ? 'بيانات تواصل واضحة' : 'ملف عامل منشأ',
      active: hasContact,
    },
    {
      icon: PhotoLibraryRoundedIcon,
      label: portfolioCount > 0 ? `${portfolioCount} أعمال في المعرض` : 'بانتظار أعمال سابقة',
      active: portfolioCount > 0,
    },
    {
      icon: ReviewsRoundedIcon,
      label: reviewCount > 0 ? `${reviewCount} تقييمات من العملاء` : 'بانتظار أول تقييم',
      active: reviewCount > 0,
    },
    {
      icon: EventAvailableRoundedIcon,
      label: hasAvailability ? 'أوقات العمل محددة' : 'الأوقات غير محددة',
      active: hasAvailability,
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.8 }}>
        <AssignmentTurnedInRoundedIcon sx={{ color: '#5c7c43', fontSize: 22 }} />
        <Typography sx={{ color: '#1f1f1f', fontSize: '18px', fontWeight: 900 }}>
          مؤشرات الثقة
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gap: 1.2 }}>
        {badges.map((badge) => {
          const Icon = badge.icon;

          return (
            <Box
              key={badge.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                border: '1px solid',
                borderColor: badge.active ? '#c8e3d0' : '#e3ddd4',
                borderRadius: '14px',
                bgcolor: badge.active ? '#f2f8f3' : '#fbfaf8',
                p: 1.35,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  bgcolor: badge.active ? '#dfeee2' : '#f0ebe4',
                  color: badge.active ? '#3f6d3d' : '#736d65',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Icon sx={{ fontSize: 19 }} />
              </Box>
              <Typography sx={{ color: '#1f1f1f', fontSize: '14px', fontWeight: 800, lineHeight: 1.6 }}>
                {badge.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProfileTrustBadges;
