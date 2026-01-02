import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import type { DailyGoal as DailyGoalType } from '../types/habit';
import toast from 'react-hot-toast';
import '../styles/DailyGoal.css';

interface DailyGoalProps {
  completedToday: number;
}

const DailyGoal: React.FC<DailyGoalProps> = ({ completedToday }) => {
  const [goal, setGoal] = useState<DailyGoalType | null>(null);
  const [editing, setEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(3);

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const data = await habitService.getDailyGoal();
      setGoal(data);
      setNewTarget(data.target_completions);
    } catch (err: any) {
      console.error('Failed to fetch goal:', err);
    }
  };

  const handleUpdateGoal = async () => {
    try {
      const updated = await habitService.updateDailyGoal(newTarget);
      setGoal(updated);
      setEditing(false);
      toast.success('Daily goal updated! 🎯');
    } catch (err: any) {
      toast.error('Failed to update goal');
    }
  };

  if (!goal) return null;

  const progress = (completedToday / goal.target_completions) * 100;
  const isComplete = completedToday >= goal.target_completions;

  return (
    <div className={`daily-goal-widget ${isComplete ? 'complete' : ''}`}>
      <div className="daily-goal-header">
        <h3>🎯 Daily Goal</h3>
        {!editing && (
          <button 
            className="btn-edit-goal"
            onClick={() => setEditing(true)}
          >
            ✎
          </button>
        )}
      </div>

      {editing ? (
        <div className="goal-edit">
          <label>Target completions per day:</label>
          <div className="goal-input-group">
            <input
              type="number"
              min="1"
              max="20"
              value={newTarget}
              onChange={(e) => setNewTarget(parseInt(e.target.value))}
            />
            <button onClick={handleUpdateGoal} className="btn-save">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="goal-progress">
            <div className="goal-stats">
              <span className="goal-current">{completedToday}</span>
              <span className="goal-separator">/</span>
              <span className="goal-target">{goal.target_completions}</span>
              <span className="goal-label">habits completed</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {isComplete && (
            <div className="goal-celebration">
              🎉 Goal reached! Great job today!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DailyGoal;