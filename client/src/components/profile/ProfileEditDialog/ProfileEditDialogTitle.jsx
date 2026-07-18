import React from 'react';
import { Box, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';

const ProfileEditDialogTitle = ({ disabled, onClose }) => (
    <DialogTitle
        className="profile-edit-dialog__title"
    >
        <Box className="profile-edit-dialog__title-copy">
            <span className="profile-edit-dialog__eyebrow">
                <ManageAccountsRoundedIcon />
                إدارة الملف المهني
            </span>
            <Typography variant="h5">
                تعديل بروفايل العامل
            </Typography>
            <Typography>
                حدّث الصورة، النبذة، المهارات، الأسعار، وأوقات العمل من مكان واحد.
            </Typography>
        </Box>
        <IconButton className="profile-edit-dialog__close" onClick={onClose} disabled={disabled} aria-label="إغلاق نافذة تعديل البروفايل">
            <CloseRoundedIcon />
        </IconButton>
    </DialogTitle>
);

export default ProfileEditDialogTitle;
