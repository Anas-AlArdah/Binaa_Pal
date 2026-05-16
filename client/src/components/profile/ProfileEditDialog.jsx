import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Stack,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { getApiUrl } from '../../utils/api';
import AvailabilitySection from './ProfileEditDialog/AvailabilitySection';
import PasswordSection from './ProfileEditDialog/PasswordSection';
import PersonalInfoSection from './ProfileEditDialog/PersonalInfoSection';
import PortfolioSection from './ProfileEditDialog/PortfolioSection';
import ProfileEditDialogTitle from './ProfileEditDialog/ProfileEditDialogTitle';
import {
    DAY_MAP,
    buildAvailabilityForm,
    buildInitialForm,
    buildProfileFormPatch,
    createEmptyPortfolioItem,
    getProfileUserId,
    parseProjectMeta,
} from './ProfileEditDialog/profileEditDialogUtils';

const readJson = async (response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    return data;
};

const mapProjectsToPortfolioItems = (projects) =>
    Array.isArray(projects) && projects.length > 0
        ? projects.map((project) => {
            const meta = parseProjectMeta(project.description_p);
            const firstPhoto = project.photos?.[0];

            return {
                pro_id: project.pro_id,
                title: project.title_p || '',
                description: meta.description || '',
                tag: meta.tag || '',
                video: meta.video || '',
                image: firstPhoto?.image_url || '',
            };
        })
        : [createEmptyPortfolioItem()];

