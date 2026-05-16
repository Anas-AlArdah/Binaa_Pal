export const EMPTY_PORTFOLIO_ITEM = {
    title: '',
    image: '',
    tag: '',
    description: '',
    video: '',
};

export const DAY_MAP = {
    الأحد: 'Sunday',
    الإثنين: 'Monday',
    الثلاثاء: 'Tuesday',
    الأربعاء: 'Wednesday',
    الخميس: 'Thursday',
    الجمعة: 'Friday',
    السبت: 'Saturday',
};

export const DAYS_AR = Object.keys(DAY_MAP);

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
            result[arabicDay] = {
                start_time: record.start_time?.slice(0, 5) || '',
                end_time: record.end_time?.slice(0, 5) || '',
                av_id: record.av_id,
            };
        }
    }

    return result;
};

export const buildInitialForm = () => ({
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
    whatsapp: profile?.user?.whatsapp || '',
    location: profile?.user?.location || '',
    bio: profile?.bio || '',
    major: profile?.major || '',
    min_price: profile?.min_price || '',
    max_price: profile?.max_price || '',
    profile_image: profile?.profile_image || '',
    skill_ids: Array.isArray(profile?.skill_ids)
        ? profile.skill_ids
        : profile?.skills?.map((skill) => skill.id) || [],
});
