import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

const ServiceRequestDialog = ({
  fullName,
  onClose,
  onSubmit,
  open,
  requestError,
  requestSending,
}) => {
  const [serviceDescription, setServiceDescription] = useState('');

  useEffect(() => {
    if (open) {
      setServiceDescription('');
    }
  }, [open]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    onSubmit(serviceDescription);
  }, [onSubmit, serviceDescription]);

  return (
    <Dialog
      open={open}
      onClose={requestSending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: 'profile-service-dialog' }}
    >
      <Box component="form" onSubmit={handleSubmit} dir="rtl">
        <DialogTitle sx={{ fontWeight: 900, color: 'var(--pp-text)', fontFamily: 'Cairo, sans-serif' }}>
          طلب خدمة من {fullName}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <p className="profile-dialog-copy">
            اكتب وصفًا مختصرًا للخدمة المطلوبة، وسيصل الطلب للعامل مع بيانات التواصل الخاصة بك.
          </p>

          {requestError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {requestError}
            </Alert>
          )}

          <TextField
            autoFocus
            label="وصف الخدمة"
            value={serviceDescription}
            onChange={(event) => setServiceDescription(event.target.value)}
            multiline
            minRows={4}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            onClick={onClose}
            disabled={requestSending}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: 'Cairo, sans-serif' }}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={requestSending}
            sx={{
              bgcolor: '#1a2744',
              '&:hover': { bgcolor: '#0f172a' },
              borderRadius: '12px',
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 900,
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {requestSending ? 'جاري إرسال الطلب...' : 'إرسال الطلب'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default React.memo(ServiceRequestDialog);
