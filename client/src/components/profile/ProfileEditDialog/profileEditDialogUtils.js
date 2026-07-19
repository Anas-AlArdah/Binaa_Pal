import { PALESTINE_CITIES } from '../../../data/palestineCities';

const EMPTY_PORTFOLIO_ITEM = {
    title: '',
    image: '',
    tag: '',
    description: '',
    video: '',
};

const DAY_MAP = {
    الأحد: 'Sunday',
    الإثنين: 'Monday',
    الثلاثاء: 'Tuesday',
    الأربعاء: 'Wednesday',
    الخميس: 'Thursday',
    الجمعة: 'Friday',
    السبت: 'Saturday',
};

export const DAYS_AR = Object.keys(DAY_MAP);
export const PRIMARY_AVAILABILITY_KEY = 'primary';

const getAvailabilityCraftKey = (skillId) => {
    const numericSkillId = Number(skillId);
    return Number.isInteger(numericSkillId) && numericSkillId > 0
        ? `skill-${numericSkillId}`
        : PRIMARY_AVAILABILITY_KEY;
};

const PALESTINE_CITY_SET = new Set(PALESTINE_CITIES);

const normalizeProfileCity = (value) => {
    const city = String(value || '').trim();
    return PALESTINE_CITY_SET.has(city) ? city : '';
};

export const getSkillIdFromCraftKey = (craftKey) => {
    const match = /^skill-(\d+)$/.exec(String(craftKey || ''));
    const skillId = Number(match?.[1]);

    return Number.isInteger(skillId) && skillId > 0 ? skillId : null;
};

export const createEmptyPortfolioItem = () => ({ ...EMPTY_PORTFOLIO_ITEM });

export const getProfileUserId = (profile) => {
    const value = profile?.user?.id ?? profile?.user_id ?? profile?.worker_id;
    const userId = Number(value);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
};

export const parseProjectMeta = (description_p) => {
    try {
        return JSON.parse(description_p);
    } catch {
        return { description: description_p || '', tag: '', video: '' };
    }
};

export const buildAvailabilityForm = (records) => {
    const reversed = Object.fromEntries(
        Object.entries(DAY_MAP).map(([ar, en]) => [en, ar])
    );
    const result = {};

    for (const record of records || []) {
        const arabicDay = reversed[record.day_of_week];
        if (arabicDay) {
            const recordSkillId = record.skill_id ?? record.skill?.id ?? record.Skill?.id;
            const craftKey = getAvailabilityCraftKey(recordSkillId);

            result[craftKey] = {
                ...(result[craftKey] || {}),
                [arabicDay]: {
                    skill_id: recordSkillId ?? null,
                    skill_name: record.skill?.skill_name || record.Skill?.skill_name || record.skill_name || '',
                    day_of_week: record.day_of_week,
                    is_available: record.is_available !== false,
                    start_time: record.start_time?.slice(0, 5) || '',
                    end_time: record.end_time?.slice(0, 5) || '',
                    av_id: record.av_id,
                },
            };
        }
    }

    return result;
};

export const buildAvailabilityPayload = (availability, crafts = []) => {
    const craftByKey = new Map(crafts.map((craft) => [craft.key, craft]));
    const result = [];

    Object.entries(availability || {}).forEach(([craftKey, days]) => {
        const craft = craftByKey.get(craftKey);
        const skillIdFromKey = getSkillIdFromCraftKey(craftKey);

        Object.entries(days || {}).forEach(([arabicDay, dayData]) => {
            const englishDay = DAY_MAP[arabicDay];

            if (!englishDay || !dayData?.start_time || !dayData?.end_time) return;

            const skillId = craft?.skill_id ?? dayData.skill_id ?? skillIdFromKey ?? null;

            result.push({
                av_id: dayData.av_id,
                skill_id: skillId,
                skill_name: craft?.label || dayData.skill_name || '',
                day_of_week: englishDay,
                start_time: dayData.start_time,
                end_time: dayData.end_time,
                is_available: dayData.is_available !== false,
            });
        });
    });

    return result;
};

export const buildInitialForm = () => ({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    major: '',
    min_price: '',
    max_price: '',
    profile_image: '',
    skill_ids: [],
    skill_prices: {},
    current_password: '',
    new_password: '',
    confirm_password: '',
    availability: {},
    portfolio_items: [createEmptyPortfolioItem()],
});

export const buildProfileFormPatch = (profile) => ({
    firstname: profile?.user?.firstname || '',
    lastname: profile?.user?.lastname || '',
    email: profile?.user?.email || '',
    phone: profile?.user?.phone || '',
    location: normalizeProfileCity(profile?.user?.location),
    bio: profile?.bio || '',
    major: profile?.major || '',
    min_price: profile?.min_price || '',
    max_price: profile?.max_price || '',
    profile_image: profile?.profile_image || '',
    skill_ids: Array.isArray(profile?.skill_ids)
        ? profile.skill_ids
        : profile?.skills?.map((skill) => skill.id) || [],
    skill_prices: (Array.isArray(profile?.skill_details) ? profile.skill_details : [])
        .reduce((prices, skill) => {
            if (!skill?.skill_id) return prices;

            return {
                ...prices,
                [skill.skill_id]: {
                    min_price: skill.min_price ?? '',
                    max_price: skill.max_price ?? '',
                },
            };
        }, {}),
    availability: buildAvailabilityForm(profile?.availability || []),
});
