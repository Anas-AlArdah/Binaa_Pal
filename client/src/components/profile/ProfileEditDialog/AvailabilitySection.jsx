import React from 'react';
import { Box, Stack, Switch, TextField, Typography } from '@mui/material';
import { DAYS_AR } from './profileEditDialogUtils';

const AvailabilitySection = ({
    availability,
    removeAvailabilityDay,
    updateAvailabilityField,
}) => (
    <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#2d2a26' }}>
            جدول التوفر
        </Typography>

        {DAYS_AR.map((day) => {
            const dayData = availability[day] || {};
            const hasData = dayData.start_time || dayData.end_time;

            return (
                <Box
                    key={day}
                    sx={{
                        border: '1px solid #e3ddd4',
                        borderRadius: '16px',
                        p: 2,
                        bgcolor: '#fbfaf8',
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '160px auto 1fr 1fr' },
                        gap: 2,
                        alignItems: 'center',
                    }}
                >
                    <Typography sx={{ fontWeight: 800, color: '#2d2a26' }}>
                        {day}
                    </Typography>

                    <Switch
                        checked={!!hasData}
                        onChange={(event) => {
                            if (!event.target.checked) {
                                removeAvailabilityDay(day);
                                return;
                            }

                            updateAvailabilityField(day, 'start_time', '08:00');
                            updateAvailabilityField(day, 'end_time', '17:00');
                        }}
                        sx={{
                            '& .MuiSwitch-thumb': { bgcolor: '#556b2f' },
                            '& .Mui-checked + .MuiSwitch-track': {
                                bgcolor: 'rgba(85,107,47,0.4)',
                            },
                        }}
                    />

                    <TextField
                        type="time"
                        label="من"
                        InputLabelProps={{ shrink: true }}
                        value={dayData.start_time || ''}
                        disabled={!hasData}
                        onChange={(event) =>
                            updateAvailabilityField(day, 'start_time', event.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        type="time"
                        label="إلى"
                        InputLabelProps={{ shrink: true }}
                        value={dayData.end_time || ''}
                        disabled={!hasData}
                        onChange={(event) =>
                            updateAvailabilityField(day, 'end_time', event.target.value)
                        }
                        fullWidth
                    />
                </Box>
            );
        })}
    </Stack>
);

export default AvailabilitySection;
