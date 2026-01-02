import React, { useState } from 'react';
import { habitService } from '../services/habitService';
import type { CreateHabitInput } from '../types/habit';
import type { Habit } from '../types/habit';
import '../styles/EditHabitModal.css';

interface EditHabitModalProps {
  habit: Habit;
  onClose: () => void;
  onHabitUpdated: () => void;
}

const EditHabitModal: React.FC<EditHabitModalProps> = ({ habit, onClose, onHabitUpdated }) => {
  const [formData, setFormData] = useState<CreateHabitInput>({
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    target_count: habit.target_count,
    color: habit.color,
    icon: habit.icon
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert('Habit name is required');
      return;
    }

    try {
      setLoading(true);
      await habitService.updateHabit(habit.id, formData);
      onHabitUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update habit');
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Habit</h3>
          <button className="btn-close" onClick={onClose}>×</button>
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
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHabitModal;