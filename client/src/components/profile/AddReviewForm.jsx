import React, { useState } from 'react';
import { Box, Button, Rating, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { fetchJson } from '../../utils/api';

const AddReviewForm = ({ workerProfileId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('binaa_auth_user'));

  if (!user) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Typography sx={{ color: '#475569', fontSize: '15px', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
          يرجى تسجيل الدخول لتتمكن من إضافة تقييم ومشاركة تجربتك.
        </Typography>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('يرجى كتابة تعليق يوضح تجربتك.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newReview = await fetchJson('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: workerProfileId,
          user_id: user.id,
          rating,
          comment,
        }),
      });

      setSuccess(true);
      setComment('');
      setRating(5);
      if (onReviewAdded) onReviewAdded(newReview);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إضافة التقييم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert severity="success" sx={{ borderRadius: '16px', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>
        تم إضافة تقييمك بنجاح! شكراً لمساهمتك في مساعدة الآخرين.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, bgcolor: '#f8fafc', p: 4, borderRadius: '24px', border: '1px solid #e2e8f0' }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
        أضف تقييمك
      </Typography>
      <Typography sx={{ mb: 3, color: '#64748b', fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>
        شاركنا رأيك وتجربتك مع هذا الحرفي لمساعدة العملاء الآخرين في اختيار الأفضل.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontFamily: 'Cairo, sans-serif' }}>{error}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
          تقييمك العام:
        </Typography>
        <Rating
          value={rating}
          onChange={(event, newValue) => setRating(newValue)}
          size="large"
          sx={{ color: '#F59E0B' }}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="اكتب تفاصيل تجربتك وجودة العمل والالتزام بالوقت..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        variant="outlined"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            bgcolor: '#fff',
            fontFamily: 'Cairo, sans-serif',
            transition: 'all 0.3s',
            '&.Mui-focused': {
              boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.1)',
              borderColor: '#F59E0B'
            }
          }
        }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{
          bgcolor: '#1a2744',
          '&:hover': { bgcolor: '#0f172a', transform: 'translateY(-2px)' },
          borderRadius: '16px',
          px: 6,
          py: 1.5,
          fontWeight: 800,
          fontFamily: 'Cairo, sans-serif',
          textTransform: 'none',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(26, 39, 68, 0.15)',
          transition: 'all 0.2s'
        }}
      >
        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'نشر التقييم'}
      </Button>
    </Box>
  );
};

export default AddReviewForm;
