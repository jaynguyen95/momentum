import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import type { Habit, Completion } from '../types/habit';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import '../styles/HabitCalendar.css';

interface HabitCalendarProps {
  habit: Habit;
  onClose: () => void;
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletions();
  }, [currentMonth]);

  const fetchCompletions = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const data = await habitService.getCompletions(
        habit.id,
        monthStart.toISOString(),
        monthEnd.toISOString()
      );
      setCompletions(data);
    } catch (err: any) {
      console.error('Failed to fetch completions:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDateCompleted = (date: Date): boolean => {
    return completions.some(c => 
      isSameDay(new Date(c.completed_date), date)
    );
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const completionRate = () => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const completedDays = daysInMonth.filter(day => isDateCompleted(day)).length;
    return Math.round((completedDays / daysInMonth.length) * 100);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <div className="calendar-title">
            <h3 style={{ color: habit.color }}>{habit.name}</h3>
            <p className="completion-rate">{completionRate()}% completion this month</p>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="calendar-navigation">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            ←
          </button>
          <h4>{format(currentMonth, 'MMMM yyyy')}</h4>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            →
          </button>
        </div>

        {loading ? (
          <div className="calendar-loading">Loading...</div>
        ) : (
          <div className="calendar-grid">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
            {calendarDays.map(day => {
              const isCompleted = isDateCompleted(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toString()}
                  className={`calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}`}
                  style={isCompleted ? { backgroundColor: habit.color } : {}}
                >
                  <span>{format(day, 'd')}</span>
                  {isCompleted && <span className="check-mark">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCalendar;