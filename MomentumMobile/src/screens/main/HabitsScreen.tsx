import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {habitService} from '../../services/api';
import type {Habit, Completion, Streak} from '../../types';

const HabitsScreen = ({navigation}: any) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [streaks, setStreaks] = useState<Map<number, Streak>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    try {
      const habitsData = await habitService.getHabits();
      setHabits(habitsData);

      // Fetch today's completions
      const today = new Date().toISOString().split('T')[0];
      const completionsPromises = habitsData.map(habit =>
        habitService.getCompletions(
          habit.id,
          `${today}T00:00:00.000Z`,
          `${today}T23:59:59.999Z`,
        ),
      );
      const completionsArrays = await Promise.all(completionsPromises);
      setCompletions(completionsArrays.flat());

      // Fetch streaks
      const streakMap = new Map<number, Streak>();
      for (const habit of habitsData) {
        const streak = await habitService.getStreak(habit.id);
        streakMap.set(habit.id, streak);
      }
      setStreaks(streakMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Failed to load habits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleComplete = async (habitId: number) => {
    try {
      await habitService.completeHabit(habitId);
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete habit');
    }
  };

  const handleUndo = async (habitId: number) => {
    try {
      await habitService.undoTodayCompletion(habitId);
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to undo completion');
    }
  };

  const isCompleted = (habitId: number) => {
    return completions.some(c => c.habit_id === habitId);
  };

  const getTodayProgress = () => {
    const completedToday = completions.length;
    return completedToday;
  };

  const renderHabit = ({item}: {item: Habit}) => {
    const completed = isCompleted(item.id);
    const streak = streaks.get(item.id);

    return (
      <View style={[styles.habitCard, {borderLeftColor: item.color}]}>
        <View style={styles.habitHeader}>
          <Text style={[styles.habitName, completed && styles.habitNameCompleted]}>
            {item.name}
          </Text>
          {streak && streak.current_streak > 0 && (
            <Text style={styles.streak}>
              🔥 {streak.current_streak}
            </Text>
          )}
        </View>

        {item.description && (
          <Text style={styles.habitDescription}>{item.description}</Text>
        )}

        <View style={styles.habitActions}>
          {completed ? (
            <TouchableOpacity
              style={[styles.button, styles.undoButton]}
              onPress={() => handleUndo(item.id)}>
              <Text style={styles.buttonText}>↶ Undo</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={() => handleComplete(item.id)}>
              <Text style={styles.buttonText}>✓ Complete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={() =>
              navigation.navigate('HabitDetail', {habitId: item.id})
            }>
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Habits</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateHabit')}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Today's Progress</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressValue}>{getTodayProgress()}</Text>
            <Text style={styles.progressTotal}>/ {habits.length}</Text>
            <Text style={styles.progressText}> habits completed</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + Add button to create your first habit
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHabit')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#667eea',
  },
  progressTotal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginLeft: 2,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  list: {
    padding: 16,
  },
  habitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  streak: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#48bb78',
  },
  undoButton: {
    backgroundColor: '#f59e0b',
  },
  viewButton: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
});

export default HabitsScreen;