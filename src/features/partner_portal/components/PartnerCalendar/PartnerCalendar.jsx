/**
 * Navix Partner Portal — PartnerCalendar (PROMPT 076)
 * ─────────────────────────────────────────────────────
 * Grille calendrier mensuel générique multi-type.
 * Adapté du MaintenanceCalendar existant avec support :
 *   - Événements de types variés (mission, demande, contrat, document, facture, maintenance, alerte)
 *   - Couleurs + icônes par type (pas uniquement couleur)
 *   - Popover détail au clic
 *   - Responsive
 */
import { useState, useCallback } from 'react';
import { EVENT_TYPE_CONFIG } from '../../services/partnerCalendarService';
import PartnerCalendarEventDetail from './PartnerCalendarEventDetail';
import './PartnerCalendar.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const toDayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const PartnerCalendar = ({
  currentDate,
  events = [],
  onPrev,
  onNext,
  onToday,
  monthTitle,
}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const eventsByDay = events.reduce((groups, event) => {
    const key = event.start;
    if (!key) return groups;
    const day = groups.get(key) || [];
    day.push(event);
    groups.set(key, day);
    return groups;
  }, new Map());

  const handleEventClick = useCallback((event, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom + window.scrollY + 4,
      left: Math.min(rect.left, window.innerWidth - 340),
    });
    setSelectedEvent((prev) => (prev?.id === event.id ? null : event));
  }, []);

  const handleDayClick = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(<div key={`blank-${index}`} className="partner-calendar__day partner-calendar__day--empty" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    const dateKey = toDayKey(date);
    const dayEvents = eventsByDay.get(dateKey) || [];
    const isToday = dateKey === toDayKey(new Date());

    cells.push(
      <div
        key={dateKey}
        className={`partner-calendar__day ${isToday ? 'partner-calendar__day--today' : ''}`}
        onClick={handleDayClick}
        role="gridcell"
        aria-label={`${day} ${monthTitle} — ${dayEvents.length} événement${dayEvents.length > 1 ? 's' : ''}`}
      >
        <span className="partner-calendar__day-number">{day}</span>
        <div className="partner-calendar__events">
          {dayEvents.slice(0, 3).map((event) => {
            const config = EVENT_TYPE_CONFIG[event.type] || {};
            return (
              <button
                key={event.id}
                type="button"
                className={`partner-calendar__event ${config.bgClass || ''}`}
                title={`${event.title} · ${config.label}`}
                onClick={(e) => handleEventClick(event, e)}
                aria-label={`${config.label}: ${event.title}`}
              >
                <i className={`bi ${config.icon || 'bi-circle'} partner-calendar__event-icon`} aria-hidden="true" />
                <span className="partner-calendar__event-label">{event.title}</span>
              </button>
            );
          })}
          {dayEvents.length > 3 && (
            <span className="partner-calendar__more">+{dayEvents.length - 3}</span>
          )}
        </div>
      </div>,
    );
  }

  return (
    <div className="partner-calendar">
      <div className="partner-calendar__header">
        <div className="partner-calendar__nav">
          <button type="button" className="partner-calendar__nav-btn" onClick={onPrev} aria-label="Période précédente">
            <i className="bi bi-chevron-left" aria-hidden="true" />
          </button>
          <h2 className="partner-calendar__title">{monthTitle}</h2>
          <button type="button" className="partner-calendar__nav-btn" onClick={onNext} aria-label="Période suivante">
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
          <button type="button" className="partner-calendar__today-btn" onClick={onToday}>
            Aujourd&apos;hui
          </button>
        </div>
        <span className="partner-calendar__count">
          {events.length} événement{events.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="partner-calendar__grid" role="grid" aria-label={monthTitle}>
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="partner-calendar__weekday" role="columnheader">
            {weekday}
          </div>
        ))}
        {cells}
      </div>

      {selectedEvent && (
        <PartnerCalendarEventDetail
          event={selectedEvent}
          position={popoverPos}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default PartnerCalendar;
