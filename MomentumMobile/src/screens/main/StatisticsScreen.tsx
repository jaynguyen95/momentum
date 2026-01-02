import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {habitService, goalService} from '../../services/api';
import type {Habit, Completion, Streak, DailyGoal} from '../../types';
import {startOfMonth, endOfMonth, format} from 'date-fns';

const StatisticsScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [streaks, setStreaks] = useState<Map<number, Streak>>(new Map());
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const habitsData = await habitService.getHabits();
      setHabits(habitsData);

      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const completionsPromises = habitsData.map(habit =>
        habitService.getCompletions(
          habit.id,
          monthStart.toISOString(),
          monthEnd.toISOString(),
        ),
      );
      const completionsArrays = await Promise.all(completionsPromises);
      setCompletions(completionsArrays.flat());

      const streakMap = new Map<number, Streak>();
      for (const habit of habitsData) {
        const streak = await habitService.getStreak(habit.id);
        streakMap.set(habit.id, streak);
      }
      setStreaks(streakMap);

      const goalData = await goalService.getDailyGoal();
      setGoal(goalData);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCompletionRate = () => {
    if (habits.length === 0) return 0;
    const daysInMonth = new Date().getDate();
    const possibleCompletions = habits.length * daysInMonth;
    return Math.round((completions.length / possibleCompletions) * 100);
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

    completions.forEach(comp => {
      const count = habitCompletionCounts.get(comp.habit_id) || 0;
      habitCompletionCounts.set(comp.habit_id, count + 1);
    });

    return habits
      .map(habit => ({
        habit,
        count: habitCompletionCounts.get(habit.id) || 0,
        streak: streaks.get(habit.id)?.current_streak || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading statistics...</Text>
      </View>
    );
  }

  const topHabits = getTopHabits();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
      }>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>{format(new Date(), 'MMMM yyyy')}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{getCompletionRate()}%</Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🗓️</Text>
          <Text style={styles.statValue}>{completions.length}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{getBestStreak()}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        {goal && (
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{goal.target_completions}</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performing Habits</Text>
        {topHabits.length === 0 ? (
          <Text style={styles.emptyText}>
            No data yet. Start completing habits!
          </Text>
        ) : (
          topHabits.map((item, index) => (
            <View
              key={item.habit.id}
              style={[
                styles.topHabitCard,
                {borderLeftColor: item.habit.color},
              ]}>
              <Text style={styles.habitRank}>#{index + 1}</Text>
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{item.habit.name}</Text>
                <Text style={styles.habitCount}>
                  {item.count} completions this month
                </Text>
              </View>
              {item.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeText}>
                    🔥 {item.streak}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 40,
  },
  topHabitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitRank: {
    fontSize: 24,
    fontWeight: '700',
    color: '#667eea',
    width: 40,
    textAlign: 'center',
  },
  habitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  habitCount: {
    fontSize: 14,
    color: '#666',
  },
  streakBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f59e0b',
  },
});

export default StatisticsScreen;