import React, { useState, useEffect, useRef } from 'react';

// Food database with common foods and their nutritional values per 100g
const foodDatabase = {
  fruits: [
    { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    { name: "Banana", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
    { name: "Orange", calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1 },
    { name: "Strawberry", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
    { name: "Blueberry", calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
    { name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7 }
  ],
  vegetables: [
    { name: "Broccoli", calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 },
    { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    { name: "Carrot", calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
    { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    { name: "Cucumber", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
    { name: "Bell Pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3 }
  ],
  grains: [
    { name: "White Rice (cooked)", calories: 130, protein: 2.7, carbs: 28.7, fat: 0.3 },
    { name: "Brown Rice (cooked)", calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9 },
    { name: "Oats", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
    { name: "Quinoa (cooked)", calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
    { name: "Whole Wheat Bread", calories: 247, protein: 13, carbs: 41, fat: 3.4 },
    { name: "White Bread", calories: 265, protein: 9, carbs: 49, fat: 3.2 }
  ],
  proteins: [
    { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "Salmon", calories: 206, protein: 22, carbs: 0, fat: 13 },
    { name: "Beef (lean)", calories: 250, protein: 26, carbs: 0, fat: 17 },
    { name: "Egg", calories: 155, protein: 12.6, carbs: 0.6, fat: 11 },
    { name: "Tofu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
    { name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4 }
  ],
  dairy: [
    { name: "Milk (whole)", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
    { name: "Milk (skim)", calories: 34, protein: 3.4, carbs: 5, fat: 0.1 },
    { name: "Cheddar Cheese", calories: 402, protein: 24.9, carbs: 1.3, fat: 33.1 },
    { name: "Cottage Cheese", calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3 },
    { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
    { name: "Yogurt (plain)", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 }
  ],
  snacks: [
    { name: "Chocolate", calories: 535, protein: 7.7, carbs: 59.4, fat: 30 },
    { name: "Potato Chips", calories: 536, protein: 7, carbs: 53, fat: 35 },
    { name: "Almonds", calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9 },
    { name: "Walnuts", calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2 },
    { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fat: 50 },
    { name: "Dark Chocolate", calories: 598, protein: 7.8, carbs: 45.9, fat: 42.6 }
  ],
  beverages: [
    { name: "Orange Juice", calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2 },
    { name: "Apple Juice", calories: 46, protein: 0.1, carbs: 11.3, fat: 0.1 },
    { name: "Coca Cola", calories: 42, protein: 0, carbs: 10.6, fat: 0 },
    { name: "Beer", calories: 43, protein: 0.5, carbs: 3.6, fat: 0 },
    { name: "Red Wine", calories: 85, protein: 0.1, carbs: 2.6, fat: 0 },
    { name: "Coffee (black)", calories: 2, protein: 0.1, carbs: 0, fat: 0 }
  ]
};

// Main NutritionTracker Component
const NutritionTracker = ({ navigateTo }) => {
  const [meals, setMeals] = useState([]);
  const [dailyLog, setDailyLog] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customFood, setCustomFood] = useState({ 
    name: '', 
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '' 
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const suggestionsRef = useRef(null);
  
  // Load nutrition data from session storage
  useEffect(() => {
    const savedDailyLog = JSON.parse(sessionStorage.getItem('nutritionDailyLog')) || {};
    if (Object.keys(savedDailyLog).length > 0) {
      setDailyLog(savedDailyLog);
    }
    
    // If there's data for today, load it
    const today = new Date().toISOString().split('T')[0];
    if (savedDailyLog[today]) {
      setMeals(savedDailyLog[today]);
    } else {
      setMeals([]);
    }
  }, []);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // When date changes, load the meals for that date
  useEffect(() => {
    if (dailyLog[selectedDate]) {
      setMeals(dailyLog[selectedDate]);
    } else {
      setMeals([]);
    }
  }, [selectedDate, dailyLog]);
  
  // Save nutrition data to session storage whenever meals change
  useEffect(() => {
    const updatedDailyLog = {
      ...dailyLog,
      [selectedDate]: meals
    };
    
    setDailyLog(updatedDailyLog);
    sessionStorage.setItem('nutritionDailyLog', JSON.stringify(updatedDailyLog));
  }, [meals]);
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowSuggestions(true);
    setSearchTerm('');
  };
  
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setShowSuggestions(false);
    setSearchTerm(food.name);
  };
  
  const handleAddMeal = (e) => {
    e.preventDefault();
    
    if (!selectedFood) {
      alert('Please select a food item first');
      return;
    }
    
    const newMeal = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      food: selectedFood.name,
      quantity: Number(quantity),
      calories: (selectedFood.calories * quantity / 100).toFixed(1),
      protein: (selectedFood.protein * quantity / 100).toFixed(1),
      carbs: (selectedFood.carbs * quantity / 100).toFixed(1),
      fat: (selectedFood.fat * quantity / 100).toFixed(1)
    };
    
    setMeals([...meals, newMeal]);
    setSelectedFood(null);
    setQuantity(100);
    setSearchTerm('');
  };
  
  const handleRemoveMeal = (mealId) => {
    setMeals(meals.filter(meal => meal.id !== mealId));
  };
  
  const handleAddCustomFood = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!customFood.name.trim() || !customFood.calories || !customFood.protein || !customFood.carbs || !customFood.fat) {
      alert('Please fill in all fields for the custom food');
      return;
    }
    
    const newMeal = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      food: customFood.name,
      quantity: Number(quantity),
      calories: (Number(customFood.calories) * quantity / 100).toFixed(1),
      protein: (Number(customFood.protein) * quantity / 100).toFixed(1),
      carbs: (Number(customFood.carbs) * quantity / 100).toFixed(1),
      fat: (Number(customFood.fat) * quantity / 100).toFixed(1)
    };
    
    setMeals([...meals, newMeal]);
    setCustomFood({ 
      name: '', 
      calories: '', 
      protein: '', 
      carbs: '', 
      fat: '' 
    });
    setQuantity(100);
    setShowCustomForm(false);
  };
  
  const resetForm = () => {
    setSelectedFood(null);
    setSelectedCategory('');
    setQuantity(100);
    setSearchTerm('');
    setShowSuggestions(false);
  };
  
  const getDailyTotals = () => {
    return meals.reduce((totals, meal) => {
      return {
        calories: (parseFloat(totals.calories) + parseFloat(meal.calories)).toFixed(1),
        protein: (parseFloat(totals.protein) + parseFloat(meal.protein)).toFixed(1),
        carbs: (parseFloat(totals.carbs) + parseFloat(meal.carbs)).toFixed(1),
        fat: (parseFloat(totals.fat) + parseFloat(meal.fat)).toFixed(1)
      };
    }, { calories: '0.0', protein: '0.0', carbs: '0.0', fat: '0.0' });
  };
  
  // Get all foods from all categories
  const getAllFoods = () => {
    return Object.values(foodDatabase).flat();
  };
  
  // Filter foods based on search term
  const filterFoods = () => {
    if (!searchTerm) {
      return selectedCategory ? foodDatabase[selectedCategory] : [];
    }
    
    const foods = selectedCategory ? foodDatabase[selectedCategory] : getAllFoods();
    return foods.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigateTo('home')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Home
        </button>
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-emerald-500 dark:text-emerald-400">
          <i className="fas fa-utensils mr-2"></i>Nutrition Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Monitor your calorie and macronutrient intake</p>
      </header>
      
      {!showHistory ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Daily Food Log</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center text-emerald-500 dark:text-emerald-400 hover:underline"
              >
                <i className="fas fa-calendar-alt mr-2"></i> View History
              </button>
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Add Food</h3>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Food Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(foodDatabase).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors duration-200 
                        ${selectedCategory === category 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {!showCustomForm ? (
                <form onSubmit={handleAddMeal} className="mb-4">
                  <div className="mb-4">
                    <label htmlFor="food-search" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Search Food
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="food-search"
                        ref={searchInputRef}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        placeholder="Search for a food item..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                      />
                      
                      {showSuggestions && (
                        <div 
                          ref={suggestionsRef}
                          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {filterFoods().length > 0 ? (
                            filterFoods().map((food, index) => (
                              <div 
                                key={index}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex justify-between"
                                onClick={() => handleFoodSelect(food)}
                              >
                                <span className="text-gray-900 dark:text-white">{food.name}</span>
                                <span className="text-gray-500 dark:text-gray-400">{food.calories} cal/100g</span>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                              No foods found. Try another search or category.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedFood && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">{selectedFood.name}</h4>
                      <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Calories</p>
                          <p className="font-semibold">{selectedFood.calories}/100g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Protein</p>
                          <p className="font-semibold">{selectedFood.protein}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Carbs</p>
                          <p className="font-semibold">{selectedFood.carbs}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Fat</p>
                          <p className="font-semibold">{selectedFood.fat}g</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="quantity" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Quantity (grams)
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-3 text-sm bg-emerald-50 dark:bg-emerald-900 p-2 rounded-lg">
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Total Calories</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {(selectedFood.calories * quantity / 100).toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Total Protein</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {(selectedFood.protein * quantity / 100).toFixed(1)}g
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Total Carbs</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {(selectedFood.carbs * quantity / 100).toFixed(1)}g
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400">Total Fat</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {(selectedFood.fat * quantity / 100).toFixed(1)}g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg py-2.5 px-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedFood}
                    >
                      <i className="fas fa-plus mr-1"></i> Add to Log
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddCustomFood} className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="custom-food-name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Food Name
                      </label>
                      <input
                        type="text"
                        id="custom-food-name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        placeholder="Enter food name"
                        value={customFood.name}
                        onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-food-calories" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Calories (per 100g)
                      </label>
                      <input
                        type="number"
                        id="custom-food-calories"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        placeholder="Calories"
                        value={customFood.calories}
                        onChange={(e) => setCustomFood({...customFood, calories: e.target.value})}
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-food-protein" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Protein (g per 100g)
                      </label>
                      <input
                        type="number"
                        id="custom-food-protein"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        placeholder="Protein"
                        value={customFood.protein}
                        onChange={(e) => setCustomFood({...customFood, protein: e.target.value})}
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-food-carbs" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Carbs (g per 100g)
                      </label>
                      <input
                        type="number"
                        id="custom-food-carbs"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        placeholder="Carbs"
                        value={customFood.carbs}
                        onChange={(e) => setCustomFood({...customFood, carbs: e.target.value})}
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-food-fat" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fat (g per 100g)
                      </label>
                      <input
                        type="number"
                        id="custom-food-fat"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        placeholder="Fat"
                        value={customFood.fat}
                        onChange={(e) => setCustomFood({...customFood, fat: e.target.value})}
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-quantity" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quantity (grams)
                      </label>
                      <input
                        type="number"
                        id="custom-quantity"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg py-2.5 px-4 transition-colors duration-200"
                    >
                      <i className="fas fa-plus mr-1"></i> Add Custom Food
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </form>
              )}
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className="text-emerald-500 hover:text-emerald-600 text-sm"
                >
                  {showCustomForm ? 'Back to Food Database' : 'Add Custom Food'}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex justify-between items-center">
                <span>Today's Log</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedDate).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </h3>
              
              {meals.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-utensils text-4xl mb-4"></i>
                  <p>No meals logged for this date. Start by adding some food above.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300 mb-4">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                          <th scope="col" className="px-3 py-2">Time</th>
                          <th scope="col" className="px-3 py-2">Food</th>
                          <th scope="col" className="px-3 py-2">Quantity</th>
                          <th scope="col" className="px-3 py-2">Calories</th>
                          <th scope="col" className="px-3 py-2">Protein</th>
                          <th scope="col" className="px-3 py-2">Carbs</th>
                          <th scope="col" className="px-3 py-2">Fat</th>
                          <th scope="col" className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meals.map(meal => (
                          <tr key={meal.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-3 py-2">{formatTime(meal.timestamp)}</td>
                            <td className="px-3 py-2 font-medium">{meal.food}</td>
                            <td className="px-3 py-2">{meal.quantity}g</td>
                            <td className="px-3 py-2">{meal.calories}</td>
                            <td className="px-3 py-2">{meal.protein}g</td>
                            <td className="px-3 py-2">{meal.carbs}g</td>
                            <td className="px-3 py-2">{meal.fat}g</td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => handleRemoveMeal(meal.id)}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                aria-label="Remove meal"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50 dark:bg-emerald-900 font-semibold">
                          <td className="px-3 py-2" colSpan="3">Daily Totals</td>
                          <td className="px-3 py-2">{getDailyTotals().calories}</td>
                          <td className="px-3 py-2">{getDailyTotals().protein}g</td>
                          <td className="px-3 py-2">{getDailyTotals().carbs}g</td>
                          <td className="px-3 py-2">{getDailyTotals().fat}g</td>
                          <td className="px-3 py-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Macronutrient Breakdown</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-600">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ 
                            width: `${Math.min(100, (parseFloat(getDailyTotals().protein) * 4 / parseFloat(getDailyTotals().calories) * 100) || 0)}%` 
                          }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Protein</p>
                        <p className="font-semibold text-blue-500">{
                          parseFloat(getDailyTotals().calories) > 0 
                            ? ((parseFloat(getDailyTotals().protein) * 4 / parseFloat(getDailyTotals().calories)) * 100).toFixed(1) 
                            : 0
                        }%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-600">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ 
                            width: `${Math.min(100, (parseFloat(getDailyTotals().carbs) * 4 / parseFloat(getDailyTotals().calories) * 100) || 0)}%` 
                          }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Carbs</p>
                        <p className="font-semibold text-green-500">{
                          parseFloat(getDailyTotals().calories) > 0 
                            ? ((parseFloat(getDailyTotals().carbs) * 4 / parseFloat(getDailyTotals().calories)) * 100).toFixed(1) 
                            : 0
                        }%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-600">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ 
                            width: `${Math.min(100, (parseFloat(getDailyTotals().fat) * 9 / parseFloat(getDailyTotals().calories) * 100) || 0)}%` 
                          }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Fat</p>
                        <p className="font-semibold text-yellow-500">{
                          parseFloat(getDailyTotals().calories) > 0 
                            ? ((parseFloat(getDailyTotals().fat) * 9 / parseFloat(getDailyTotals().calories)) * 100).toFixed(1) 
                            : 0
                        }%</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 workout-container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Nutrition History</h2>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-500"
            >
              <i className="fas fa-arrow-left mr-1"></i> Back
            </button>
          </div>
          
          {Object.keys(dailyLog).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <i className="fas fa-calendar-alt text-4xl mb-4"></i>
              <p>No nutrition history available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(dailyLog)
                .sort((a, b) => new Date(b) - new Date(a))
                .map(date => {
                  const dayMeals = dailyLog[date];
                  const dayTotals = dayMeals.reduce((totals, meal) => {
                    return {
                      calories: (parseFloat(totals.calories) + parseFloat(meal.calories)).toFixed(1),
                      protein: (parseFloat(totals.protein) + parseFloat(meal.protein)).toFixed(1),
                      carbs: (parseFloat(totals.carbs) + parseFloat(meal.carbs)).toFixed(1),
                      fat: (parseFloat(totals.fat) + parseFloat(meal.fat)).toFixed(1)
                    };
                  }, { calories: '0.0', protein: '0.0', carbs: '0.0', fat: '0.0' });
                  
                  return (
                    <div 
                      key={date} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedDate(date);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                            {new Date(date).toLocaleDateString(undefined, { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {dayMeals.length} meals, {dayTotals.calories} calories total
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 px-2 py-1 rounded mr-1">
                              P: {dayTotals.protein}g
                            </span>
                            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 px-2 py-1 rounded mr-1">
                              C: {dayTotals.carbs}g
                            </span>
                            <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 px-2 py-1 rounded">
                              F: {dayTotals.fat}g
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Nutrition Tips</h2>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900 rounded-lg">
            <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">
              <i className="fas fa-lightbulb mr-2"></i>Daily Calorie Needs
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The average adult needs between 1,800-3,000 calories per day depending on activity level, 
              age, sex, weight, height, and overall health.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              <i className="fas fa-brain mr-2"></i>Protein Importance
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Protein is essential for muscle repair and growth. Aim for 0.8-1g of protein per pound of body weight if you're active or 
              training regularly.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              <i className="fas fa-fire mr-2"></i>Healthy Fats
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Healthy fats are crucial for hormone production and joint health. Include sources like avocados, nuts, olive oil, and fatty fish in your diet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionTracker;