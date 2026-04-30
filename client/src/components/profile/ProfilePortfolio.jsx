import React from 'react';
import { Box, Typography, Grid } from '@mui/material';


const ProfilePortfolio = ({ portfolio }) => {
  if (!portfolio) return null;

  const images = portfolio.split(',').filter(img => img.trim() !== '');
  if (images.length === 0) return null;

  const items = images.map((img, index) => ({
    title: index === 0 ? 'مشروع تم إنجازه' : `عمل فني ${index + 1}`,
    caption: 'تم التنفيذ بدقة عالية واهتمام بكافة التفاصيل التقنية والجمالية.',
    image: img.trim(),
    tag: index === 0 ? 'تركيب رئيسي' : 'صيانة'
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#2d2a26', fontWeight: 900, fontSize: '24px' }}>
            معرض الأعمال المختارة
          </Typography>
          <Typography sx={{ color: '#6f685d', fontSize: '14px', fontWeight: 500 }}>
            نماذج من مشاريع تم تنفيذها مؤخراً في مختلف المناطق
          </Typography>
        </Box>
        <Typography sx={{ color: '#556b2f', fontWeight: 800, cursor: 'pointer', fontSize: '14px', '&:hover': { textDecoration: 'underline' } }}>
          عرض الكل
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {items.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box
              sx={{
                overflow: 'hidden',
                borderRadius: '24px',
                border: '1px solid rgba(0,0,0,0.05)',
                bgcolor: '#fff',
                boxShadow: '0 10px 30px rgba(66, 52, 32, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(66, 52, 32, 0.12)',
                  '& .portfolio-img': { transform: 'scale(1.1)' }
                }
              }}
            >
              <Box sx={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                <Box
                  className="portfolio-img"
                  sx={{
                    height: '100%',
                    backgroundImage: `url('${item.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                  <Typography sx={{ bgcolor: 'rgba(255,255,255,0.9)', px: 1.5, py: 0.5, borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: '#556b2f', backdropFilter: 'blur(4px)' }}>
                    {item.tag}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography sx={{ color: '#2d2a26', fontWeight: 800, mb: 1, fontSize: '17px' }}>{item.title}</Typography>
                <Typography sx={{ color: '#6f685d', lineHeight: 1.6, fontSize: '14px' }}>{item.caption}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};


export default ProfilePortfolio;

