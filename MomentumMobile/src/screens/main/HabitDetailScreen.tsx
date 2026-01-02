import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {habitService} from '../../services/api';
import type {Habit, Completion, Streak} from '../../types';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

interface HabitDetailScreenProps {
  route: any;
  navigation: any;
}

const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({route, navigation}) => {
  const {habitId} = route.params;
  const [habit, setHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    try {
      const habitsData = await habitService.getHabits();
      const habitData = habitsData.find(h => h.id === habitId);
      setHabit(habitData || null);

      if (!habitData) {
        Alert.alert('Error', 'Habit not found');
        navigation.goBack();
        return;
      }

      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const completionsData = await habitService.getCompletions(
        habitId,
        monthStart.toISOString(),
        monthEnd.toISOString(),
      );
      setCompletions(completionsData);

      const streakData = await habitService.getStreak(habitId);
      setStreak(streakData);
    } catch (error) {
      console.error('Failed to fetch habit details:', error);
      Alert.alert('Error', 'Failed to load habit details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await habitService.deleteHabit(habitId);
              navigation.navigate('HabitsTab');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ],
    );
  };

  const isDateCompleted = (date: Date): boolean => {
    return completions.some(c => isSameDay(new Date(c.completed_date), date));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.centerContainer}>
        <Text>Habit not found</Text>
      </View>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const completionRate = () => {
    const daysInMonth = eachDayOfInterval({start: monthStart, end: monthEnd});
    const completedDays = daysInMonth.filter(day => isDateCompleted(day)).length;
    return Math.round((completedDays / daysInMonth.length) * 100);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, {backgroundColor: habit.color}]}>
        <Text style={styles.habitName}>{habit.name}</Text>
        {habit.description && (
          <Text style={styles.habitDescription}>{habit.description}</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{streak?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{streak?.longest_streak || 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{completionRate()}%</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.calendarNavigation}>
          <TouchableOpacity
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <Text style={styles.navButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <Text style={styles.navButton}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {weekDays.map(day => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map(day => {
            const isCompleted = isDateCompleted(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <View
                key={day.toString()}
                style={[
                  styles.calendarDay,
                  !isCurrentMonth && styles.calendarDayOtherMonth,
                  isToday && styles.calendarDayToday,
                  isCompleted && [
                    styles.calendarDayCompleted,
                    {backgroundColor: habit.color},
                  ],
                ]}>
                <Text
                  style={[
                    styles.calendarDayText,
                    !isCurrentMonth && styles.calendarDayTextOther,
                    isCompleted && styles.calendarDayTextCompleted,
                  ]}>
                  {format(day, 'd')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Habit</Text>
      </TouchableOpacity>
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
  },
  habitName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  habitDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 32,
    color: '#667eea',
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f7fafc',
  },
  calendarDayOtherMonth: {
    backgroundColor: 'transparent',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  calendarDayCompleted: {
    borderWidth: 0,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  calendarDayTextOther: {
    color: '#ccc',
  },
  calendarDayTextCompleted: {
    color: 'white',
    fontWeight: '700',
  },
  deleteButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HabitDetailScreen;