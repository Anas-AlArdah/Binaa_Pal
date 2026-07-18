import React from 'react';
import { Box, Stack, Switch, TextField, Typography } from '@mui/material';
import { FiCalendar } from 'react-icons/fi';
import { DAYS_AR } from './profileEditDialogUtils';

const AvailabilitySection = ({
    availability,
    removeAvailabilityDay,
    updateAvailabilityField,
}) => (
    <Stack className="profile-edit-section" spacing={2}>
        <Box className="profile-edit-section__header">
            <span>
                <FiCalendar />
            </span>
            <div>
                <h3>أوقات العمل</h3>
                <p>حدد الأيام والساعات التي يمكن للعميل إرسال طلبات خلالها.</p>
            </div>
        </Box>

        <Box className="profile-edit-availability-list">
        {DAYS_AR.map((day) => {
            const dayData = availability[day] || {};
            const hasData = dayData.start_time || dayData.end_time;

            return (
                <Box
                    key={day}
                    className={`profile-edit-availability-row${hasData ? ' is-active' : ''}`}
                >
                    <Box className="profile-edit-availability-day">
                        <Typography>{day}</Typography>
                        <small>{hasData ? 'متاح للعمل' : 'غير مفعّل'}</small>
                    </Box>

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
        </Box>
    </Stack>
);

export default AvailabilitySection;
