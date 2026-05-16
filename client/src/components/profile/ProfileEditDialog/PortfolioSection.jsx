import React from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { prepareImageFile } from '../../../utils/workerProfile';

const PortfolioSection = ({
    items,
    addPortfolioItem,
    removePortfolioItem,
    updatePortfolioItem,
    onError,
}) => {
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

    return (
    <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#2d2a26' }}>
                معرض الأعمال
            </Typography>
            <Button
                onClick={addPortfolioItem}
                startIcon={<AddRoundedIcon />}
                variant="outlined"
                sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}
            >
                إضافة عمل
            </Button>
        </Box>

        <Stack spacing={2}>
            {items.map((item, index) => (
                <Box
                    key={item.pro_id ?? `new-${index}`}
                    sx={{
                        border: '1px solid rgba(85,107,47,0.12)',
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
                                    width: '100%',
                                    height: 180,
                                    borderRadius: '18px',
                                    bgcolor: '#f4f1ea',
                                    border: '1px dashed rgba(85,107,47,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt=""
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

                            <Stack spacing={1} sx={{ mt: 1.5 }}>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<AddPhotoAlternateRoundedIcon />}
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
                                    sx={{ borderColor: '#556b2f', color: '#556b2f' }}
                                >
                                    رفع فيديو
                                    <input
                                        type="file"
                                        accept="video/*"
                                        hidden
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) {
                                                updatePortfolioItem(
                                                    index,
                                                    'video',
                                                    URL.createObjectURL(file)
                                                );
                                            }
                                        }}
                                    />
                                </Button>

                                <Button
                                    color="inherit"
                                    onClick={() => removePortfolioItem(index)}
                                    startIcon={<DeleteOutlineRoundedIcon />}
                                >
                                    حذف العمل
                                </Button>
                            </Stack>
                        </Box>

                        <Stack spacing={1.6}>
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

export default PortfolioSection;
