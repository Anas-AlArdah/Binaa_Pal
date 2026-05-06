import React from 'react';
import { Box, Typography, Button, Avatar, Stack, Chip, useTheme, useMediaQuery } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import VerifiedIcon from '@mui/icons-material/Verified';

const ProfileHeader = ({ profile }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!profile) return null;
  const { user } = profile;

  const averageRating = profile.reviews && profile.reviews.length > 0
    ? (profile.reviews.reduce((acc, curr) => acc + curr.rating, 0) / profile.reviews.length).toFixed(1)
    : 'جديد';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        gap: 4,
        p: { xs: 1, sm: 1 },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="flex-start">
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={user.image || "/images/pf1.jpg"}
            alt={`${user.firstname} ${user.lastname}`}
            sx={{
              width: { xs: 120, sm: 160 },
              height: { xs: 120, sm: 160 },
              border: '6px solid #fff',
              boxShadow: '0 15px 45px rgba(66, 52, 32, 0.12)',
              borderRadius: '32px',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              right: -8,
              bgcolor: '#fff',
              borderRadius: '50%',
              p: 0.5,
              display: 'flex',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <VerifiedIcon sx={{ color: '#556b2f', fontSize: 32 }} />
          </Box>
        </Box>

        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ color: '#2d2a26', fontWeight: 900, fontSize: { xs: '28px', sm: '38px' }, letterSpacing: '-0.02em' }}>
              {user.firstname} {user.lastname}
            </Typography>
            <Chip
              icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: '1rem !important', color: '#fff !important' }} />}
              label="حرفي موثّق ذهبي"
              sx={{
                bgcolor: '#556b2f',
                color: '#fff',
                fontWeight: 800,
                borderRadius: '12px',
                px: 1,
                height: 32,
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          </Stack>

          <Typography sx={{ color: '#556b2f', fontWeight: 800, mb: 2, fontSize: '20px', display: 'flex', alignItems: 'center', gap: 1 }}>
            {profile.major || 'حرفي مهني معتمد'}
          </Typography>

          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6f685d', bgcolor: '#f8f6f2', px: 2, py: 0.8, borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <LocationOnIcon sx={{ fontSize: '18px', color: '#c49e5c' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>{user.location || 'فلسطين'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6f685d', bgcolor: '#fdf8ef', px: 2, py: 0.8, borderRadius: '10px', border: '1px solid rgba(196, 158, 92, 0.2)' }}>
              <StarIcon sx={{ fontSize: '18px', color: '#c49e5c' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#2d2a26' }}>{averageRating}</Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>({profile.reviews?.length || 0} تقييم)</Typography>
            </Box>
          </Stack>

          <Typography sx={{ color: '#6f685d', maxWidth: 700, lineHeight: 1.9, fontSize: '16.5px', fontWeight: 500 }}>
            {profile.bio || 'لم يتم إضافة وصف بعد.'}
          </Typography>
        </Box>
      </Stack>


      <Stack spacing={2.5} sx={{ minWidth: { xs: '100%', md: 280 }, mt: { xs: 2, md: 0 } }}>
        <Box
          sx={{
            p: 3,
            borderRadius: '24px',
            border: '1px solid rgba(85, 107, 47, 0.15)',
            background: 'linear-gradient(145deg, #fdfaf5, #f5f8f2)',
            textAlign: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <Typography sx={{ color: '#556b2f', fontSize: '12px', fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            حالة العمل الحالية
          </Typography>
          <Typography sx={{ color: '#2d2a26', fontSize: '32px', fontWeight: 900, lineHeight: 1.1, mb: 1 }}>
            متاح الآن
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.5 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <Typography sx={{ color: '#6f685d', fontSize: '14px', fontWeight: 600 }}>
              جاهز للبدء فوراً
            </Typography>
          </Box>
        </Box>

        <Stack direction="column" spacing={1.5}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<PhoneRoundedIcon sx={{ ml: 1, mr: -0.5 }} />}
            sx={{
              bgcolor: '#556b2f',
              '&:hover': { bgcolor: '#405123', transform: 'translateY(-2px)' },
              borderRadius: '16px',
              py: 2,
              fontWeight: 800,
              fontSize: '17px',
              boxShadow: '0 10px 25px rgba(85, 107, 47, 0.2)',
              transition: 'all 0.3s ease',
              textTransform: 'none'
            }}
          >
            طلب خدمة مباشرة
          </Button>
          <Button 
            variant="outlined" 
            fullWidth
            sx={{
              borderColor: '#e3ddd4',
              color: '#2d2a26',
              '&:hover': { borderColor: '#556b2f', bgcolor: 'rgba(85, 107, 47, 0.04)' },
              borderRadius: '16px',
              py: 1.8,
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            مشاهدة جدول المواعيد
          </Button>
        </Stack>
      </Stack>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </Box>
  );
};

export default ProfileHeader;


