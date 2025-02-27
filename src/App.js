import React, { useState } from 'react';
import './App.css';
import Home from './Home';
import WorkoutLog from './WorkoutLog';
import NutritionTracker from './NutritionTracker';
import ProgressAnalytics from './ProgressAnalytics';

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app-container">
      {currentPage === 'home' && <Home navigateTo={navigateTo} />}
      {currentPage === 'workoutlog' && <WorkoutLog navigateTo={navigateTo} />}
      {currentPage === 'nutritiontracker' && <NutritionTracker navigateTo={navigateTo} />}
      {currentPage === 'progressanalytics' && <ProgressAnalytics navigateTo={navigateTo} />}
    </div>
  );
};

export default App;