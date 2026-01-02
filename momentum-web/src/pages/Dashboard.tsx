// FILE: momentum-web/src/pages/Dashboard.tsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HabitList from '../components/HabitList';
import Statistics from '../components/Statistics';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'habits' | 'stats'>('habits');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>Momentum</h2>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          📋 Habits
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      <main className="dashboard-main">
        {activeTab === 'habits' ? <HabitList /> : <Statistics />}
      </main>
    </div>
  );
};

export default Dashboard;