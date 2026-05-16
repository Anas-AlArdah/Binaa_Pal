import React from 'react';
import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Chip,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

const twoColumnGrid = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 2,
};

const PersonalInfoSection = ({
    availableSkills,
    form,
    selectedSkills,
    updateField,
}) => {
    return (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
            gap: 3,
            alignItems: 'start',
        }}
    >
        <Box
            sx={{
                p: 2.5,
                borderRadius: '22px',
                border: '1px solid rgba(85,107,47,0.14)',
                background: 'linear-gradient(145deg,#faf8f3,#ffffff)',
            }}
        >
            <Stack spacing={2} alignItems="center">
                <Avatar
                    src={form.profile_image}
                    sx={{ width: 136, height: 136, borderRadius: '28px' }}
                />
                <Typography sx={{ fontWeight: 700, color: '#2d2a26' }}>
                    صورة البروفايل
                </Typography>
                <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<AddPhotoAlternateRoundedIcon />}
                    sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}
                >
                    رفع صورة
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) updateField('profile_image', URL.createObjectURL(file));
                        }}
                    />
                </Button>
            </Stack>
        </Box>

        <Stack spacing={2.2}>
            <Box sx={twoColumnGrid}>
                <TextField
                    label="الاسم الأول"
                    value={form.firstname}
                    onChange={(event) => updateField('firstname', event.target.value)}
                    fullWidth
                />
                <TextField
                    label="اسم العائلة"
                    value={form.lastname}
                    onChange={(event) => updateField('lastname', event.target.value)}
                    fullWidth
                />
                <TextField
                    label="البريد الإلكتروني"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    fullWidth
                />
                <TextField
                    label="رقم الهاتف"
                    type="tel"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    value={form.phone}
                    onChange={(event) =>
                        updateField('phone', event.target.value.replace(/\D/g, ''))
                    }
                    fullWidth
                />
                <TextField
                    label="الموقع"
                    value={form.location}
                    onChange={(event) => updateField('location', event.target.value)}
                    fullWidth
                />
                <TextField
                    label="المسمى المهني"
                    value={form.major}
                    onChange={(event) => updateField('major', event.target.value)}
                    fullWidth
                />
            </Box>

            <TextField
                label="نبذة تعريفية"
                value={form.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                multiline
                minRows={4}
                fullWidth
            />

            <Autocomplete
                multiple
                options={availableSkills}
                value={selectedSkills}
                onChange={(_, values) => updateField('skill_ids', values.map((value) => value.id))}
                getOptionLabel={(option) => option.skill_name}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={option.id}
                            label={option.skill_name}
                        />
                    ))
                }
                renderInput={(params) => <TextField {...params} label="المهارات" />}
            />

            <Box sx={twoColumnGrid}>
                <TextField
                    label="أقل سعر"
                    type="number"
                    value={form.min_price}
                    onChange={(event) => updateField('min_price', event.target.value)}
                    fullWidth
                />
                <TextField
                    label="أعلى سعر"
                    type="number"
                    value={form.max_price}
                    onChange={(event) => updateField('max_price', event.target.value)}
                    fullWidth
                />
            </Box>
        </Stack>
    </Box>
    );
};

export default PersonalInfoSection;
