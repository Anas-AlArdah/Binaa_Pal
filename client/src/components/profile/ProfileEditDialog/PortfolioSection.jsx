import React, { useEffect, useRef } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { FiBriefcase } from 'react-icons/fi';
import { prepareImageFile } from '../../../utils/workerProfile';

const PortfolioSection = ({
    items,
    addPortfolioItem,
    removePortfolioItem,
    updatePortfolioItem,
    onError,
}) => {
    const temporaryVideoUrlsRef = useRef(new Set());

    useEffect(() => () => {
        temporaryVideoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        temporaryVideoUrlsRef.current.clear();
    }, []);

    const handleImageUpload = async (event, index) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        try {
            const imageDataUrl = await prepareImageFile(file, {
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.78,
            });
            updatePortfolioItem(index, 'image', imageDataUrl);
        } catch (error) {
            console.error('Project image upload error:', error);
            onError?.('تعذر تجهيز صورة المشروع للحفظ');
        }
    };

    const handleVideoUpload = (event, index, previousVideo) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        if (String(previousVideo || '').startsWith('blob:')) {
            URL.revokeObjectURL(previousVideo);
            temporaryVideoUrlsRef.current.delete(previousVideo);
        }

        const videoUrl = URL.createObjectURL(file);
        temporaryVideoUrlsRef.current.add(videoUrl);
        updatePortfolioItem(index, 'video', videoUrl);
    };

    return (
    <Stack className="profile-edit-section" spacing={2}>
        <Box className="profile-edit-section__header profile-edit-section__header--action">
            <span>
                <FiBriefcase />
            </span>
            <div>
                <h3>معرض الأعمال</h3>
                <p>أضف أفضل الأعمال السابقة حتى يرى العميل جودة شغلك قبل التواصل.</p>
            </div>
            <Button
                onClick={addPortfolioItem}
                startIcon={<AddRoundedIcon />}
                variant="outlined"
                className="profile-edit-add-btn"
            >
                إضافة عمل
            </Button>
        </Box>

        <Stack className="profile-edit-portfolio-list" spacing={2}>
            {items.map((item, index) => (
                <Box
                    key={item.pro_id ?? `new-${index}`}
                    className="profile-edit-portfolio-card"
                >
                    <Box
                        className="profile-edit-portfolio-grid"
                    >
                        <Box className="profile-edit-portfolio-media">
                            <Box
                                className="profile-edit-portfolio-preview"
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt=""
                                        decoding="async"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '18px',
                                        }}
                                    />
                                ) : (
                                    <Stack spacing={1} alignItems="center">
                                        <EditRoundedIcon />
                                        <Typography>ارفع صورة</Typography>
                                    </Stack>
                                )}
                            </Box>

                            <Stack className="profile-edit-portfolio-actions" spacing={1}>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<AddPhotoAlternateRoundedIcon />}
                                    className="profile-edit-upload-button"
                                >
                                    رفع صورة
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(event) => handleImageUpload(event, index)}
                                    />
                                </Button>

                                <Button
                                    component="label"
                                    variant="outlined"
                                    className="profile-edit-secondary-upload"
                                >
                                    رفع فيديو
                                    <input
                                        type="file"
                                        accept="video/*"
                                        hidden
                                        onChange={(event) => handleVideoUpload(event, index, item.video)}
                                    />
                                </Button>

                                <Button
                                    color="inherit"
                                    onClick={() => removePortfolioItem(index)}
                                    startIcon={<DeleteOutlineRoundedIcon />}
                                    className="profile-edit-delete-btn"
                                >
                                    حذف العمل
                                </Button>
                            </Stack>
                        </Box>

                        <Stack className="profile-edit-portfolio-fields" spacing={1.6}>
                            <TextField
                                label="عنوان العمل"
                                value={item.title}
                                onChange={(event) =>
                                    updatePortfolioItem(index, 'title', event.target.value)
                                }
                                fullWidth
                            />
                            <TextField
                                label="رابط الصورة (URL)"
                                value={item.image}
                                onChange={(event) =>
                                    updatePortfolioItem(index, 'image', event.target.value)
                                }
                                fullWidth
                            />
                            <TextField
                                label="رابط الفيديو (URL)"
                                value={item.video}
                                onChange={(event) =>
                                    updatePortfolioItem(index, 'video', event.target.value)
                                }
                                fullWidth
                            />
                            <TextField
                                label="نوع العمل"
                                value={item.tag}
                                onChange={(event) =>
                                    updatePortfolioItem(index, 'tag', event.target.value)
                                }
                                fullWidth
                            />
                            <TextField
                                label="وصف العمل"
                                value={item.description}
                                onChange={(event) =>
                                    updatePortfolioItem(index, 'description', event.target.value)
                                }
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
    );
};

export default React.memo(PortfolioSection);
