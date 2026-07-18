import React, { useCallback, useMemo } from 'react';
import { Box, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import { FiCalendar, FiClock } from 'react-icons/fi';
import { DAYS_AR } from './profileEditDialogUtils';

const TIME_HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const BASE_TIME_MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));
const DEFAULT_TIME = {
    hour: '08',
    minute: '00',
};

const normalizeTimePart = (part, max, fallback) => {
    if (part === undefined || part === '') return fallback;

    const value = Number(part);

    if (!Number.isInteger(value) || value < 0 || value > max) return fallback;

    return String(value).padStart(2, '0');
};

const splitTimeValue = (value) => {
    const [rawHour, rawMinute] = String(value || '').split(':');
    const hour = normalizeTimePart(rawHour, 23, DEFAULT_TIME.hour);
    const minute = normalizeTimePart(rawMinute, 59, DEFAULT_TIME.minute);

    return { hour, minute };
};

const getMinuteOptions = (minute) =>
    Array.from(new Set([minute, ...BASE_TIME_MINUTES]))
        .filter(Boolean)
        .sort((first, second) => Number(first) - Number(second));

const joinTimeValue = (hour, minute) => `${hour}:${minute}`;

const TIME_MENU_PROPS = {
    PaperProps: {
        className: 'profile-edit-time-menu',
    },
    MenuListProps: {
        dense: true,
    },
};

const HOUR_MENU_ITEMS = TIME_HOURS.map((option) => (
    <MenuItem key={option} value={option}>
        {option}
    </MenuItem>
));

const BASE_MINUTE_MENU_ITEMS = BASE_TIME_MINUTES.map((option) => (
    <MenuItem key={option} value={option}>
        {option}
    </MenuItem>
));

const EMPTY_DAY_AVAILABILITY = {};

const TimeSelectField = React.memo(({ disabled, label, value, onChange }) => {
    const { hour, minute } = splitTimeValue(value);
    const minuteItems = useMemo(() => {
        if (BASE_TIME_MINUTES.includes(minute)) {
            return BASE_MINUTE_MENU_ITEMS;
        }

        return getMinuteOptions(minute).map((option) => (
            <MenuItem key={option} value={option}>
                {option}
            </MenuItem>
        ));
    }, [minute]);

    if (disabled) {
        return (
            <TextField
                label={label}
                value="غير محدد"
                disabled
                fullWidth
                InputLabelProps={{ shrink: true }}
            />
        );
    }

    return (
        <div className="profile-edit-time-select" dir="ltr">
            <span className="profile-edit-time-select__label">{label}</span>

            <TextField
                select
                value={hour}
                onChange={(event) => onChange(joinTimeValue(event.target.value, minute))}
                className="profile-edit-time-select__part"
                SelectProps={{ MenuProps: TIME_MENU_PROPS }}
                inputProps={{
                    'aria-label': `${label} الساعة`,
                    autoComplete: 'off',
                }}
            >
                {HOUR_MENU_ITEMS}
            </TextField>

            <span className="profile-edit-time-select__separator">:</span>

            <TextField
                select
                value={minute}
                onChange={(event) => onChange(joinTimeValue(hour, event.target.value))}
                className="profile-edit-time-select__part"
                SelectProps={{ MenuProps: TIME_MENU_PROPS }}
                inputProps={{
                    'aria-label': `${label} الدقيقة`,
                    autoComplete: 'off',
                }}
            >
                {minuteItems}
            </TextField>
        </div>
    );
});

