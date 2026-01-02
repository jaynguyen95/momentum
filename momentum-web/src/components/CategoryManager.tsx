import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import type { Category, CreateCategoryInput } from '../types/habit';
import toast from 'react-hot-toast';
import '../styles/CategoryManager.css';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    color: '#667eea',
    icon: '📁'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await habitService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      await habitService.createCategory(formData);
      setFormData({ name: '', color: '#667eea', icon: '📁' });
      setIsAdding(false);
      await fetchCategories();
      toast.success('Category created! 📁');
    } catch (err: any) {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category? Habits will not be deleted.')) {
      return;
    }

    try {
      await habitService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error('Failed to delete category');
    }
  };

  const icons = ['📁', '💼', '🏃', '📚', '🎯', '💪', '🧘', '🎨', '🍎', '🌟'];
  const colors = [
    '#667eea', '#48bb78', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ];

  return (
    <div className="category-manager">
      <div className="category-header">
        <h3>Categories</h3>
        <button 
          className="btn-add-category"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? '✕' : '+ Add'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="category-form">
          <div className="form-group">
            <label>Icon</label>
            <div className="icon-picker">
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Health & Fitness"
              required
            />
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

          <button type="submit" className="btn-create-category">
            Create Category
          </button>
        </form>
      )}

      <div className="categories-list">
        {categories.map(category => (
          <div 
            key={category.id} 
            className="category-item"
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <button 
              className="btn-delete-category"
              onClick={() => handleDelete(category.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isAdding && (
        <p className="no-categories">No categories yet. Create one to organize your habits!</p>
      )}
    </div>
  );
};

export default CategoryManager; 3