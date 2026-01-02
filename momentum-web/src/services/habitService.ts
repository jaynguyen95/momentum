import axios from 'axios';
import type { Habit, Completion, Streak, CreateHabitInput } from '../types/habit';

const API_URL = 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const habitService = {
  // Get all habits
  getHabits: async (): Promise<Habit[]> => {
    const response = await axios.get(`${API_URL}/habits`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Create habit
  createHabit: async (habit: CreateHabitInput): Promise<Habit> => {
    const response = await axios.post(`${API_URL}/habits`, habit, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Update habit
  updateHabit: async (id: number, habit: Partial<CreateHabitInput>): Promise<Habit> => {
    const response = await axios.put(`${API_URL}/habits/${id}`, habit, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Delete habit
  deleteHabit: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/habits/${id}`, {
      headers: getAuthHeader()
    });
  },

  // Complete habit
  completeHabit: async (habitId: number, completedDate?: string): Promise<Completion> => {
    const response = await axios.post(
      `${API_URL}/habits/${habitId}/complete`,
      { completed_date: completedDate },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get habit completions
  getCompletions: async (
    habitId: number,
    startDate: string,
    endDate: string
  ): Promise<Completion[]> => {
    const response = await axios.get(
      `${API_URL}/habits/${habitId}/completions?start_date=${startDate}&end_date=${endDate}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Delete completion
  deleteCompletion: async (habitId: number, completionId: number): Promise<void> => {
    await axios.delete(`${API_URL}/habits/${habitId}/complete/${completionId}`, {
      headers: getAuthHeader()
    });
  },

  // Get habit streak
  getStreak: async (habitId: number): Promise<Streak> => {
    const response = await axios.get(
      `${API_URL}/habits/${habitId}/streak`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};