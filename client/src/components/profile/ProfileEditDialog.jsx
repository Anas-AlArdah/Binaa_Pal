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
import { normalizePortfolioItems, prepareImageFile } from '../../utils/workerProfile';

const EMPTY_PORTFOLIO_ITEM = {
  title: '',
  image: '',
  tag: '',
  description: '',
  video: '',
};

const createEmptyPortfolioFormItem = () => ({ ...EMPTY_PORTFOLIO_ITEM });

const ProfileEditDialog = ({
                             open,
                             profile,
                             availableSkills,
                             saving,
                             onClose,
                             onSave,
                           }) => {
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    bio: '',
    major: '',
    min_price: '',
    max_price: '',
    profile_image: '',
    skill_ids: [],
    service_regions: [],
    current_password: '',
    new_password: '',
    confirm_password: '',
    availability: {},
    portfolio_items: [createEmptyPortfolioFormItem()],
  });

  useEffect(() => {
    if (profile) {
      const portfolioItems = normalizePortfolioItems(
          profile?.portfolio_items || profile?.p_images
      ).map((item) => ({
        ...EMPTY_PORTFOLIO_ITEM,
        ...item,
      }));

      setForm((prev) => ({
        ...prev,
        firstname: profile?.user?.firstname || '',
        lastname: profile?.user?.lastname || '',
        email: profile?.user?.email || '',
        phone: profile?.user?.phone || '',
        location: profile?.user?.location || '',
        bio: profile?.bio || '',
        major: profile?.major || '',
        min_price: profile?.min_price || '',
        max_price: profile?.max_price || '',
        profile_image: profile?.profile_image || '',
        skill_ids: Array.isArray(profile?.skill_ids)
            ? profile.skill_ids
            : [],
        portfolio_items:
            portfolioItems.length > 0
                ? portfolioItems
                : [createEmptyPortfolioFormItem()],
      }));
      setSubmitError('');
    }
  }, [profile]);

  const selectedSkills = useMemo(
      () =>
          availableSkills.filter((skill) =>
              form.skill_ids.includes(skill.id)
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
          itemIndex === index
              ? { ...item, [field]: value }
              : item
      ),
    }));
  };

  const handleAddPortfolioItem = () => {
    setForm((current) => ({
      ...current,
      portfolio_items: [
        ...current.portfolio_items,
        createEmptyPortfolioFormItem(),
      ],
    }));
  };

  const handleRemovePortfolioItem = (index) => {
    setForm((current) => ({
      ...current,
      portfolio_items: current.portfolio_items.filter(
          (_, i) => i !== index
      ),
    }));
  };

  const handleImageFileChange = async (event, onReady) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    try {
      const imageDataUrl = await prepareImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.78,
      });
      onReady(imageDataUrl);
      setSubmitError('');
    } catch (error) {
      setSubmitError(
          error instanceof Error
              ? error.message
              : 'Failed to prepare the selected image.'
      );
    }
  };

  const handleProfileImageChange = (event) =>
      handleImageFileChange(event, (imageDataUrl) => {
        updateField('profile_image', imageDataUrl);
      });

  const handlePortfolioImageChange = (index, event) =>
      handleImageFileChange(event, (imageDataUrl) => {
        updatePortfolioItem(index, 'image', imageDataUrl);
      });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
        form.new_password &&
        form.new_password !== form.confirm_password
    ) {
      setSubmitError('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      setSubmitError('');
      await onSave(form);
    } catch (error) {
      setSubmitError(
          error instanceof Error
              ? error.message
              : 'Failed to save the worker profile.'
      );
    }
  };

  return (
      <Dialog
          open={open}
          onClose={saving ? undefined : onClose}
          fullWidth
          maxWidth="lg"
      >
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
            <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: '#2d2a26',
                }}
            >
              تعديل بروفايل العامل
            </Typography>

            <Typography
                sx={{
                  color: '#6f685d',
                  fontSize: '14px',
                  mt: 0.5,
                }}
            >
              حدّث الصورة، النبذة، المهارات، ومعرض الأعمال من مكان واحد.
            </Typography>
          </Box>

          <IconButton
              onClick={onClose}
              disabled={saving}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
            dividers
            sx={{
              px: { xs: 2, md: 3 },
              py: 2.5,
            }}
        >
          <Box
              component="form"
              onSubmit={handleSubmit}
          >
            <Stack spacing={3}>
              {submitError && (
                  <Alert severity="error">
                    {submitError}
                  </Alert>
              )}

              <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: '220px 1fr',
                    },
                    gap: 3,
                    alignItems: 'start',
                  }}
              >
                <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '22px',
                      border:
                          '1px solid rgba(85, 107, 47, 0.14)',
                      background:
                          'linear-gradient(145deg, #faf8f3, #ffffff)',
                    }}
                >
                  <Stack
                      spacing={2}
                      alignItems="center"
                  >
                    <Avatar
                        src={form.profile_image}
                        sx={{
                          width: 136,
                          height: 136,
                          borderRadius: '28px',
                        }}
                    />

                    <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#2d2a26',
                        }}
                    >
                      صورة البروفايل
                    </Typography>

                    <Button
                        component="label"
                        variant="outlined"
                        fullWidth
                        startIcon={
                          <AddPhotoAlternateRoundedIcon />
                        }
                        sx={{
                          borderRadius: '14px',
                          textTransform: 'none',
                          fontWeight: 700,
                        }}
                    >
                      رفع صورة

                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          hidden
                      />
                    </Button>
                  </Stack>
                </Box>

                <Stack spacing={2.2}>
                  <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: '1fr 1fr',
                        },
                        gap: 2,
                      }}
                  >
                    <TextField
                        label="الاسم الأول"
                        value={form.firstname}
                        onChange={(e) =>
                            updateField(
                                'firstname',
                                e.target.value
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        label="اسم العائلة"
                        value={form.lastname}
                        onChange={(e) =>
                            updateField(
                                'lastname',
                                e.target.value
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        label="البريد الإلكتروني"
                        value={form.email}
                        onChange={(e) =>
                            updateField(
                                'email',
                                e.target.value
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        label="رقم الهاتف"
                        value={form.phone}
                        onChange={(e) =>
                            updateField(
                                'phone',
                                e.target.value
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        label="رقم الواتساب"
                        value={form.whatsapp}
                        onChange={(e) =>
                            updateField(
                                'whatsapp',
                                e.target.value
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        label="الموقع"
                        value={form.location}
                        onChange={(e) =>
                            updateField(
                                'location',
                                e.target.value
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        label="المسمى المهني"
                        value={form.major}
                        onChange={(e) =>
                            updateField(
                                'major',
                                e.target.value
                            )
                        }
                        fullWidth
                    />
                  </Box>

                  <TextField
                      label="نبذة تعريفية"
                      value={form.bio}
                      onChange={(e) =>
                          updateField(
                              'bio',
                              e.target.value
                          )
                      }
                      multiline
                      minRows={4}
                      fullWidth
                  />

                  <Autocomplete
                      multiple
                      options={availableSkills}
                      value={selectedSkills}
                      onChange={(_, values) =>
                          updateField(
                              'skill_ids',
                              values.map((v) => v.id)
                          )
                      }
                      getOptionLabel={(option) =>
                          option.skill_name
                      }
                      renderTags={(
                          value,
                          getTagProps
                      ) =>
                          value.map((option, index) => (
                              <Chip
                                  {...getTagProps({
                                    index,
                                  })}
                                  key={option.id}
                                  label={
                                    option.skill_name
                                  }
                              />
                          ))
                      }
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              label="المهارات"
                          />
                      )}
                  />

                  <Autocomplete
                      multiple
                      options={[
                        'نابلس',
                        'رام الله',
                        'جنين',
                        'الخليل',
                        'طولكرم',
                        'بيت لحم',
                      ]}
                      value={form.service_regions}
                      onChange={(_, values) =>
                          updateField(
                              'service_regions',
                              values
                          )
                      }
                      renderTags={(
                          value,
                          getTagProps
                      ) =>
                          value.map((option, index) => (
                              <Chip
                                  {...getTagProps({
                                    index,
                                  })}
                                  key={option}
                                  label={option}
                              />
                          ))
                      }
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              label="مناطق الخدمة"
                          />
                      )}
                  />

                  <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: '1fr 1fr',
                        },
                        gap: 2,
                      }}
                  >
                    <TextField
                        label="أقل سعر"
                        type="number"
                        value={form.min_price}
                        onChange={(e) =>
                            updateField(
                                'min_price',
                                e.target.value
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        label="أعلى سعر"
                        type="number"
                        value={form.max_price}
                        onChange={(e) =>
                            updateField(
                                'max_price',
                                e.target.value
                            )
                        }
                        fullWidth
                    />
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <Stack spacing={2}>
                <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: '#2d2a26',
                    }}
                >
                  تغيير كلمة المرور
                </Typography>

                <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr 1fr',
                      },
                      gap: 2,
                    }}
                >
                  <TextField
                      label="كلمة المرور الحالية"
                      type="password"
                      value={form.current_password}
                      onChange={(e) =>
                          updateField(
                              'current_password',
                              e.target.value
                          )
                      }
                      fullWidth
                  />

                  <TextField
                      label="كلمة المرور الجديدة"
                      type="password"
                      value={form.new_password}
                      onChange={(e) =>
                          updateField(
                              'new_password',
                              e.target.value
                          )
                      }
                      fullWidth
                  />

                  <TextField
                      label="تأكيد كلمة المرور"
                      type="password"
                      value={
                        form.confirm_password
                      }
                      onChange={(e) =>
                          updateField(
                              'confirm_password',
                              e.target.value
                          )
                      }
                      fullWidth
                  />
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={2}>
                <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: '#2d2a26',
                    }}
                >
                  جدول التوفر
                </Typography>

                {[
                  'الأحد',
                  'الإثنين',
                  'الثلاثاء',
                  'الأربعاء',
                  'الخميس',
                  'الجمعة',
                  'السبت',
                ].map((day) => (
                    <Box
                        key={day}
                        sx={{
                          border:
                              '1px solid #e3ddd4',
                          borderRadius: '16px',
                          p: 2,
                          bgcolor: '#fbfaf8',
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: '1fr',
                            md: '180px 1fr 1fr',
                          },
                          gap: 2,
                          alignItems: 'center',
                        }}
                    >
                      <Typography
                          sx={{
                            fontWeight: 800,
                            color: '#2d2a26',
                          }}
                      >
                        {day}
                      </Typography>

                      <TextField
                          type="time"
                          label="من"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          fullWidth
                      />

                      <TextField
                          type="time"
                          label="إلى"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          fullWidth
                      />
                    </Box>
                ))}
              </Stack>

              <Divider />

              <Stack spacing={2}>
                <Box
                    sx={{
                      display: 'flex',
                      justifyContent:
                          'space-between',
                      alignItems: 'center',
                    }}
                >
                  <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        color: '#2d2a26',
                      }}
                  >
                    معرض الأعمال
                  </Typography>

                  <Button
                      onClick={
                        handleAddPortfolioItem
                      }
                      startIcon={
                        <AddRoundedIcon />
                      }
                      variant="outlined"
                      sx={{
                        borderRadius: '14px',
                        textTransform: 'none',
                        fontWeight: 700,
                      }}
                  >
                    إضافة عمل
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {form.portfolio_items.map(
                      (item, index) => (
                          <Box
                              key={index}
                              sx={{
                                border:
                                    '1px solid rgba(85, 107, 47, 0.12)',
                                borderRadius:
                                    '22px',
                                p: 2.25,
                                background: '#fff',
                              }}
                          >
                            <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                      {
                                        xs: '1fr',
                                        md: '220px 1fr',
                                      },
                                  gap: 2,
                                }}
                            >
                              <Box>
                                <Box
                                    sx={{
                                      height: 180,
                                      borderRadius:
                                          '18px',
                                      bgcolor:
                                          '#f4f1ea',
                                      border:
                                          '1px dashed rgba(85, 107, 47, 0.2)',
                                      display:
                                          'flex',
                                      alignItems:
                                          'center',
                                      justifyContent:
                                          'center',
                                    }}
                                >
                                  {item.image ? (
                                      <img
                                          src={
                                            item.image
                                          }
                                          alt=""
                                          style={{
                                            width:
                                                '100%',
                                            height:
                                                '100%',
                                            objectFit:
                                                'cover',
                                            borderRadius:
                                                '18px',
                                          }}
                                      />
                                  ) : (
                                      <Stack
                                          spacing={1}
                                          alignItems="center"
                                      >
                                        <EditRoundedIcon />

                                        <Typography>
                                          ارفع صورة
                                        </Typography>
                                      </Stack>
                                  )}
                                </Box>

                                <Stack
                                    spacing={1}
                                    sx={{
                                      mt: 1.5,
                                    }}
                                >
                                  <Button
                                      component="label"
                                      variant="outlined"
                                      startIcon={
                                        <AddPhotoAlternateRoundedIcon />
                                      }
                                  >
                                    رفع صورة

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) =>
                                            handlePortfolioImageChange(
                                                index,
                                                event
                                            )
                                        }
                                        hidden
                                    />
                                  </Button>

                                  <Button
                                      component="label"
                                      variant="outlined"
                                      sx={{
                                        borderColor:
                                            '#556b2f',
                                        color:
                                            '#556b2f',
                                      }}
                                  >
                                    رفع فيديو

                                    <input
                                        type="file"
                                        accept="video/*"
                                        hidden
                                    />
                                  </Button>

                                  <Button
                                      color="inherit"
                                      onClick={() =>
                                          handleRemovePortfolioItem(
                                              index
                                          )
                                      }
                                      startIcon={
                                        <DeleteOutlineRoundedIcon />
                                      }
                                  >
                                    حذف العمل
                                  </Button>
                                </Stack>
                              </Box>

                              <Stack spacing={1.6}>
                                <TextField
                                    label="عنوان العمل"
                                    value={
                                      item.title
                                    }
                                    onChange={(e) =>
                                        updatePortfolioItem(
                                            index,
                                            'title',
                                            e.target
                                                .value
                                        )
                                    }
                                    fullWidth
                                />

                                <TextField
                                    label="رابط الصورة"
                                    value={
                                      item.image
                                    }
                                    onChange={(e) =>
                                        updatePortfolioItem(
                                            index,
                                            'image',
                                            e.target
                                                .value
                                        )
                                    }
                                    fullWidth
                                />

                                <TextField
                                    label="رابط الفيديو"
                                    value={
                                      item.video
                                    }
                                    onChange={(e) =>
                                        updatePortfolioItem(
                                            index,
                                            'video',
                                            e.target
                                                .value
                                        )
                                    }
                                    fullWidth
                                />

                                <TextField
                                    label="نوع العمل"
                                    value={
                                      item.tag
                                    }
                                    onChange={(e) =>
                                        updatePortfolioItem(
                                            index,
                                            'tag',
                                            e.target
                                                .value
                                        )
                                    }
                                    fullWidth
                                />

                                <TextField
                                    label="وصف العمل"
                                    value={
                                      item.description
                                    }
                                    onChange={(e) =>
                                        updatePortfolioItem(
                                            index,
                                            'description',
                                            e.target
                                                .value
                                        )
                                    }
                                    multiline
                                    minRows={4}
                                    fullWidth
                                />
                              </Stack>
                            </Box>
                          </Box>
                      )
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
            sx={{
              px: 3,
              py: 2,
            }}
        >
          <Button
              onClick={onClose}
              disabled={saving}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
              }}
          >
            إلغاء
          </Button>

          <Button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              sx={{
                bgcolor: '#556b2f',
                '&:hover': {
                  bgcolor: '#405123',
                },
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '14px',
                px: 3,
              }}
          >
            حفظ التعديلات
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ProfileEditDialog;
