import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import type { CreateHabitInput } from '../types/habit';
import type { Category } from '../types/habit';
import toast from 'react-hot-toast';
import '../styles/CreateHabitForm.css';

interface CreateHabitFormProps {
  onHabitCreated: () => void;
}

const CreateHabitForm: React.FC<CreateHabitFormProps> = ({ onHabitCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateHabitInput>({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
    color: '#3b82f6',
    category_id: undefined
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const data = await habitService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Habit name is required');
      return;
    }

    try {
      setLoading(true);
      await habitService.createHabit(formData);
      setFormData({
        name: '',
        description: '',
        frequency: 'daily',
        target_count: 1,
        color: '#3b82f6',
        category_id: undefined
      });
      setIsOpen(false);
      onHabitCreated();
      toast.success('Habit created! 🎉');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ];

  return (
    <div className="create-habit-container">
      {!isOpen ? (
        <button 
          className="btn-create-habit"
          onClick={() => setIsOpen(true)}
        >
          + Create New Habit
        </button>
      ) : (
        <div className="create-habit-form">
          <div className="form-header">
            <h3>Create New Habit</h3>
            <button 
              className="btn-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Habit Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Run"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this habit involve?"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category (Optional)</label>
              <select
                id="category"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  category_id: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              >
                <option value="">No category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequency">Frequency</label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="target_count">Target Count</label>
                <input
                  type="number"
                  id="target_count"
                  value={formData.target_count}
                  onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Habit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateHabitForm;