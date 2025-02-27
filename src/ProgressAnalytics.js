import React, { useState, useEffect, useRef } from 'react';

const ProgressAnalytics = ({ navigateTo }) => {
  const [workoutData, setWorkoutData] = useState([]);
  const [nutritionData, setNutritionData] = useState({});
  const [selectedExercise, setSelectedExercise] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [activeTab, setActiveTab] = useState('workout');
  const weightChartRef = useRef(null);
  const volumeChartRef = useRef(null);
  const frequencyChartRef = useRef(null);
  const calorieChartRef = useRef(null);
  
  // Load data from session storage
  useEffect(() => {
    const savedWorkouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
    const savedNutrition = JSON.parse(sessionStorage.getItem('nutritionDailyLog')) || {};
    
    setWorkoutData(savedWorkouts);
    setNutritionData(savedNutrition);
    
    // Extract unique exercises for the dropdown
    const allExercises = new Set();
    savedWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        allExercises.add(exercise.name);
      });
    });
    
    setExerciseOptions(Array.from(allExercises).sort());
    if (allExercises.size > 0) {
      setSelectedExercise(Array.from(allExercises)[0]);
    }
  }, []);
  
  // Render charts when data, selected exercise, or time range changes
  useEffect(() => {
    if (workoutData.length > 0 && selectedExercise) {
      renderWeightChart();
      renderVolumeChart();
    }
    
    renderFrequencyChart();
    
    if (Object.keys(nutritionData).length > 0) {
      renderCalorieChart();
    }
  }, [workoutData, nutritionData, selectedExercise, timeRange, activeTab]);
  
  const getDateRangeData = (data) => {
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - parseInt(timeRange));
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };
  
  const getExerciseProgressData = () => {
    const filteredWorkouts = getDateRangeData(workoutData);
    const progressData = [];
    
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.name === selectedExercise && exercise.sets.length > 0) {
          // Find the heaviest weight set
          const maxWeightSet = exercise.sets.reduce((max, set) => 
            (parseFloat(set.weight) > parseFloat(max.weight)) ? set : max
          , exercise.sets[0]);
          
          // Calculate total volume (weight * reps) for the exercise
          const totalVolume = exercise.sets.reduce((sum, set) => 
            sum + (parseFloat(set.weight) * parseFloat(set.reps))
          , 0);
          
          progressData.push({
            date: workout.date,
            maxWeight: parseFloat(maxWeightSet.weight),
            totalVolume: totalVolume
          });
        }
      });
    });
    
    // Sort by date
    progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return progressData;
  };
  
  const renderWeightChart = () => {
    const progressData = getExerciseProgressData();
    
    if (progressData.length === 0) return;
    
    const chartCanvas = weightChartRef.current;
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Clear previous chart
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = chartCanvas.width - padding * 2;
    const chartHeight = chartCanvas.height - padding * 2;
    
    // Find min and max values
    const maxWeight = Math.max(...progressData.map(d => d.maxWeight));
    const minWeight = Math.min(...progressData.map(d => d.maxWeight));
    const range = maxWeight - minWeight;
    
    // Scale for y-axis
    const yScale = range > 0 ? chartHeight / (range * 1.1) : chartHeight;
    const yOffset = minWeight * 0.9;
    
    // Draw axis
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, chartHeight + padding);
    ctx.lineTo(chartWidth + padding, chartHeight + padding);
    ctx.stroke();
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    
    // Y-axis labels
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
      const y = chartHeight + padding - (i * chartHeight / numYLabels);
      const labelValue = yOffset + (i * range / numYLabels);
      ctx.fillText(labelValue.toFixed(1) + ' kg', padding - 5, y + 4);
      
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth + padding, y);
      ctx.stroke();
    }
    
    // X-axis labels (dates)
    ctx.textAlign = 'center';
    const numPoints = progressData.length;
    const xStep = chartWidth / (numPoints > 1 ? numPoints - 1 : 1);
    
    progressData.forEach((point, i) => {
      const x = padding + i * xStep;
      const date = new Date(point.date);
      const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      if (i % Math.max(1, Math.floor(numPoints / 8)) === 0 || i === numPoints - 1) {
        ctx.fillText(label, x, chartHeight + padding + 20);
      }
    });
    
    // Plot the line
    ctx.beginPath();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    
    progressData.forEach((point, i) => {
      const x = padding + i * xStep;
      const y = chartHeight + padding - ((point.maxWeight - yOffset) * yScale);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Plot points
    ctx.fillStyle = '#8B5CF6';
    progressData.forEach((point, i) => {
      const x = padding + i * xStep;
      const y = chartHeight + padding - ((point.maxWeight - yOffset) * yScale);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Chart title
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`Max Weight Progression for ${selectedExercise}`, chartCanvas.width / 2, 20);
  };
  
  const renderVolumeChart = () => {
    const progressData = getExerciseProgressData();
    
    if (progressData.length === 0) return;
    
    const chartCanvas = volumeChartRef.current;
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Clear previous chart
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = chartCanvas.width - padding * 2;
    const chartHeight = chartCanvas.height - padding * 2;
    
    // Find max value
    const maxVolume = Math.max(...progressData.map(d => d.totalVolume));
    
    // Scale for y-axis
    const yScale = maxVolume > 0 ? chartHeight / (maxVolume * 1.1) : chartHeight;
    
    // Bar width
    const numBars = progressData.length;
    const barWidth = chartWidth / numBars * 0.7;
    const barSpacing = chartWidth / numBars * 0.3;
    
    // Draw axis
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, chartHeight + padding);
    ctx.lineTo(chartWidth + padding, chartHeight + padding);
    ctx.stroke();
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    
    // Y-axis labels
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
      const y = chartHeight + padding - (i * chartHeight / numYLabels);
      const labelValue = (i * maxVolume / numYLabels);
      ctx.fillText(labelValue.toFixed(0), padding - 5, y + 4);
      
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth + padding, y);
      ctx.stroke();
    }
    
    // X-axis labels (dates)
    ctx.textAlign = 'center';
    const xStep = chartWidth / numBars;
    
    progressData.forEach((point, i) => {
      const x = padding + i * xStep + xStep / 2;
      const date = new Date(point.date);
      const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      if (i % Math.max(1, Math.floor(numBars / 6)) === 0 || i === numBars - 1) {
        ctx.fillText(label, x, chartHeight + padding + 20);
      }
    });
    
    // Draw bars
    progressData.forEach((point, i) => {
      const x = padding + i * xStep + barSpacing / 2;
      const barHeight = point.totalVolume * yScale;
      const y = chartHeight + padding - barHeight;
      
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(x, y, barWidth, barHeight);
    });
    
    // Chart title
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`Total Volume Progression for ${selectedExercise}`, chartCanvas.width / 2, 20);
  };
  
  const renderFrequencyChart = () => {
    const filteredWorkouts = getDateRangeData(workoutData);
    
    const chartCanvas = frequencyChartRef.current;
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Clear previous chart
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = chartCanvas.width - padding * 2;
    const chartHeight = chartCanvas.height - padding * 2;
    
    // Create workout frequency data by day
    const frequencyByDay = {};
    
    // Initialize all days in range
    const today = new Date();
    for (let i = 0; i < parseInt(timeRange); i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      frequencyByDay[dateString] = 0;
    }
    
    // Count workouts by day
    filteredWorkouts.forEach(workout => {
      const dateString = new Date(workout.date).toISOString().split('T')[0];
      if (frequencyByDay.hasOwnProperty(dateString)) {
        frequencyByDay[dateString]++;
      }
    });
    
    // Sort by date
    const sortedDates = Object.keys(frequencyByDay).sort();
    
    // Find max value
    const maxFrequency = Math.max(...Object.values(frequencyByDay), 1);
    
    // Scale for y-axis
    const yScale = chartHeight / (maxFrequency * 1.1);
    
    // Bar width
    const numBars = sortedDates.length;
    const barWidth = chartWidth / numBars * 0.7;
    const barSpacing = chartWidth / numBars * 0.3;
    
    // Draw axis
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, chartHeight + padding);
    ctx.lineTo(chartWidth + padding, chartHeight + padding);
    ctx.stroke();
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    
    // Y-axis labels
    for (let i = 0; i <= maxFrequency; i++) {
      const y = chartHeight + padding - (i * yScale);
      ctx.fillText(i.toString(), padding - 5, y + 4);
      
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth + padding, y);
      ctx.stroke();
    }
    
    // X-axis labels (dates)
    ctx.textAlign = 'center';
    const xStep = chartWidth / numBars;
    
    sortedDates.forEach((dateString, i) => {
      const x = padding + i * xStep + xStep / 2;
      const date = new Date(dateString);
      
      // Show labels for first and last days, plus some in between
      if (i === 0 || i === numBars - 1 || i % Math.floor(numBars / 4) === 0) {
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, chartHeight + padding + 20);
      }
    });
    
    // Draw bars
    sortedDates.forEach((dateString, i) => {
      const frequency = frequencyByDay[dateString];
      const x = padding + i * xStep + barSpacing / 2;
      const barHeight = frequency * yScale;
      const y = chartHeight + padding - barHeight;
      
      // Color bars based on frequency
      if (frequency === 0) {
        ctx.fillStyle = '#e5e7eb';
      } else {
        ctx.fillStyle = '#8B5CF6';
      }
      
      ctx.fillRect(x, y, barWidth, barHeight);
    });
    
    // Chart title
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Workout Frequency', chartCanvas.width / 2, 20);
  };
  
  const renderCalorieChart = () => {
    if (Object.keys(nutritionData).length === 0) return;
    
    const chartCanvas = calorieChartRef.current;
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Clear previous chart
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = chartCanvas.width - padding * 2;
    const chartHeight = chartCanvas.height - padding * 2;
    
    // Filter dates based on time range
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - parseInt(timeRange));
    
    // Process nutrition data
    const calorieData = {};
    
    Object.keys(nutritionData).forEach(dateString => {
      const date = new Date(dateString);
      if (date >= cutoffDate) {
        const dayMeals = nutritionData[dateString];
        const totalCalories = dayMeals.reduce((sum, meal) => sum + parseFloat(meal.calories), 0);
        calorieData[dateString] = totalCalories;
      }
    });
    
    // Sort by date
    const sortedDates = Object.keys(calorieData).sort();
    
    // Find max value
    const maxCalories = Math.max(...Object.values(calorieData), 2000);
    
    // Scale for y-axis
    const yScale = chartHeight / (maxCalories * 1.1);
    
    // Line plot points
    const points = sortedDates.map((dateString, index) => {
      return {
        x: padding + (index / (sortedDates.length - 1 || 1)) * chartWidth,
        y: chartHeight + padding - (calorieData[dateString] * yScale)
      };
    });
    
    // Draw axis
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, chartHeight + padding);
    ctx.lineTo(chartWidth + padding, chartHeight + padding);
    ctx.stroke();
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    
    // Y-axis labels
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
      const y = chartHeight + padding - (i * chartHeight / numYLabels);
      const labelValue = (i * maxCalories / numYLabels);
      ctx.fillText(labelValue.toFixed(0), padding - 5, y + 4);
      
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth + padding, y);
      ctx.stroke();
    }
    
    // X-axis labels (dates)
    ctx.textAlign = 'center';
    
    sortedDates.forEach((dateString, i) => {
      if (i === 0 || i === sortedDates.length - 1 || i % Math.max(1, Math.floor(sortedDates.length / 5)) === 0) {
        const date = new Date(dateString);
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const x = padding + (i / (sortedDates.length - 1 || 1)) * chartWidth;
        ctx.fillText(label, x, chartHeight + padding + 20);
      }
    });
    
    // Draw line
    if (points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = '#10B981';
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Chart title
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Calorie Intake Over Time', chartCanvas.width / 2, 20);
  };
  
  const getWorkoutStats = () => {
    if (!workoutData || workoutData.length === 0) {
      return { total: 0, avgDuration: '0m', mostCommon: 'N/A' };
    }
    
    const filteredWorkouts = getDateRangeData(workoutData);
    
    // Calculate average workout duration
    let totalDurationMinutes = 0;
    filteredWorkouts.forEach(workout => {
      if (workout.date && workout.endTime) {
        const start = new Date(workout.date);
        const end = new Date(workout.endTime);
        const durationMs = end - start;
        totalDurationMinutes += durationMs / 60000; // Convert to minutes
      }
    });
    
    const avgDuration = filteredWorkouts.length > 0 
      ? Math.round(totalDurationMinutes / filteredWorkouts.length)
      : 0;
      
    // Find most common exercise
    const exerciseCount = {};
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
      });
    });
    
    let mostCommonExercise = 'N/A';
    let maxCount = 0;
    
    Object.entries(exerciseCount).forEach(([exercise, count]) => {
      if (count > maxCount) {
        mostCommonExercise = exercise;
        maxCount = count;
      }
    });
    
    return {
      total: filteredWorkouts.length,
      avgDuration: avgDuration > 60 
        ? `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m` 
        : `${avgDuration}m`,
      mostCommon: mostCommonExercise
    };
  };
  
  const getNutritionStats = () => {
    if (!nutritionData || Object.keys(nutritionData).length === 0) {
      return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };
    }
    
    // Filter dates based on time range
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - parseInt(timeRange));
    
    let totalDays = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    Object.keys(nutritionData).forEach(dateString => {
      const date = new Date(dateString);
      if (date >= cutoffDate) {
        totalDays++;
        const dayMeals = nutritionData[dateString];
        
        dayMeals.forEach(meal => {
          totalCalories += parseFloat(meal.calories);
          totalProtein += parseFloat(meal.protein);
          totalCarbs += parseFloat(meal.carbs);
          totalFat += parseFloat(meal.fat);
        });
      }
    });
    
    return {
      avgCalories: totalDays > 0 ? Math.round(totalCalories / totalDays) : 0,
      avgProtein: totalDays > 0 ? Math.round(totalProtein / totalDays) : 0,
      avgCarbs: totalDays > 0 ? Math.round(totalCarbs / totalDays) : 0,
      avgFat: totalDays > 0 ? Math.round(totalFat / totalDays) : 0
    };
  };
  
  const workoutStats = getWorkoutStats();
  const nutritionStats = getNutritionStats();
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigateTo('home')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Home
        </button>
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-purple-600 dark:text-purple-400">
          <i className="fas fa-chart-line mr-2"></i>Progress Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Visualize your fitness journey and track improvements</p>
      </header>
      
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">Performance Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Data from {workoutData.length > 0 ? formatDate(workoutData[0].date) : 'N/A'} to present
              </p>
            </div>
            <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 180 days</option>
                <option value="365">Last year</option>
              </select>
              
              <div className="flex">
                <button 
                  className={`px-4 py-2 rounded-l-lg ${activeTab === 'workout' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setActiveTab('workout')}
                >
                  Workout
                </button>
                <button 
                  className={`px-4 py-2 rounded-r-lg ${activeTab === 'nutrition' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setActiveTab('nutrition')}
                >
                  Nutrition
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {activeTab === 'workout' ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Workouts</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{workoutStats.total}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Duration</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{workoutStats.avgDuration}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Most Common Exercise</h3>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400 truncate">{workoutStats.mostCommon}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Workout Consistency</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {workoutStats.total > 0 && timeRange 
                      ? Math.round((workoutStats.total / parseInt(timeRange)) * 100) + '%'
                      : '0%'
                    }
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Daily Calories</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{nutritionStats.avgCalories}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Protein (g)</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{nutritionStats.avgProtein}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Carbs (g)</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{nutritionStats.avgCarbs}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Fat (g)</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{nutritionStats.avgFat}</p>
                </div>
              </>
            )}
          </div>
          
          {activeTab === 'workout' ? (
            <>
              {/* Exercise Select (only in workout tab) */}
              {exerciseOptions.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="exercise-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Exercise for Analysis
                  </label>
                  <select
                    id="exercise-select"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                  >
                    {exerciseOptions.map(exercise => (
                      <option key={exercise} value={exercise}>{exercise}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Weight Progress Chart */}
              <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg">
                <canvas ref={weightChartRef} height="250"></canvas>
              </div>
              
              {/* Volume Progress Chart */}
              <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg">
                <canvas ref={volumeChartRef} height="250"></canvas>
              </div>
              
              {/* Workout Frequency Chart */}
              <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg">
                <canvas ref={frequencyChartRef} height="250"></canvas>
              </div>
            </>
          ) : (
            <>
              {/* Calorie Intake Chart */}
              <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg">
                <canvas ref={calorieChartRef} height="250"></canvas>
              </div>
              
              {/* Placeholder for future nutrition analysis */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                  <i className="fas fa-lightbulb mr-2"></i>Nutrition Insights
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {nutritionStats.avgCalories > 0 
                    ? `Your average daily caloric intake is ${nutritionStats.avgCalories} calories with ${nutritionStats.avgProtein}g of protein.`
                    : 'Start tracking your nutrition to see insights here.'}
                </p>
                
                {nutritionStats.avgCalories > 0 && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Macronutrient Distribution</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-600">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ 
                            width: `${Math.min(100, (nutritionStats.avgProtein * 4 / (nutritionStats.avgCalories || 1) * 100) || 0)}%` 
                          }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Protein</p>
                        <p className="font-semibold text-blue-500">{
                          ((nutritionStats.avgProtein * 4 / (nutritionStats.avgCalories || 1)) * 100).toFixed(1)
                        }%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-600">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ 
                            width: `${Math.min(100, (nutritionStats.avgCarbs * 4 / (nutritionStats.avgCalories || 1) * 100) || 0)}%` 
                          }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Carbs</p>
                        <p className="font-semibold text-green-500">{
                          ((nutritionStats.avgCarbs * 4 / (nutritionStats.avgCalories || 1)) * 100).toFixed(1)
                        }%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-600">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ 
                            width: `${Math.min(100, (nutritionStats.avgFat * 9 / (nutritionStats.avgCalories || 1) * 100) || 0)}%` 
                          }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Fat</p>
                        <p className="font-semibold text-yellow-500">{
                          ((nutritionStats.avgFat * 9 / (nutritionStats.avgCalories || 1)) * 100).toFixed(1)
                        }%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* No Data Message */}
          {(activeTab === 'workout' && workoutData.length === 0) || (activeTab === 'nutrition' && Object.keys(nutritionData).length === 0) ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <i className="fas fa-chart-bar text-5xl text-gray-300 dark:text-gray-500 mb-4"></i>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                No data available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {activeTab === 'workout' 
                  ? 'Start recording your workouts to see analytics and track your progress over time.'
                  : 'Start logging your nutrition to see calorie and macronutrient trends.'
                }
              </p>
              <button
                onClick={() => navigateTo(activeTab === 'workout' ? 'workoutlog' : 'nutritiontracker')}
                className={`mt-4 px-5 py-2.5 rounded-lg text-white font-medium
                  ${activeTab === 'workout' 
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
              >
                {activeTab === 'workout' ? 'Go to Workout Log' : 'Go to Nutrition Tracker'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-300">Analysis Tips</h2>
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2 text-lg">
              <i className="fas fa-chart-line mr-2"></i>Progressive Overload
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Track your weight progression to ensure you're gradually increasing resistance over time. 
              This is key for continuous strength and muscle gains.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 text-lg">
              <i className="fas fa-dumbbell mr-2"></i>Volume Tracking
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Total volume (weight × reps) is a great indicator of workout effectiveness. 
              Increasing volume generally leads to better muscle development and strength gains.
            </p>
          </div>
          
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900 rounded-lg">
            <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2 text-lg">
              <i className="fas fa-calendar-check mr-2"></i>Consistency
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Regular training is more important than occasional intense sessions. 
              Aim for consistent workouts to see continuous improvements in strength and fitness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;