const AvailabilityDayRow = React.memo(({
    activeCraftKey,
    activateAvailabilityDay,
    day,
    dayData,
    removeAvailabilityDay,
    updateAvailabilityField,
}) => {
    const hasData = Boolean(dayData.start_time || dayData.end_time);

    const handleToggle = useCallback((event) => {
        if (!event.target.checked) {
            removeAvailabilityDay(activeCraftKey, day);
            return;
        }

        activateAvailabilityDay(activeCraftKey, day);
    }, [activeCraftKey, activateAvailabilityDay, day, removeAvailabilityDay]);

    const handleStartTimeChange = useCallback((value) => {
        updateAvailabilityField(activeCraftKey, day, 'start_time', value);
    }, [activeCraftKey, day, updateAvailabilityField]);

    const handleEndTimeChange = useCallback((value) => {
        updateAvailabilityField(activeCraftKey, day, 'end_time', value);
    }, [activeCraftKey, day, updateAvailabilityField]);

    return (
        <Box
            className={`profile-edit-availability-row${hasData ? ' is-active' : ''}`}
        >
            <Box className="profile-edit-availability-day">
                <Typography>{day}</Typography>
                <small>{hasData ? 'متاح لهذه الصنعة' : 'غير مفعّل'}</small>
            </Box>

            <Switch
                checked={hasData}
                onChange={handleToggle}
            />

            <TimeSelectField
                label="من"
                value={dayData.start_time || ''}
                disabled={!hasData}
                onChange={handleStartTimeChange}
            />

            <TimeSelectField
                label="إلى"
                value={dayData.end_time || ''}
                disabled={!hasData}
                onChange={handleEndTimeChange}
            />
        </Box>
    );
});

const AvailabilitySection = ({
    activeCraftKey,
    activateAvailabilityDay,
    availability,
    crafts,
    removeAvailabilityDay,
    setActiveCraftKey,
    updateAvailabilityField,
}) => {
    const availabilityCrafts = crafts.length > 0 ? crafts : [];
    const activeCraft =
        availabilityCrafts.find((craft) => craft.key === activeCraftKey) ||
        availabilityCrafts[0];
    const activeCraftAvailability = activeCraft
        ? availability?.[activeCraft.key] || {}
        : {};

    return (
        <Stack className="profile-edit-section" spacing={2}>
            <Box className="profile-edit-section__header">
                <span>
                    <FiCalendar />
                </span>
                <div>
                    <h3>أوقات العمل حسب الصنعة</h3>
                    <p>حدد الأيام والساعات لكل صنعة حتى يعرف العميل متى تكون متاحًا للخدمة المطلوبة.</p>
                </div>
            </Box>

            {activeCraft && (
                <>
                    <Box className="profile-edit-availability-crafts" role="tablist" aria-label="الصنعات">
                        {availabilityCrafts.map((craft) => {
                            const hasSlots = Object.values(availability?.[craft.key] || {})
                                .some((slot) => slot?.start_time && slot?.end_time);

                            return (
                                <button
                                    type="button"
                                    key={craft.key}
                                    className={`profile-edit-availability-craft${craft.key === activeCraft.key ? ' is-active' : ''}`}
                                    onClick={() => setActiveCraftKey(craft.key)}
                                >
                                    <span>{craft.type === 'primary' ? 'أساسية' : 'ثانوية'}</span>
                                    <strong>{craft.label}</strong>
                                    {hasSlots && <small>محددة</small>}
                                </button>
                            );
                        })}
                    </Box>

                    <Box className="profile-edit-availability-current">
                        <FiClock />
                        <span>الأوقات المعروضة حاليًا خاصة بـ</span>
                        <strong>{activeCraft.label}</strong>
                    </Box>

                    <Box className="profile-edit-availability-list">
                        {DAYS_AR.map((day) => {
                            const dayData = activeCraftAvailability[day] || EMPTY_DAY_AVAILABILITY;

                            return (
                                <AvailabilityDayRow
                                    key={`${activeCraft.key}-${day}`}
                                    activeCraftKey={activeCraft.key}
                                    activateAvailabilityDay={activateAvailabilityDay}
                                    day={day}
                                    dayData={dayData}
                                    removeAvailabilityDay={removeAvailabilityDay}
                                    updateAvailabilityField={updateAvailabilityField}
                                />
                            );
                        })}
                    </Box>
                </>
            )}
        </Stack>
    );
};

export default React.memo(AvailabilitySection);
