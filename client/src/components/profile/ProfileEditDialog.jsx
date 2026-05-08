import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { getApiErrorMessage } from '../../utils/api';
import {
  createEmptyPortfolioItem,
  normalizePortfolioItems,
  prepareImageFile,
} from '../../utils/workerProfile';

function buildInitialState(profile) {
  const portfolioItems = normalizePortfolioItems(profile?.portfolio_items || profile?.p_images);

  return {
    firstname: profile?.user?.firstname || '',
    lastname: profile?.user?.lastname || '',
    email: profile?.user?.email || '',
    phone: profile?.user?.phone || '',
    location: profile?.user?.location || '',
    bio: profile?.bio || '',
    major: profile?.major || '',
    min_price: profile?.min_price ?? '',
    max_price: profile?.max_price ?? '',
    profile_image: profile?.profile_image || '',
    skill_ids: Array.isArray(profile?.skill_ids) ? profile.skill_ids : [],
    portfolio_items: portfolioItems.length > 0 ? portfolioItems : [createEmptyPortfolioItem()],
  };
}

const ProfileEditDialog = ({ open, profile, availableSkills, saving, onClose, onSave }) => {
  const [form, setForm] = useState(() => buildInitialState(profile));
  const [submitError, setSubmitError] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [portfolioBusyIndex, setPortfolioBusyIndex] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(profile));
      setSubmitError('');
      setImageBusy(false);
      setPortfolioBusyIndex(null);
    }
  }, [open, profile]);

  const selectedSkills = useMemo(
    () =>
      availableSkills.filter((skill) =>
        Array.isArray(form.skill_ids) ? form.skill_ids.includes(skill.id) : false
      ),
    [availableSkills, form.skill_ids]
  );

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePortfolioItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      portfolio_items: current.portfolio_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setImageBusy(true);
      const image = await prepareImageFile(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.86,
      });
      updateField('profile_image', image);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'تعذر رفع صورة البروفايل.'));
    } finally {
      setImageBusy(false);
    }
  };

  const handlePortfolioImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setPortfolioBusyIndex(index);
      const image = await prepareImageFile(file, {
        maxWidth: 1400,
        maxHeight: 1400,
        quality: 0.84,
      });
      updatePortfolioItem(index, 'image', image);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'تعذر رفع صورة العمل.'));
    } finally {
      setPortfolioBusyIndex(null);
    }
  };

  const handleAddPortfolioItem = () => {
    setForm((current) => ({
      ...current,
      portfolio_items: [...current.portfolio_items, createEmptyPortfolioItem()],
    }));
  };

  const handleRemovePortfolioItem = (index) => {
    setForm((current) => {
      const nextItems = current.portfolio_items.filter((_, itemIndex) => itemIndex !== index);

      return {
        ...current,
        portfolio_items: nextItems.length > 0 ? nextItems : [createEmptyPortfolioItem()],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!form.firstname.trim() || !form.lastname.trim()) {
      setSubmitError('الاسم الأول واسم العائلة مطلوبان.');
      return;
    }

    const portfolioItems = form.portfolio_items
      .map((item) => ({
        ...item,
        title: item.title.trim(),
        description: item.description.trim(),
        tag: item.tag.trim(),
        image: item.image.trim(),
      }))
      .filter((item) => item.image);

    const payload = {
      bio: form.bio.trim(),
      major: form.major.trim(),
      min_price: form.min_price === '' ? null : Number(form.min_price),
      max_price: form.max_price === '' ? null : Number(form.max_price),
      profile_image: form.profile_image || null,
      portfolio_items: portfolioItems,
      skill_ids: form.skill_ids,
      user: {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
      },
    };

    try {
      await onSave(payload);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'تعذر حفظ التعديلات.'));
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="lg">
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
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#2d2a26' }}>
            تعديل بروفايل العامل
          </Typography>
          <Typography sx={{ color: '#6f685d', fontSize: '14px', mt: 0.5 }}>
            حدّث الصورة، النبذة، المهارات، ومعرض الأعمال من مكان واحد.
          </Typography>
        </Box>

        <IconButton onClick={onClose} disabled={saving}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
        <Box component="form" id="profile-edit-form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

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
                  border: '1px solid rgba(85, 107, 47, 0.14)',
                  background: 'linear-gradient(145deg, #faf8f3, #ffffff)',
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Avatar
                    src={form.profile_image || undefined}
                    sx={{
                      width: 136,
                      height: 136,
                      borderRadius: '28px',
                      boxShadow: '0 18px 40px rgba(66, 52, 32, 0.12)',
                    }}
                  />
                  <Typography sx={{ fontWeight: 700, color: '#2d2a26', textAlign: 'center' }}>
                    صورة البروفايل
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    disabled={imageBusy || saving}
                    startIcon={<AddPhotoAlternateRoundedIcon />}
                    sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}
                  >
                    {imageBusy ? 'جاري تجهيز الصورة...' : 'رفع صورة'}
                    <input type="file" accept="image/*" hidden onChange={handleProfileImageUpload} />
                  </Button>
                  <Button
                    color="inherit"
                    fullWidth
                    disabled={!form.profile_image || saving}
                    onClick={() => updateField('profile_image', '')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    إزالة الصورة
                  </Button>
                </Stack>
              </Box>

              <Stack spacing={2.2}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="الاسم الأول"
                    value={form.firstname}
                    onChange={(event) => updateField('firstname', event.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="اسم العائلة"
                    value={form.lastname}
                    onChange={(event) => updateField('lastname', event.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="البريد الإلكتروني"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    type="email"
                    fullWidth
                  />
                  <TextField
                    label="رقم الهاتف"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
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
                    placeholder="مثال: فني كهرباء وتشطيبات"
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
                  onChange={(_, values) => updateField('skill_ids', values.map((skill) => skill.id))}
                  getOptionLabel={(option) => option.skill_name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        label={option.skill_name}
                        sx={{ fontWeight: 700 }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="مهارات العامل"
                      placeholder="اختر من المهارات الموجودة"
                    />
                  )}
                />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="أقل سعر"
                    value={form.min_price}
                    onChange={(event) => updateField('min_price', event.target.value)}
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    fullWidth
                  />
                  <TextField
                    label="أعلى سعر"
                    value={form.max_price}
                    onChange={(event) => updateField('max_price', event.target.value)}
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    fullWidth
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#2d2a26' }}>
                    معرض الأعمال
                  </Typography>
                  <Typography sx={{ color: '#6f685d', fontSize: '14px' }}>
                    أضف صورًا لأعمالك مع عنوان ووصف مختصر لكل مشروع.
                  </Typography>
                </Box>
                <Button
                  onClick={handleAddPortfolioItem}
                  startIcon={<AddRoundedIcon />}
                  variant="outlined"
                  sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}
                >
                  إضافة عمل
                </Button>
              </Box>

              <Stack spacing={2}>
                {form.portfolio_items.map((item, index) => (
                  <Box
                    key={item.id || index}
                    sx={{
                      border: '1px solid rgba(85, 107, 47, 0.12)',
                      borderRadius: '22px',
                      p: 2.25,
                      background: '#fff',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            height: 180,
                            borderRadius: '18px',
                            bgcolor: '#f4f1ea',
                            border: '1px dashed rgba(85, 107, 47, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {item.image ? (
                            <Box
                              component="img"
                              src={item.image}
                              alt={item.title || `work-${index + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Stack spacing={1} alignItems="center" sx={{ color: '#8b826f', px: 2 }}>
                              <EditRoundedIcon />
                              <Typography sx={{ fontWeight: 700, textAlign: 'center', fontSize: '14px' }}>
                                ارفع صورة لهذا العمل
                              </Typography>
                            </Stack>
                          )}
                        </Box>

                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                          <Button
                            component="label"
                            variant="outlined"
                            startIcon={<AddPhotoAlternateRoundedIcon />}
                            disabled={portfolioBusyIndex === index || saving}
                            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}
                          >
                            {portfolioBusyIndex === index ? 'جاري تجهيز الصورة...' : 'رفع صورة'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(event) => handlePortfolioImageUpload(index, event)}
                            />
                          </Button>
                          <Button
                            color="inherit"
                            onClick={() => handleRemovePortfolioItem(index)}
                            startIcon={<DeleteOutlineRoundedIcon />}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            حذف هذا العمل
                          </Button>
                        </Stack>
                      </Box>

                      <Stack spacing={1.6}>
                        <TextField
                          label="عنوان العمل"
                          value={item.title}
                          onChange={(event) => updatePortfolioItem(index, 'title', event.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="رابط صورة العمل"
                          value={item.image}
                          onChange={(event) => updatePortfolioItem(index, 'image', event.target.value)}
                          placeholder="اتركه فارغًا إذا رفعت الصورة من الجهاز"
                          fullWidth
                        />
                        <TextField
                          label="نوع العمل أو الوسم"
                          value={item.tag}
                          onChange={(event) => updatePortfolioItem(index, 'tag', event.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="وصف العمل"
                          value={item.description}
                          onChange={(event) => updatePortfolioItem(index, 'description', event.target.value)}
                          multiline
                          minRows={4}
                          fullWidth
                        />
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none', fontWeight: 700 }}>
          إلغاء
        </Button>
        <Button
          type="submit"
          form="profile-edit-form"
          disabled={saving}
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          sx={{
            bgcolor: '#556b2f',
            '&:hover': { bgcolor: '#405123' },
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '14px',
            px: 3,
          }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditDialog;
