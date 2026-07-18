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
import { FiDollarSign, FiUser } from 'react-icons/fi';

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
    const updateSkillPrice = (skillId, field, value) => {
        updateField('skill_prices', {
            ...(form.skill_prices || {}),
            [skillId]: {
                ...(form.skill_prices?.[skillId] || {}),
                [field]: value,
            },
        });
    };

    return (
    <Box
        className="profile-edit-section profile-edit-section--personal"
    >
        <Box className="profile-edit-section__header">
            <span>
                <FiUser />
            </span>
            <div>
                <h3>المعلومات الأساسية</h3>
                <p>رتّب بياناتك، صورتك، وصنعتك حتى يظهر البروفايل بثقة للعميل.</p>
            </div>
        </Box>

        <Box
            className="profile-edit-personal-grid"
        >
            <Box className="profile-edit-avatar-card">
            <Stack spacing={2} alignItems="center">
                <Avatar
                    className="profile-edit-avatar"
                    src={form.profile_image}
                />
                <Typography className="profile-edit-avatar-card__title">
                    صورة البروفايل
                </Typography>
                <Typography className="profile-edit-avatar-card__hint">
                    صورة واضحة تساعد العميل يتعرف عليك بسرعة.
                </Typography>
                <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<AddPhotoAlternateRoundedIcon />}
                    className="profile-edit-upload-button"
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

            <Stack className="profile-edit-fields-panel" spacing={2.2}>
                <Box className="profile-edit-subhead">
                    <FiUser />
                    <span>بيانات التواصل</span>
                </Box>
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
                    label="الصنعة الأساسية"
                    value={form.major}
                    onChange={(event) => updateField('major', event.target.value)}
                    fullWidth
                    className="profile-edit-primary-craft-field"
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

                <Box className="profile-edit-primary-price-card">
                    <div className="profile-edit-primary-price-card__title">
                        <FiDollarSign />
                        <div>
                            <strong>نطاق سعر الصنعة الأساسية</strong>
                            <span>{form.major || 'الصنعة الأساسية'}</span>
                        </div>
                    </div>
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
                </Box>

                <Box className="profile-edit-field-block profile-edit-secondary-craft-block">
                    <label>الصنعة الثانوية</label>
                    <Autocomplete
                        multiple
                        className="profile-edit-autocomplete"
                        disablePortal
                        disableClearable
                        options={availableSkills}
                        value={selectedSkills}
                        onChange={(_, values) => updateField('skill_ids', values.map((value) => value.id))}
                        getOptionLabel={(option) => option.skill_name}
                        ListboxProps={{
                            className: 'profile-edit-autocomplete-listbox',
                            style: { maxHeight: 176, overflowY: 'auto' },
                        }}
                        slotProps={{
                            paper: {
                                className: 'profile-edit-autocomplete-paper',
                                style: { maxHeight: 194, overflow: 'hidden' },
                            },
                            popper: { className: 'profile-edit-autocomplete-popper' },
                            listbox: {
                                className: 'profile-edit-autocomplete-listbox',
                                style: { maxHeight: 176, overflowY: 'auto' },
                            },
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.id}
                                    label={option.skill_name}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label=""
                                placeholder={selectedSkills.length ? '' : 'اختر صنعة إضافية'}
                            />
                        )}
                    />
                </Box>

                {selectedSkills.length > 0 && (
                    <Box className="profile-edit-skill-prices">
                        <Box className="profile-edit-subhead">
                            <FiDollarSign />
                            <span>تسعيرة الصنعات الإضافية</span>
                        </Box>
                        <div className="profile-edit-skill-price-list">
                            {selectedSkills.map((skill) => {
                                const prices = form.skill_prices?.[skill.id] || {};

                                return (
                                    <div className="profile-edit-skill-price-card" key={skill.id}>
                                        <div className="profile-edit-skill-price-card__name">
                                            <strong>{skill.skill_name}</strong>
                                            <span>سعر هذه الصنعة</span>
                                        </div>
                                        <TextField
                                            label="أقل سعر"
                                            type="number"
                                            value={prices.min_price ?? ''}
                                            onChange={(event) => updateSkillPrice(skill.id, 'min_price', event.target.value)}
                                            fullWidth
                                        />
                                        <TextField
                                            label="أعلى سعر"
                                            type="number"
                                            value={prices.max_price ?? ''}
                                            onChange={(event) => updateSkillPrice(skill.id, 'max_price', event.target.value)}
                                            fullWidth
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </Box>
                )}
            </Stack>
        </Box>
    </Box>
    );
};

export default PersonalInfoSection;
