import React from 'react';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';

const ProfileCompletionCard = ({ profile, onEdit }) => {
  if (!profile) return null;

  const checks = [
    {
      label: 'نبذة شخصية',
      complete: Boolean(profile.bio?.trim()),
      icon: BadgeRoundedIcon,
    },
    {
      label: 'صورة البروفايل',
      complete: Boolean(profile.profile_image),
      icon: AddPhotoAlternateRoundedIcon,
    },
    {
      label: 'المهارة الرئيسية',
      complete: Boolean(profile.major || profile.skill_names?.length),
      icon: HandymanRoundedIcon,
    },
    {
      label: 'نطاق السعر',
      complete: Boolean(profile.min_price || profile.max_price),
      icon: PaymentsRoundedIcon,
    },
    {
      label: 'أعمال سابقة',
      complete: Boolean(profile.portfolio_items?.length),
      icon: WorkHistoryRoundedIcon,
    },
    {
      label: 'بيانات التواصل',
      complete: Boolean(profile.user?.phone || profile.user?.location),
      icon: PhoneInTalkRoundedIcon,
    },
    {
      label: 'أوقات التوفر',
      complete: Boolean(profile.availability?.length),
      icon: CalendarMonthRoundedIcon,
    },
  ];

  const completedCount = checks.filter((check) => check.complete).length;
  const completion = Math.round((completedCount / checks.length) * 100);
  const remaining = checks.filter((check) => !check.complete).slice(0, 3);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.6 }}>
        <Typography sx={{ color: '#1f1f1f', fontSize: '18px', fontWeight: 900 }}>
          اكتمال البروفايل
        </Typography>
        <Typography sx={{ color: '#5c7c43', fontSize: '20px', fontWeight: 900 }}>
          {completion}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={completion}
        sx={{
          height: 10,
          borderRadius: 999,
          bgcolor: '#e9e3db',
          mb: 2,
          '& .MuiLinearProgress-bar': {
            bgcolor: '#5c7c43',
            borderRadius: 999,
          },
        }}
      />

      <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
        {(remaining.length > 0 ? remaining : checks.slice(0, 3)).map((item) => {
          const Icon = item.icon;

          return (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: item.complete ? '#3f6d3d' : '#736d65',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              <span>{item.complete ? `${item.label} مكتمل` : `أضف ${item.label}`}</span>
            </Box>
          );
        })}
      </Box>

      <Button
        type="button"
        fullWidth
        variant="outlined"
        startIcon={<EditRoundedIcon />}
        onClick={onEdit}
        sx={{
          borderColor: '#d3c7b8',
          color: '#1f1f1f',
          borderRadius: '12px',
          py: 1.2,
          fontWeight: 800,
          textTransform: 'none',
          '&:hover': {
            borderColor: '#5c7c43',
            bgcolor: '#f2f8f3',
          },
        }}
      >
        تحديث البروفايل
      </Button>
    </Box>
  );
};

export default ProfileCompletionCard;
