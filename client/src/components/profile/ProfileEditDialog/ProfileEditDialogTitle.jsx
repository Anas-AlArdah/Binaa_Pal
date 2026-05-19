import React from 'react';
import { Box, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const ProfileEditDialogTitle = ({ disabled, onClose }) => (
    <DialogTitle
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pb: 1.5,
        }}
    >
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
                تعديل بروفايل العامل
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '14px', mt: 0.5, fontFamily: 'Cairo, sans-serif' }}>
                حدّث الصورة، النبذة، المهارات، ومعرض الأعمال من مكان واحد.
            </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={disabled}>
            <CloseRoundedIcon />
        </IconButton>
    </DialogTitle>
);

export default ProfileEditDialogTitle;
