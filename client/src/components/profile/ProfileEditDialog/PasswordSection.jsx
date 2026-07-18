import React from 'react';
import { Box, Stack, TextField } from '@mui/material';
import { FiLock } from 'react-icons/fi';

const PasswordSection = ({ form, updateField }) => (
    <Stack className="profile-edit-section" spacing={2}>
        <Box className="profile-edit-section__header">
            <span>
                <FiLock />
            </span>
            <div>
                <h3>تغيير كلمة المرور</h3>
                <p>اتركها فارغة إذا لا تريد تعديل كلمة المرور الآن.</p>
            </div>
            <b>اختياري</b>
        </Box>
        <Box
            className="profile-edit-three-grid"
        >
            <TextField
                label="كلمة المرور الحالية"
                type="password"
                value={form.current_password}
                onChange={(event) => updateField('current_password', event.target.value)}
                fullWidth
            />
            <TextField
                label="كلمة المرور الجديدة"
                type="password"
                value={form.new_password}
                onChange={(event) => updateField('new_password', event.target.value)}
                fullWidth
            />
            <TextField
                label="تأكيد كلمة المرور"
                type="password"
                value={form.confirm_password}
                onChange={(event) => updateField('confirm_password', event.target.value)}
                fullWidth
            />
        </Box>
    </Stack>
);

export default PasswordSection;
