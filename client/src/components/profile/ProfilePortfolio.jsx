import React from 'react';
import { Box, Grid, Typography, Card, CardMedia, CardContent, Chip } from '@mui/material';
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
        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 900, fontSize: '24px', mb: 1, fontFamily: 'Cairo, sans-serif' }}>
          معرض الأعمال
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '15px', lineHeight: 1.9, fontFamily: 'Cairo, sans-serif' }}>
          لا توجد أعمال مضافة بعد. يمكن للعامل تعديل الصفحة وإضافة صور مع وصف بسيط لكل مشروع.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 900, fontSize: '24px', mb: 0.6, fontFamily: 'Cairo, sans-serif' }}>
            معرض الأعمال
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '14px', lineHeight: 1.8, fontFamily: 'Cairo, sans-serif' }}>
            مجموعة من الصور والتفاصيل المختصرة للأعمال التي أضافها العامل إلى ملفه المهني.
          </Typography>
        </Box>
        <Typography sx={{ color: '#F59E0B', fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap', fontFamily: 'Cairo, sans-serif' }}>
          {items.length} عناصر
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {items.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                bgcolor: '#fff',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 25px -5px rgba(26, 39, 68, 0.1)',
                },
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 220,
                  backgroundImage: `url('${item.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderBottom: '1px solid #e2e8f0',
                }}
              />

              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 1.5 }}>
                  <Chip 
                    label={item.tag} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#f1f5f9', 
                      color: '#475569', 
                      fontWeight: 700, 
                      fontSize: '12px',
                      fontFamily: 'Cairo, sans-serif'
                    }} 
                  />
                </Box>

                <Typography sx={{ color: '#0f172a', fontWeight: 800, mb: 1.5, fontSize: '18px', fontFamily: 'Cairo, sans-serif' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>
                  {item.caption}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfilePortfolio;
