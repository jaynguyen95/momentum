import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Habit,
  Completion,
  Streak,
  Category,
  DailyGoal,
  CreateHabitInput,
  AuthResponse,
  User,
} from '../types';

// Update this to your computer's IP address when testing on physical device
// Find it with: ipconfig getifaddr en0 (Mac) or ipconfig (Windows)
const API_URL = 'http://192.168.1.75:3001/api';

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
};

export const habitService = {
  getHabits: async (): Promise<Habit[]> => {
    const response = await axios.get(`${API_URL}/habits`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  },

  createHabit: async (habit: CreateHabitInput): Promise<Habit> => {
    const response = await axios.post(`${API_URL}/habits`, habit, {
      headers: await getAuthHeader(),
    });
    return response.data;
  },

  updateHabit: async (
    id: number,
    habit: Partial<CreateHabitInput>,
  ): Promise<Habit> => {
    const response = await axios.put(`${API_URL}/habits/${id}`, habit, {
      headers: await getAuthHeader(),
    });
    return response.data;
  },

  deleteHabit: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/habits/${id}`, {
      headers: await getAuthHeader(),
    });
  },

  completeHabit: async (habitId: number): Promise<Completion> => {
    const response = await axios.post(
      `${API_URL}/habits/${habitId}/complete`,
      {},
      {
        headers: await getAuthHeader(),
      },
    );
    return response.data;
  },

  undoTodayCompletion: async (habitId: number): Promise<void> => {
    await axios.delete(`${API_URL}/habits/${habitId}/complete-today`, {
      headers: await getAuthHeader(),
    });
  },

  getCompletions: async (
    habitId: number,
    startDate: string,
    endDate: string,
  ): Promise<Completion[]> => {
    const response = await axios.get(
      `${API_URL}/habits/${habitId}/completions`,
      {
        params: { start_date: startDate, end_date: endDate },
        headers: await getAuthHeader(),
      },
    );
    return response.data;
  },

  getStreak: async (habitId: number): Promise<Streak> => {
    const response = await axios.get(`${API_URL}/habits/${habitId}/streak`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  },
};

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  },

  createCategory: async (category: {
    name: string;
    color?: string;
    icon?: string;
  }): Promise<Category> => {
    const response = await axios.post(`${API_URL}/categories`, category, {
      headers: await getAuthHeader(),
    });
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/categories/${id}`, {
      headers: await getAuthHeader(),
    });
  },
};

export const goalService = {
  getDailyGoal: async (): Promise<DailyGoal> => {
    const response = await axios.get(`${API_URL}/goals`, {
      headers: await getAuthHeader(),
    });
    return response.data;
  },

  updateDailyGoal: async (targetCompletions: number): Promise<DailyGoal> => {
    const response = await axios.put(
      `${API_URL}/goals`,
      {target_completions: targetCompletions},
      {headers: await getAuthHeader()},
    );
    return response.data;
  },
};