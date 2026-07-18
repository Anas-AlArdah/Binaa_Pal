import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { fetchJson } from '../../utils/api';
import AvailabilitySection from './ProfileEditDialog/AvailabilitySection';
import PasswordSection from './ProfileEditDialog/PasswordSection';
import PersonalInfoSection from './ProfileEditDialog/PersonalInfoSection';
import PortfolioSection from './ProfileEditDialog/PortfolioSection';
import ProfileEditDialogTitle from './ProfileEditDialog/ProfileEditDialogTitle';
import {
    buildAvailabilityForm,
    buildAvailabilityPayload,
    buildInitialForm,
    buildProfileFormPatch,
    createEmptyPortfolioItem,
    getProfileUserId,
    getSkillIdFromCraftKey,
    PRIMARY_AVAILABILITY_KEY,
    parseProjectMeta,
} from './ProfileEditDialog/profileEditDialogUtils';
import './ProfileEditDialog/ProfileEditDialog.css';

const mapProjectsToPortfolioItems = (projects) =>
    Array.isArray(projects) && projects.length > 0
        ? projects.map((project) => {
            const meta = parseProjectMeta(project.description_p);
            const sortedPhotos = Array.isArray(project.photos)
                ? [...project.photos].sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    return dateB - dateA || (b.id || 0) - (a.id || 0);
                })
                : [];
            const firstPhoto = sortedPhotos[0];

            return {
                pro_id: project.pro_id,
                photo_id: firstPhoto?.id,
                title: project.title_p || '',
                description: meta.description || '',
                tag: meta.tag || '',
                video: meta.video || '',
                image: firstPhoto?.image_url || '',
            };
        })
        : [createEmptyPortfolioItem()];

const getAvailabilityRecordKey = (record) => {
    const skillId = record?.skill_id ?? record?.skill?.id ?? record?.Skill?.id;
    const numericSkillId = Number(skillId);
    const craftKey = Number.isInteger(numericSkillId) && numericSkillId > 0
        ? `skill-${numericSkillId}`
        : PRIMARY_AVAILABILITY_KEY;

    return `${craftKey}:${record?.day_of_week || ''}`;
};

const mergeAvailabilityRecords = (...recordLists) => {
    const recordsByKey = new Map();

    recordLists.forEach((records) => {
        (Array.isArray(records) ? records : []).forEach((record) => {
            const key = getAvailabilityRecordKey(record);

            if (!key.endsWith(':')) {
                recordsByKey.set(key, {
                    ...(recordsByKey.get(key) || {}),
                    ...record,
                    skill: record.skill || record.Skill || recordsByKey.get(key)?.skill,
                });
            }
        });
    });

    return Array.from(recordsByKey.values());
};

const buildAvailabilityBody = (userId, availability) => ({
    user_id: userId,
    skill_id: availability.skill_id ?? null,
    day_of_week: availability.day_of_week,
    start_time: availability.start_time,
    end_time: availability.end_time,
    is_available: availability.is_available,
});

const buildProfileSavePayload = (form, availabilityCrafts = []) => {
    const { availability, current_password, new_password, confirm_password, skill_prices, ...payload } = form;

    return {
        ...payload,
        availability: buildAvailabilityPayload(availability, availabilityCrafts),
        skill_prices: Object.entries(skill_prices || {}).map(([skillId, prices]) => ({
            skill_id: Number(skillId),
            min_price: prices?.min_price ?? '',
            max_price: prices?.max_price ?? '',
        })),
    };
};

const hasPriceValue = (value) =>
    value !== undefined && value !== null && String(value).trim() !== '';

const hasInvalidPriceRange = (minPrice, maxPrice) => {
    if (!hasPriceValue(minPrice) || !hasPriceValue(maxPrice)) return false;

    const min = Number(minPrice);
    const max = Number(maxPrice);

    return Number.isFinite(min) && Number.isFinite(max) && min >= max;
};

