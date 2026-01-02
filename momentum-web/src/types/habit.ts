export interface Habit {
  id: number;
  user_id: number;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target_count: number;
  color: string;
  icon?: string;
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

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency?: string;
  target_count?: number;
  color?: string;
  icon?: string;
}