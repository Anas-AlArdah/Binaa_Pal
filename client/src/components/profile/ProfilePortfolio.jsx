import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const ProfilePortfolio = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2c2c2c', fontSize: '1.1rem', mb: 2 }}>
        معرض الأعمال
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={0}
            sx={{ 
              border: '1px solid #e8e0d0', 
              borderRadius: 2, 
              overflow: 'hidden',
              '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
            }}
          >
            <Box 
              sx={{ 
                height: 180, 
                bgcolor: '#eee', 
                backgroundImage: `url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
            />
            <Box sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#2c2c2c', mb: 0.5 }}>
                لوحة كهرباء رئيسية
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#888', fontSize: '0.7rem' }}>
                تأسيس وتركيب لوحة جديدة في الخليل
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePortfolio;
