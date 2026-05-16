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
      <Box sx={{ p: 2, bgcolor: '#fff8eb', borderRadius: '12px', border: '1px solid #ead8b3' }}>
        <Typography sx={{ color: '#7b5d2f', fontSize: '14px', fontWeight: 600 }}>
          يجب عليك تسجيل الدخول لتتمكن من إضافة تقييم.
        </Typography>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('يرجى كتابة تعليق.');
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
      <Alert severity="success" sx={{ borderRadius: '12px' }}>
        تم إضافة تقييمك بنجاح! شكراً لك.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#1f1f1f' }}>
        أضف تقييمك
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 0.5, color: '#4c4a43' }}>
          التقييم العام
        </Typography>
        <Rating
          value={rating}
          onChange={(event, newValue) => setRating(newValue)}
          size="large"
          sx={{ color: '#c48b2d' }}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="اكتب تجربتك مع هذا العامل هنا..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: '#fff',
          }
        }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{
          bgcolor: '#5c7c43',
          '&:hover': { bgcolor: '#4d6a37' },
          borderRadius: '12px',
          px: 4,
          py: 1,
          fontWeight: 800,
          textTransform: 'none'
        }}
      >
        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'نشر التقييم'}
      </Button>
    </Box>
  );
};

export default AddReviewForm;
