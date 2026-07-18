import React from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

const DAY_AR = {
  Sunday: 'الأحد',
  Monday: 'الإثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
};

const formatTime = (value) => String(value || '').slice(0, 5);

const ProfileAvailability = ({ availability }) => {
  const activeAvailability = Array.isArray(availability)
    ? availability.filter((slot) => slot?.is_available !== false && slot?.start_time && slot?.end_time)
    : [];

  return (
    <div className="profile-availability-block">
      <div className="profile-side-panel__title">
        <FiCalendar />
        <h3>أوقات العمل</h3>
      </div>

      {activeAvailability.length === 0 ? (
        <p className="profile-side-empty">لم يتم تحديد أوقات العمل بعد.</p>
      ) : (
        <div className="profile-availability-list">
          {activeAvailability.map((slot, index) => (
            <article className="profile-availability-card" key={slot.day_of_week || index}>
              <strong>{DAY_AR[slot.day_of_week] || slot.day_of_week}</strong>
              <span>
                <FiClock />
                من {formatTime(slot.start_time)} إلى {formatTime(slot.end_time)}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileAvailability;
