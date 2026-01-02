import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import type { Habit, Completion, Streak } from '../types/habit';
import CreateHabitForm from './CreateHabitForm';
import EditHabitModal from './EditHabitModal';
import HabitCalendar from './HabitCalendar';
import '../styles/HabitList.css';

const HabitList: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [streaks, setStreaks] = useState<Map<number, Streak>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [calendarHabit, setCalendarHabit] = useState<Habit | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      fetchTodayCompletions();
      fetchStreaks();
    }
  }, [habits]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const data = await habitService.getHabits();
      setHabits(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const allCompletions: Completion[] = [];
      
      for (const habit of habits) {
        const habitCompletions = await habitService.getCompletions(
          habit.id,
          `${today}T00:00:00.000Z`,
          `${today}T23:59:59.999Z`
        );
        allCompletions.push(...habitCompletions);
      }
      
      setCompletions(allCompletions);
    } catch (err: any) {
      console.error('Failed to fetch completions:', err);
    }
  };

  const fetchStreaks = async () => {
    try {
      const streakMap = new Map<number, Streak>();
      
      for (const habit of habits) {
        const streak = await habitService.getStreak(habit.id);
        streakMap.set(habit.id, streak);
      }
      
      setStreaks(streakMap);
    } catch (err: any) {
      console.error('Failed to fetch streaks:', err);
    }
  };

  const isHabitCompletedToday = (habitId: number): boolean => {
    return completions.some(c => c.habit_id === habitId);
  };

  const shouldShowStreakReminder = (): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 18; // 6pm or later
  };

  const handleCompleteHabit = async (habitId: number) => {
    try {
      await habitService.completeHabit(habitId);
      await fetchTodayCompletions();
      await fetchStreaks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete habit');
    }
  };

  const handleUndoCompletion = async (habitId: number) => {
    try {
      await habitService.undoTodayCompletion(habitId);
      await fetchTodayCompletions();
      await fetchStreaks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to undo completion');
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }
    try {
      await habitService.deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete habit');
    }
  };

  const sortedHabits = [...habits].sort((a, b) => {
    const aCompleted = isHabitCompletedToday(a.id);
    const bCompleted = isHabitCompletedToday(b.id);
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });

  if (loading) return <div className="loading">Loading habits...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="habit-list">
      <h2>Your Habits</h2>
      
      <CreateHabitForm onHabitCreated={fetchHabits} />

      {habits.length === 0 ? (
        <p className="no-habits">No habits yet. Create your first one!</p>
      ) : (
        <div className="habits-grid">
          {sortedHabits.map(habit => {
            const isCompleted = isHabitCompletedToday(habit.id);
            const streak = streaks.get(habit.id);
            const showReminder = shouldShowStreakReminder();
            
            return (
              <div 
                key={habit.id} 
                className={`habit-card ${isCompleted ? 'completed' : ''}`}
                style={{ borderLeft: `4px solid ${habit.color}` }}
              >
                <div className="habit-header">
                  <h3 onClick={() => setCalendarHabit(habit)} style={{ cursor: 'pointer' }}>
                    {habit.name} 📅
                  </h3>
                  <div className="habit-meta">
                    {streak && streak.current_streak > 0 && (
                      <span className="habit-streak">
                        🔥 {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="habit-frequency">{habit.frequency}</span>
                  </div>
                </div>
                {habit.description && (
                  <p className="habit-description">{habit.description}</p>
                )}
                
                {!isCompleted && showReminder && streak && streak.current_streak > 0 && (
                  <div className="streak-reminder">
                    💪 Complete today to maintain your {streak.current_streak}-day streak!
                  </div>
                )}
                
                <div className="habit-actions">
                  {isCompleted ? (
                    <button 
                      className="btn-undo"
                      onClick={() => handleUndoCompletion(habit.id)}
                    >
                      ↶ Undo
                    </button>
                  ) : (
                    <button 
                      className="btn-complete"
                      onClick={() => handleCompleteHabit(habit.id)}
                    >
                      ✓ Complete
                    </button>
                  )}
                  <button 
                    className="btn-edit"
                    onClick={() => setEditingHabit(habit)}
                  >
                    ✎ Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onHabitUpdated={fetchHabits}
        />
      )}

      {calendarHabit && (
        <HabitCalendar
          habit={calendarHabit}
          onClose={() => setCalendarHabit(null)}
        />
      )}
    </div>
  );
};

export default HabitList;