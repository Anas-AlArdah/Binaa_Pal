import React, { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiClock, FiTool } from 'react-icons/fi';

const DAY_AR = {
  Sunday: 'الأحد',
  Monday: 'الإثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
};

const DAY_ORDER = Object.keys(DAY_AR);

const formatTime = (value) => String(value || '').slice(0, 5);

const normalizeText = (value) => String(value || '').trim();

const normalizeComparableText = (value) => normalizeText(value).toLowerCase();

const normalizeSkillId = (value) => {
  const skillId = Number(value);
  return Number.isInteger(skillId) && skillId > 0 ? skillId : null;
};

const isAvailabilityActive = (slot) => {
  const value = slot?.is_available;
  return value !== false && value !== 0 && value !== '0' && value !== 'false';
};

const getSlotCraftKey = (slot) => {
  const skillId = normalizeSkillId(slot?.skill_id ?? slot?.skill?.id ?? slot?.Skill?.id);
  return skillId ? `skill-${skillId}` : 'primary';
};

const getSlotCraftName = (slot) =>
  normalizeText(
    slot?.skill?.skill_name ||
    slot?.Skill?.skill_name ||
    slot?.skill_name ||
    slot?.skillName
  );

const getCraftSkillId = (craft) =>
  normalizeSkillId(craft?.skill_id ?? craft?.skillId ?? craft?.id);

const getCraftName = (craft) => normalizeText(craft?.name || craft?.skill_name || craft?.label);

const getCraftKey = (craft, index) => {
  if (craft?.key === 'primary' || craft?.id === 'primary' || index === 0) {
    return 'primary';
  }

  const skillId = getCraftSkillId(craft);

  if (skillId) {
    return `skill-${skillId}`;
  }

  const craftNameKey = normalizeComparableText(getCraftName(craft));
  return craftNameKey ? `craft-${craftNameKey}` : `craft-${index}`;
};

const getGroupLabel = (groups, index) => {
  const group = groups[index];

  if (group.key === 'primary') {
    return 'الصنعة الأساسية';
  }

  const secondaryIndex = groups
    .slice(0, index + 1)
    .filter((item) => item.key !== 'primary').length;

  return secondaryIndex === 1 ? 'الصنعة الثانوية' : `صنعة إضافية ${secondaryIndex}`;
};

const buildCraftNames = (craftDetails = []) => {
  const names = new Map();
  const keysByName = new Map();

  craftDetails.forEach((craft, index) => {
    const key = getCraftKey(craft, index);
    const craftName = getCraftName(craft);

    if (!craftName) return;

    names.set(key, craftName);
    keysByName.set(normalizeComparableText(craftName), key);
  });

  return { names, keysByName };
};

const resolveSlotCraft = (slot, craftLookups) => {
  const skillId = normalizeSkillId(slot?.skill_id ?? slot?.skill?.id ?? slot?.Skill?.id);
  const slotName = getSlotCraftName(slot);
  const slotNameKey = craftLookups.keysByName.get(normalizeComparableText(slotName));
  const key = skillId ? `skill-${skillId}` : slotNameKey || getSlotCraftKey(slot);
  const name =
    craftLookups.names.get(key) ||
    slotName ||
    (key === 'primary' ? 'الصنعة الأساسية' : 'صنعة إضافية');

  return { key, name };
};

const groupAvailabilityByCraft = (availability, craftDetails) => {
  const craftLookups = buildCraftNames(craftDetails);
  const groups = new Map();

  availability.forEach((slot) => {
    const { key, name } = resolveSlotCraft(slot, craftLookups);

    if (!groups.has(key)) {
      groups.set(key, { key, name, slots: [] });
    }

    groups.get(key).slots.push(slot);
  });

  return Array.from(groups.values()).sort((firstGroup, secondGroup) => {
    if (firstGroup.key === 'primary') return -1;
    if (secondGroup.key === 'primary') return 1;
    return firstGroup.name.localeCompare(secondGroup.name, 'ar');
  }).map((group) => ({
    ...group,
    slots: [...group.slots].sort((firstSlot, secondSlot) => {
      const firstDay = DAY_ORDER.indexOf(firstSlot.day_of_week);
      const secondDay = DAY_ORDER.indexOf(secondSlot.day_of_week);
      const normalizedFirstDay = firstDay === -1 ? DAY_ORDER.length : firstDay;
      const normalizedSecondDay = secondDay === -1 ? DAY_ORDER.length : secondDay;

      return normalizedFirstDay - normalizedSecondDay ||
        formatTime(firstSlot.start_time).localeCompare(formatTime(secondSlot.start_time));
    }),
  }));
};

const ProfileAvailability = ({ availability, craftDetails = [] }) => {
  const [activeGroupKey, setActiveGroupKey] = useState('');

  const availabilityGroups = useMemo(() => {
    const activeAvailability = Array.isArray(availability)
      ? availability.filter((slot) => isAvailabilityActive(slot) && slot?.start_time && slot?.end_time)
      : [];

    return groupAvailabilityByCraft(activeAvailability, craftDetails);
  }, [availability, craftDetails]);

  useEffect(() => {
    if (availabilityGroups.length === 0) {
      setActiveGroupKey('');
      return;
    }

    if (!availabilityGroups.some((group) => group.key === activeGroupKey)) {
      setActiveGroupKey(availabilityGroups[0].key);
    }
  }, [activeGroupKey, availabilityGroups]);

  const activeGroup =
    availabilityGroups.find((group) => group.key === activeGroupKey) ||
    availabilityGroups[0];
  const activeGroupIndex = availabilityGroups.findIndex((group) => group.key === activeGroup?.key);

  return (
    <div className="profile-availability-block">
      <div className="profile-side-panel__title">
        <FiCalendar />
        <h3>أوقات العمل حسب الصنعة</h3>
      </div>

      {availabilityGroups.length === 0 ? (
        <p className="profile-side-empty">لم يتم تحديد أوقات العمل بعد.</p>
      ) : (
        <>
          <div className="profile-availability-tabs" role="tablist" aria-label="الصنعات التي لها أوقات عمل">
            {availabilityGroups.map((group, groupIndex) => {
              const isActive = group.key === activeGroup?.key;

              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`profile-availability-tab${isActive ? ' is-active' : ''}`}
                  key={group.key}
                  onClick={() => setActiveGroupKey(group.key)}
                >
                  <span>{getGroupLabel(availabilityGroups, groupIndex)}</span>
                  <strong>
                    <FiTool />
                    {group.name}
                  </strong>
                  <small>{group.slots.length} {group.slots.length === 1 ? 'وقت' : 'أوقات'}</small>
                </button>
              );
            })}
          </div>

          <section className="profile-availability-panel" key={activeGroup.key}>
            <div className="profile-availability-group">
              <div className="profile-availability-group__title">
                <span>{getGroupLabel(availabilityGroups, activeGroupIndex)}</span>
                <strong>{activeGroup.name}</strong>
              </div>

              <div className="profile-availability-list">
                {activeGroup.slots.map((slot, index) => (
                  <article className="profile-availability-card" key={`${activeGroup.key}-${slot.day_of_week}-${slot.av_id || index}`}>
                    <strong>{DAY_AR[slot.day_of_week] || slot.day_of_week}</strong>
                    <span>
                      <FiClock />
                      من {formatTime(slot.start_time)} إلى {formatTime(slot.end_time)}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default React.memo(ProfileAvailability);
