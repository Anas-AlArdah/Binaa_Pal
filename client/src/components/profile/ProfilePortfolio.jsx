import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { normalizePortfolioItems } from '../../utils/workerProfile';

const ProfilePortfolio = ({ portfolio }) => {
  const items = normalizePortfolioItems(portfolio).map((item, index) => ({
    title: item.title || `عمل رقم ${index + 1}`,
    caption: item.description || 'تمت إضافة هذا العمل ضمن معرض الإنجازات الخاصة بالعامل.',
    image: item.image,
    tag: item.tag || 'مشروع منفذ',
  }));

  if (items.length === 0) {
    return (
      <Box>
        <Typography variant="h5" sx={{ color: '#1f2933', fontWeight: 900, fontSize: '24px', mb: 1 }}>
          معرض الأعمال
        </Typography>
        <Typography sx={{ color: '#52606d', fontSize: '15px', lineHeight: 1.9 }}>
          لا توجد أعمال مضافة بعد. يمكن للعامل تعديل الصفحة وإضافة صور مع وصف بسيط لكل مشروع.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#1f1f1f', fontWeight: 900, fontSize: '24px', mb: 0.6 }}>
            معرض الأعمال
          </Typography>
          <Typography sx={{ color: '#736d65', fontSize: '14px', lineHeight: 1.8 }}>
            مجموعة من الصور والتفاصيل المختصرة للأعمال التي أضافها العامل إلى ملفه المهني.
          </Typography>
        </Box>
        <Typography sx={{ color: '#5c7c43', fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap' }}>
          {items.length} عناصر
        </Typography>
      </Box>

      <Grid container spacing={2.2}>
        {items.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box
              sx={{
                overflow: 'hidden',
                borderRadius: '18px',
                border: '1px solid #e3ddd4',
                bgcolor: '#fff',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  borderColor: '#d3c7b8',
                  boxShadow: '0 8px 20px rgba(66, 52, 32, 0.08)',
                },
              }}
            >
              <Box
                sx={{
                  height: 220,
                  backgroundImage: `url('${item.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderBottom: '1px solid #e3ddd4',
                }}
              />

              <Box sx={{ p: 2.2 }}>
                <Typography
                  sx={{
                    display: 'inline-flex',
                    bgcolor: '#f4efe8',
                    color: '#8f6b3f',
                    border: '1px solid #e3ddd4',
                    borderRadius: '999px',
                    px: 1.2,
                    py: 0.4,
                    fontSize: '11px',
                    fontWeight: 800,
                    mb: 1.2,
                  }}
                >
                  {item.tag}
                </Typography>

                <Typography sx={{ color: '#1f1f1f', fontWeight: 800, mb: 1, fontSize: '17px' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: '#736d65', lineHeight: 1.8, fontSize: '14px' }}>
                  {item.caption}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfilePortfolio;
