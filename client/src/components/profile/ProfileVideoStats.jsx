import React from 'react';
import { Box, Typography } from '@mui/material';

const ProfileVideoStats = () => {
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: { xs: '300px', md: '400px' },
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(90, 107, 53, 0.15)', // var(--primary-olive) shadow
        mt: 4,
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(90, 107, 53, 0.8) 0%, rgba(44, 44, 44, 0.4) 100%)', // mixing primary-olive and text-dark
          zIndex: 1
        }
      }}
    >
      {/* Assuming the video exists in this path as per original code */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src={`${process.env.PUBLIC_URL}/vedios/states.mp4`} type="video/mp4" />
      </video>
      
      <Box 
        sx={{ 
          position: 'relative', 
          zIndex: 2, 
          display: 'flex', 
          gap: { xs: 3, md: 8 },
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          px: 2
        }}
      >
        {[
          { number: '120+', label: 'مشاريع' },
          { number: '98%', label: 'عملاء سعداء' },
          { number: '24/7', label: 'دعم' }
        ].map((stat, index) => (
          <Box 
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: { xs: '20px 30px', md: '30px 40px' },
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                background: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                color: '#fff', 
                fontWeight: 800, 
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                fontFamily: "'Inter', 'Cairo', sans-serif"
              }}
            >
              {stat.number}
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#e8e0d0', // var(--border-color)
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                fontFamily: "'Inter', 'Cairo', sans-serif"
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProfileVideoStats;
