import React from 'react';

const Home = ({ navigateTo }) => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3 text-primary dark:text-primary">
          <i className="fas fa-heartbeat mr-2"></i>Fitness Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Your personal fitness companion</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
          <div className="h-40 bg-primary flex items-center justify-center text-white">
            <i className="fas fa-dumbbell text-5xl"></i>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Workout Log</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Record and track your workouts, sets, and reps. Monitor your progress over time.
            </p>
            <button
              onClick={() => navigateTo('workoutlog')}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-lg py-2.5 px-4 transition-colors duration-200"
            >
              Open Workout Log
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
          <div className="h-40 bg-emerald-500 flex items-center justify-center text-white">
            <i className="fas fa-utensils text-5xl"></i>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Nutrition Tracker</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Track your meals, calories, and macronutrients. Plan your diet for optimal results.
            </p>
            <button
              onClick={() => navigateTo('nutritiontracker')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg py-2.5 px-4 transition-colors duration-200"
            >
              Open Nutrition Tracker
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
          <div className="h-40 bg-purple-500 flex items-center justify-center text-white">
            <i className="fas fa-chart-line text-5xl"></i>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Progress Analytics</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Visualize your fitness journey with detailed charts and progress indicators.
            </p>
            <button
              onClick={() => navigateTo('progressanalytics')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg py-2.5 px-4 transition-colors duration-200"
            >
              Open Progress Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">About This App</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-3">
          This fitness tracking application helps you manage your fitness journey with various tools designed to monitor and improve your progress.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Our Workout Log helps you record exercises, sets, and reps. The Nutrition Tracker monitors your calorie and macronutrient intake. 
          With Progress Analytics, you can visualize your fitness data to identify trends and improvements over time.
        </p>
      </div>
    </div>
  );
};

export default Home;