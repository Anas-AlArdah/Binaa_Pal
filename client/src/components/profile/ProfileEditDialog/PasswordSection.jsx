import React from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';

const PasswordSection = ({ form, updateField }) => (
    <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#2d2a26' }}>
            تغيير كلمة المرور
        </Typography>
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 2,
            }}
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