const ProfileEditDialog = ({
    open,
    profile,
    availableSkills = [],
    saving,
    onClose,
    onSave,
}) => {
    const [submitError, setSubmitError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [removedProjectIds, setRemovedProjectIds] = useState([]);
    const [removedAvailabilityIds, setRemovedAvailabilityIds] = useState([]);
    const [form, setForm] = useState(buildInitialForm);

    useEffect(() => {
        if (!open || !profile) return;

        const userId = getProfileUserId(profile);

        setSubmitError('');
        setRemovedProjectIds([]);
        setRemovedAvailabilityIds([]);
        setForm((current) => ({
            ...current,
            ...buildProfileFormPatch(profile),
        }));

        if (!userId) return;

        const loadBackendData = async () => {
            setLoadingData(true);
            try {
                const [projects, availability] = await Promise.all([
                    fetch(getApiUrl(`/api/projects/user/${userId}`)).then(readJson),
                    fetch(getApiUrl(`/api/availability/user/${userId}`)).then(readJson),
                ]);

                setForm((current) => ({
                    ...current,
                    portfolio_items: mapProjectsToPortfolioItems(projects),
                    availability: buildAvailabilityForm(availability),
                }));
            } catch (error) {
                console.error('تعذر تحميل البيانات:', error);
                setSubmitError('تعذر تحميل البيانات من السيرفر');
            } finally {
                setLoadingData(false);
            }
        };

        loadBackendData();
    }, [open, profile]);

    const selectedSkills = useMemo(
        () => availableSkills.filter((skill) => form.skill_ids.includes(skill.id)),
        [availableSkills, form.skill_ids]
    );

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const updatePortfolioItem = (index, field, value) => {
        setForm((current) => ({
            ...current,
            portfolio_items: current.portfolio_items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const updateAvailabilityField = (day, field, value) => {
        setForm((current) => ({
            ...current,
            availability: {
                ...current.availability,
                [day]: { ...(current.availability[day] || {}), [field]: value },
            },
        }));
    };

    const addPortfolioItem = () => {
        setForm((current) => ({
            ...current,
            portfolio_items: [...current.portfolio_items, createEmptyPortfolioItem()],
        }));
    };

    const removePortfolioItem = (index) => {
        setForm((current) => {
            const item = current.portfolio_items[index];

            if (item?.pro_id) {
                setRemovedProjectIds((ids) =>
                    ids.includes(item.pro_id) ? ids : [...ids, item.pro_id]
                );
            }

            return {
                ...current,
                portfolio_items: current.portfolio_items.filter((_, itemIndex) => itemIndex !== index),
            };
        });
    };

    const removeAvailabilityDay = (day) => {
        setForm((current) => {
            const availability = { ...current.availability };

            if (availability[day]?.av_id) {
                setRemovedAvailabilityIds((ids) =>
                    ids.includes(availability[day].av_id)
                        ? ids
                        : [...ids, availability[day].av_id]
                );
            }

            delete availability[day];
            return { ...current, availability };
        });
    };

    const savePortfolio = async (userId) => {
        for (const proId of removedProjectIds) {
            await fetch(getApiUrl(`/api/projects/${proId}`), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }).then(readJson);
        }

        for (const item of form.portfolio_items) {
            if (!item.title && !item.description && !item.image) continue;

            const description_p = JSON.stringify({
                description: item.description || '',
                tag: item.tag || '',
                video: item.video || '',
            });

            let proId = item.pro_id;

            if (proId) {
                await fetch(getApiUrl(`/api/projects/${proId}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title_p: item.title, description_p }),
                }).then(readJson);
            } else {
                const created = await fetch(getApiUrl('/api/projects'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        title_p: item.title,
                        description_p,
                    }),
                }).then(readJson);

                proId = created?.project?.pro_id;

                if (!proId) {
                    throw new Error('تم إنشاء المشروع لكن لم يرجع الباك رقم pro_id');
                }
            }

            if (item.image && proId) {
                await fetch(getApiUrl('/api/photos'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_url: item.image, pro_id: proId }),
                }).then(readJson);
            }
        }
    };

    const saveAvailability = async (userId) => {
        for (const avId of removedAvailabilityIds) {
            await fetch(getApiUrl(`/api/availability/${avId}`), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }).then(readJson);
        }

        for (const [arabicDay, times] of Object.entries(form.availability)) {
            const englishDay = DAY_MAP[arabicDay];

            if (!englishDay || !times.start_time || !times.end_time) continue;

            if (times.av_id) {
                await fetch(getApiUrl(`/api/availability/${times.av_id}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        start_time: times.start_time,
                        end_time: times.end_time,
                        is_available: true,
                    }),
                }).then(readJson);
            } else {
                await fetch(getApiUrl('/api/availability'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        day_of_week: englishDay,
                        start_time: times.start_time,
                        end_time: times.end_time,
                        is_available: true,
                    }),
                }).then(readJson);
            }
        }
    };

    const handleSubmit = async (event) => {
        event?.preventDefault();
        setSubmitError('');

        if (form.new_password && form.new_password !== form.confirm_password) {
            setSubmitError('كلمتا المرور غير متطابقتين');
            return;
        }

        const userId = getProfileUserId(profile);

        if (!userId) {
            setSubmitError('لم يتم العثور على معرف المستخدم');
            return;
        }

        setIsSaving(true);
        try {
            await savePortfolio(userId);
            await saveAvailability(userId);
            if (onSave) await onSave(form);
            onClose();
        } catch (error) {
            console.error('خطأ أثناء الحفظ:', error);
            setSubmitError(error.message || 'حدث خطأ أثناء الحفظ، حاول مجدداً');
        } finally {
            setIsSaving(false);
        }
    };

    const isLoading = isSaving || saving;

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : onClose}
            fullWidth
            maxWidth="lg"
        >
            <ProfileEditDialogTitle disabled={isLoading} onClose={onClose} />

            <DialogContent dividers sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
                {loadingData ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: 200,
                        }}
                    >
                        <CircularProgress sx={{ color: '#556b2f' }} />
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {submitError && <Alert severity="error">{submitError}</Alert>}

                            <PersonalInfoSection
                                availableSkills={availableSkills}
                                form={form}
                                selectedSkills={selectedSkills}
                                updateField={updateField}
                            />

                            <Divider />

                            <PasswordSection form={form} updateField={updateField} />

                            <Divider />

                            <AvailabilitySection
                                availability={form.availability}
                                removeAvailabilityDay={removeAvailabilityDay}
                                updateAvailabilityField={updateAvailabilityField}
                            />

                            <Divider />

                            <PortfolioSection
                                items={form.portfolio_items}
                                addPortfolioItem={addPortfolioItem}
                                removePortfolioItem={removePortfolioItem}
                                updatePortfolioItem={updatePortfolioItem}
                            />
                        </Stack>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    إلغاء
                </Button>

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || loadingData}
                    variant="contained"
                    startIcon={
                        isLoading
                            ? <CircularProgress size={18} color="inherit" />
                            : <SaveRoundedIcon />
                    }
                    sx={{
                        bgcolor: '#556b2f',
                        '&:hover': { bgcolor: '#405123' },
                        textTransform: 'none',
                        fontWeight: 800,
                        borderRadius: '14px',
                        px: 3,
                    }}
                >
                    {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileEditDialog;
