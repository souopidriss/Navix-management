/**
 * Navix Maintenance — MaintenanceCalendar
 * --------------------------------------------------------------------------
 * Calendrier mensuel des entretiens (semaine commençant le lundi). Chaque
 * cellule affiche les entretiens prévus ou les prochaines échéances du jour
 * sous forme de puces cliquables. Construit sur les primitives de Bootstrap
 * (Card, Badge) — aucun composant core spécifique au calendrier.
 *
 * Props :
 *   month        : Date — mois affiché
 *   events       : événements [{ id, eventDate, eventSource, maintenanceNumber, maintenanceType, status }]
 *   vehicleById  : carte { id → véhicule } pour le libellé de chaque puce
 *   onPrev       : () => void — mois précédent
 *   onNext       : () => void — mois suivant
 *   onEventClick : (id: string) => void
 */
import { Badge } from '@/components/ui';
import { getMaintenanceStatus, getMaintenanceType } from '../constants';
import './MaintenanceCalendar.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const MaintenanceCalendar = ({
  month,
  events = [],
  vehicleById = {},
  onPrev,
  onNext,
  onEventClick,
}) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const eventsByDay = events.reduce((groups, event) => {
    const day = groups.get(event.eventDate) || [];
    day.push(event);
    groups.set(event.eventDate, day);
    return groups;
  }, new Map());

  const monthTitle = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(<div key={`blank-${index}`} className="navix-calendar__day navix-calendar__day--empty" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    const dateKey = toDateKey(date);
    const dayEvents = eventsByDay.get(dateKey) || [];
    const isToday = dateKey === toDateKey(new Date());

    cells.push(
      <div key={dateKey} className={`navix-calendar__day ${isToday ? 'navix-calendar__day--today' : ''}`}>
        <span className="navix-calendar__day-number">{day}</span>
        <div className="navix-calendar__events">
          {dayEvents.map((event) => {
            const type = getMaintenanceType(event.maintenanceType);
            const status = getMaintenanceStatus(event.status);
            const vehicle = vehicleById[event.vehicleId] ?? {};
            const label =
              vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || event.maintenanceNumber;
            return (
              <button
                key={`${event.id}-${event.eventDate}`}
                type="button"
                className="navix-calendar__event"
                title={`${event.maintenanceNumber} · ${label} · ${type.label}`}
                onClick={() => onEventClick(event.id)}
              >
                <i className={`bi ${type.icon} navix-calendar__event-icon navix-calendar__event-icon--${status.variant}`} aria-hidden="true" />
                <span className="navix-calendar__event-label">{label}</span>
              </button>
            );
          })}
        </div>
      </div>,
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h5 mb-0">{monthTitle}</h2>
          <div className="d-flex gap-1">
            <Badge variant="secondary" soft>
              {events.length} événement{events.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2 mb-3">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={onPrev} aria-label="Mois précédent">
            <i className="bi bi-chevron-left" aria-hidden="true" /> Précédent
          </button>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={onNext} aria-label="Mois suivant">
            Suivant <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </div>

        <div className="navix-calendar__grid" role="grid" aria-label={monthTitle}>
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="navix-calendar__weekday" role="columnheader">
              {weekday}
            </div>
          ))}
          {cells}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
