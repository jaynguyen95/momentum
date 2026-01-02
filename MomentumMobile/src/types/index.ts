export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Habit {
  id: number;
  user_id: number;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target_count: number;
  color: string;
  icon?: string;
  category_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: number;
  habit_id: number;
  user_id: number;
  completed_date: string;
  created_at: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface DailyGoal {
  id: number;
  user_id: number;
  target_completions: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency?: string;
  target_count?: number;
  color?: string;
  icon?: string;
  category_id?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}