import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import type { Habit, Completion, Streak } from '../types/habit';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import '../styles/Statistics.css';

const Statistics: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [allCompletions, setAllCompletions] = useState<Completion[]>([]);
  const [streaks, setStreaks] = useState<Map<number, Streak>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const habitsData = await habitService.getHabits();
      setHabits(habitsData);

      // Fetch all completions for this month
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const completionsPromises = habitsData.map(habit =>
        habitService.getCompletions(
          habit.id,
          monthStart.toISOString(),
          monthEnd.toISOString()
        )
      );
      const completionsArrays = await Promise.all(completionsPromises);
      const allComps = completionsArrays.flat();
      setAllCompletions(allComps);

      // Fetch streaks
      const streakMap = new Map<number, Streak>();
      for (const habit of habitsData) {
        const streak = await habitService.getStreak(habit.id);
        streakMap.set(habit.id, streak);
      }
      setStreaks(streakMap);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyCompletions = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return allCompletions.filter(c => {
      const date = new Date(c.completed_date);
      return date >= weekStart && date <= weekEnd;
    }).length;
  };

  const getMonthlyCompletions = () => {
    return allCompletions.length;
  };

  const getTotalCompletions = async () => {
    // For simplicity, we'll show this month's count
    // In production, you'd want a separate API endpoint for all-time stats
    return allCompletions.length;
  };

  const getCompletionRate = () => {
    if (habits.length === 0) return 0;
    const daysInMonth = new Date().getDate();
    const possibleCompletions = habits.length * daysInMonth;
    return Math.round((allCompletions.length / possibleCompletions) * 100);
  };

  const getBestStreak = () => {
    let best = 0;
    streaks.forEach(streak => {
      if (streak.longest_streak > best) {
        best = streak.longest_streak;
      }
    });
    return best;
  };

  const getTopHabits = () => {
    const habitCompletionCounts = new Map<number, number>();
    
    allCompletions.forEach(comp => {
      const count = habitCompletionCounts.get(comp.habit_id) || 0;
      habitCompletionCounts.set(comp.habit_id, count + 1);
    });

    return habits
      .map(habit => ({
        habit,
        count: habitCompletionCounts.get(habit.id) || 0,
        streak: streaks.get(habit.id)?.current_streak || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  if (loading) {
    return <div className="statistics-loading">Loading statistics...</div>;
  }

  const topHabits = getTopHabits();

  return (
    <div className="statistics-container">
      <h2>Statistics</h2>
      <p className="stats-subtitle">{format(new Date(), 'MMMM yyyy')}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{getCompletionRate()}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{getWeeklyCompletions()}</h3>
            <p>This Week</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🗓️</div>
          <div className="stat-content">
            <h3>{getMonthlyCompletions()}</h3>
            <p>This Month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{getBestStreak()}</h3>
            <p>Best Streak</p>
          </div>
        </div>
      </div>

      <div className="top-habits-section">
        <h3>Top Performing Habits</h3>
        {topHabits.length === 0 ? (
          <p className="no-data">No data yet. Start completing habits!</p>
        ) : (
          <div className="top-habits-list">
            {topHabits.map((item, index) => (
              <div 
                key={item.habit.id} 
                className="top-habit-item"
                style={{ borderLeft: `4px solid ${item.habit.color}` }}
              >
                <div className="habit-rank">#{index + 1}</div>
                <div className="habit-info">
                  <h4>{item.habit.name}</h4>
                  <p>{item.count} completions this month</p>
                </div>
                {item.streak > 0 && (
                  <div className="habit-streak-badge">
                    🔥 {item.streak} day streak
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;