const getInvalidSkillPriceName = (form, availableSkills = []) => {
    const selectedSkillIds = new Set((form.skill_ids || []).map((skillId) => Number(skillId)));
    const skillNamesById = new Map(
        availableSkills.map((skill) => [Number(skill.id), skill.skill_name])
    );

    for (const [skillId, prices] of Object.entries(form.skill_prices || {})) {
        const numericSkillId = Number(skillId);

        if (!selectedSkillIds.has(numericSkillId)) continue;

        if (hasInvalidPriceRange(prices?.min_price, prices?.max_price)) {
            return skillNamesById.get(numericSkillId) || 'إحدى الصنعات الثانوية';
        }
    }

    return '';
};

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
    const [activeAvailabilityCraftKey, setActiveAvailabilityCraftKey] = useState(PRIMARY_AVAILABILITY_KEY);
    const [form, setForm] = useState(buildInitialForm);

    useEffect(() => {
        if (!open || typeof window === 'undefined') return undefined;

        const scrollY = window.scrollY;
        const { body, documentElement } = document;
        const previousBodyStyles = {
            overflow: body.style.overflow,
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            right: body.style.right,
            width: body.style.width,
        };
        const previousHtmlOverflow = documentElement.style.overflow;

        documentElement.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';

        return () => {
            documentElement.style.overflow = previousHtmlOverflow;
            body.style.overflow = previousBodyStyles.overflow;
            body.style.position = previousBodyStyles.position;
            body.style.top = previousBodyStyles.top;
            body.style.left = previousBodyStyles.left;
            body.style.right = previousBodyStyles.right;
            body.style.width = previousBodyStyles.width;
            window.scrollTo(0, scrollY);
        };
    }, [open]);

    useEffect(() => {
        if (!open || !profile) return;

        const userId = getProfileUserId(profile);

        setSubmitError('');
        setRemovedProjectIds([]);
        setActiveAvailabilityCraftKey(PRIMARY_AVAILABILITY_KEY);
        setForm((current) => ({
            ...current,
            ...buildProfileFormPatch(profile),
        }));

        if (!userId) return;

        const loadBackendData = async () => {
            setLoadingData(true);
            try {
                const [projects, availability] = await Promise.all([
                    fetchJson(`/api/projects/user/${userId}`),
                    fetchJson(`/api/availability/user/${userId}`, {
                        cache: 'no-store',
                    }).catch(() => profile.availability || []),
                ]);
                const mergedAvailability = mergeAvailabilityRecords(
                    profile.availability,
                    availability
                );

                setForm((current) => ({
                    ...current,
                    portfolio_items: mapProjectsToPortfolioItems(projects),
                    availability: buildAvailabilityForm(mergedAvailability),
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

    const filteredAvailableSkills = useMemo(() => {
        if (!form.major) return availableSkills;
        const majorTrimmed = form.major.trim().toLowerCase();
        return availableSkills.filter(
            (skill) => skill.skill_name.trim().toLowerCase() !== majorTrimmed
        );
    }, [availableSkills, form.major]);

    const selectedSkills = useMemo(() => {
        const selectedSkillIds = new Set((form.skill_ids || []).map((skillId) => Number(skillId)));
        return filteredAvailableSkills.filter((skill) => selectedSkillIds.has(Number(skill.id)));
    }, [filteredAvailableSkills, form.skill_ids]);

    const availabilityCrafts = useMemo(() => [
        {
            key: PRIMARY_AVAILABILITY_KEY,
            skill_id: null,
            label: form.major || 'الصنعة الأساسية',
            type: 'primary',
        },
        ...selectedSkills.map((skill) => ({
            key: `skill-${skill.id}`,
            skill_id: skill.id,
            label: skill.skill_name,
            type: 'secondary',
        })),
    ], [form.major, selectedSkills]);

    useEffect(() => {
        if (!availabilityCrafts.some((craft) => craft.key === activeAvailabilityCraftKey)) {
            setActiveAvailabilityCraftKey(PRIMARY_AVAILABILITY_KEY);
        }
    }, [activeAvailabilityCraftKey, availabilityCrafts]);

    const updateField = useCallback((field, value) => {
        setForm((current) => (
            current[field] === value ? current : { ...current, [field]: value }
        ));
    }, []);

    const updatePortfolioItem = useCallback((index, field, value) => {
        setForm((current) => {
            if (current.portfolio_items[index]?.[field] === value) {
                return current;
            }

            return {
                ...current,
                portfolio_items: current.portfolio_items.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, [field]: value } : item
                ),
            };
        });
    }, []);

    const getAvailabilityCraftMeta = useCallback((craftKey) => {
        const craft = availabilityCrafts.find((item) => item.key === craftKey);

        return {
            skill_id: craft?.skill_id ?? getSkillIdFromCraftKey(craftKey),
            skill_name: craft?.label || '',
        };
    }, [availabilityCrafts]);

    const updateAvailabilityField = useCallback((craftKey, day, field, value) => {
        setForm((current) => {
            if (current.availability[craftKey]?.[day]?.[field] === value) {
                return current;
            }

            const craftMeta = getAvailabilityCraftMeta(craftKey);

            return {
                ...current,
                availability: {
                    ...current.availability,
                    [craftKey]: {
                        ...(current.availability[craftKey] || {}),
                        [day]: {
                            ...(current.availability[craftKey]?.[day] || {}),
                            ...craftMeta,
                            [field]: value,
                        },
                    },
                },
            };
        });
    }, [getAvailabilityCraftMeta]);

    const activateAvailabilityDay = useCallback((craftKey, day) => {
        const craftMeta = getAvailabilityCraftMeta(craftKey);

        setForm((current) => {
            const currentDay = current.availability[craftKey]?.[day] || {};

            return {
                ...current,
                availability: {
                    ...current.availability,
                    [craftKey]: {
                        ...(current.availability[craftKey] || {}),
                        [day]: {
                            ...currentDay,
                            ...craftMeta,
                            start_time: currentDay.start_time || '08:00',
                            end_time: currentDay.end_time || '17:00',
                        },
                    },
                },
            };
        });
    }, [getAvailabilityCraftMeta]);

    const addPortfolioItem = useCallback(() => {
        setForm((current) => ({
            ...current,
            portfolio_items: [...current.portfolio_items, createEmptyPortfolioItem()],
        }));
    }, []);

    const removePortfolioItem = useCallback((index) => {
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
    }, []);

    const removeAvailabilityDay = useCallback((craftKey, day) => {
        setForm((current) => {
            const availability = { ...current.availability };
            const craftAvailability = { ...(availability[craftKey] || {}) };

            if (!craftAvailability[day]) {
                return current;
            }

            delete craftAvailability[day];

            if (Object.keys(craftAvailability).length > 0) {
                availability[craftKey] = craftAvailability;
            } else {
                delete availability[craftKey];
            }

            return { ...current, availability };
        });
    }, []);

    const savePortfolio = async (userId) => {
        for (const proId of removedProjectIds) {
            await fetchJson(`/api/projects/${proId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
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
                await fetchJson(`/api/projects/${proId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title_p: item.title, description_p }),
                });
            } else {
                const created = await fetchJson('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        title_p: item.title,
                        description_p,
                    }),
                });

                proId = created?.project?.pro_id;

                if (!proId) {
                    throw new Error('تم إنشاء المشروع لكن لم يرجع الباك رقم pro_id');
                }
            }

            if (item.image && proId) {
                const photoPath = item.photo_id
                    ? `/api/photos/${item.photo_id}`
                    : '/api/photos';
                const savedPhoto = await fetchJson(photoPath, {
                    method: item.photo_id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_url: item.image, pro_id: proId }),
                });

                if (!item.photo_id && savedPhoto?.photo?.id) {
                    item.photo_id = savedPhoto.photo.id;
                }
            }
        }
    };

    const saveAvailability = async (userId) => {
        const desiredRecords = buildAvailabilityPayload(form.availability, availabilityCrafts);
        const desiredKeys = new Set(desiredRecords.map(getAvailabilityRecordKey));
        const currentRecords = await fetchJson(`/api/availability/user/${userId}`, {
            cache: 'no-store',
        }).catch(() => profile.availability || []);
        const currentRecordsByKey = new Map(
            (Array.isArray(currentRecords) ? currentRecords : [])
                .map((record) => [getAvailabilityRecordKey(record), record])
        );

        for (const record of Array.isArray(currentRecords) ? currentRecords : []) {
            const recordKey = getAvailabilityRecordKey(record);

            if (record.av_id && !desiredKeys.has(recordKey)) {
                await fetchJson(`/api/availability/${record.av_id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        for (const availability of desiredRecords) {
            const existingRecord = currentRecordsByKey.get(getAvailabilityRecordKey(availability));
            const requestBody = buildAvailabilityBody(userId, availability);

            if (existingRecord?.av_id) {
                await fetchJson(`/api/availability/${existingRecord.av_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
            } else {
                await fetchJson('/api/availability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
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

        if (hasInvalidPriceRange(form.min_price, form.max_price)) {
            setSubmitError('أعلى سعر للصنعة الأساسية لازم يكون أكبر من أقل سعر.');
            return;
        }

        const invalidSkillName = getInvalidSkillPriceName(form, availableSkills);

        if (invalidSkillName) {
            setSubmitError(`أعلى سعر في ${invalidSkillName} لازم يكون أكبر من أقل سعر.`);
            return;
        }

        const userId = getProfileUserId(profile);

        if (!userId) {
            setSubmitError('لم يتم العثور على معرف المستخدم');
            return;
        }

        setIsSaving(true);
        try {
            const profilePayload = buildProfileSavePayload(form, availabilityCrafts);

            await savePortfolio(userId);
            await saveAvailability(userId);
            if (onSave) await onSave(profilePayload);
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
            PaperProps={{
                dir: 'rtl',
                className: 'profile-edit-dialog',
                sx: {
                    borderRadius: { xs: '20px', md: '28px' },
                    width: 'min(1180px, calc(100% - 22px))',
                    maxHeight: 'calc(100dvh - 28px)',
                },
            }}
        >
            <ProfileEditDialogTitle disabled={isLoading} onClose={onClose} />

            <DialogContent
                dividers
                className="profile-edit-dialog__content"
                onWheel={(event) => event.stopPropagation()}
                onTouchMove={(event) => event.stopPropagation()}
            >
                {loadingData ? (
                    <Box
                        className="profile-edit-dialog__loading"
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                        <Box className="profile-edit-dialog__body">
                            {submitError && <Alert severity="error">{submitError}</Alert>}

                            <PersonalInfoSection
                                availableSkills={filteredAvailableSkills}
                                form={form}
                                selectedSkills={selectedSkills}
                                updateField={updateField}
                            />

                            <PasswordSection
                                confirmPassword={form.confirm_password}
                                currentPassword={form.current_password}
                                newPassword={form.new_password}
                                updateField={updateField}
                            />

                            <AvailabilitySection
                                availability={form.availability}
                                activateAvailabilityDay={activateAvailabilityDay}
                                activeCraftKey={activeAvailabilityCraftKey}
                                crafts={availabilityCrafts}
                                removeAvailabilityDay={removeAvailabilityDay}
                                setActiveCraftKey={setActiveAvailabilityCraftKey}
                                updateAvailabilityField={updateAvailabilityField}
                            />

                            <PortfolioSection
                                items={form.portfolio_items}
                                addPortfolioItem={addPortfolioItem}
                                removePortfolioItem={removePortfolioItem}
                                updatePortfolioItem={updatePortfolioItem}
                                onError={setSubmitError}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions className="profile-edit-dialog__actions">
                <Button
                    onClick={onClose}
                    disabled={isLoading}
                    className="profile-edit-cancel-btn"
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
                    className="profile-edit-save-btn"
                >
                    {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileEditDialog;
