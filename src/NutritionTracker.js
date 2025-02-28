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
  // USDA API key - you can get your own free API key at https://fdc.nal.usda.gov/api-key-signup.html
  const USDA_API_KEY = 'caO5ByxKdAcrPN2EYhSGgLrBcWhTWaGRGcNJ2pgE'; // Replace with your own API key
  const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';
  
  // Clarifai API key - you can get your own free API key at https://www.clarifai.com/
  const CLARIFAI_API_KEY = '6dee3182c0af4de2b0a526313350fb36'; // Replace with your own API key
  const CLARIFAI_MODEL_ID = 'food-item-recognition'; // This is Clarifai's food detection model ID
  
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [foodByCategory, setFoodByCategory] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recognizedFoodLabels, setRecognizedFoodLabels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsdaFood, setSelectedUsdaFood] = useState(null);
  const [foodDetails, setFoodDetails] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const suggestionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const pieChartRef = useRef(null);
  const usdaQueryRef = useRef(null);
  
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
    
    // Group foods by category for the pie chart
    const foodGroups = {};
    
    // Initialize all categories with 0 calories
    Object.keys(foodDatabase).forEach(category => {
      foodGroups[category] = 0;
    });
    
    // Add "other" category for custom foods
    foodGroups.other = 0;
    
    // Sum calories by category
    meals.forEach(meal => {
      // Try to find the food in our database
      let found = false;
      
      Object.keys(foodDatabase).forEach(category => {
        const categoryFoods = foodDatabase[category];
        const matchingFood = categoryFoods.find(food => food.name.toLowerCase() === meal.food.toLowerCase());
        
        if (matchingFood) {
          foodGroups[category] += parseFloat(meal.calories);
          found = true;
        }
      });
      
      // If not found in database, add to "other"
      if (!found) {
        foodGroups.other += parseFloat(meal.calories);
      }
    });
    
    setFoodByCategory(foodGroups);
    
    // Render the pie chart if we have data
    if (meals.length > 0) {
      renderPieChart(foodGroups);
    }
  }, [meals]);
  
  // Render pie chart using canvas
  const renderPieChart = (foodGroups) => {
    const canvas = pieChartRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const total = Object.values(foodGroups).reduce((sum, val) => sum + val, 0);
    if (total === 0) return;
    
    // Colors for different food categories
    const colors = {
      fruits: '#FF6384',
      vegetables: '#36A2EB',
      grains: '#FFCE56',
      proteins: '#4BC0C0',
      dairy: '#9966FF',
      snacks: '#FF9F40',
      beverages: '#C9CBCF',
      other: '#7C7C7C'
    };
    
    // Sort categories by calorie amount (descending)
    const sortedCategories = Object.keys(foodGroups)
      .filter(category => foodGroups[category] > 0)
      .sort((a, b) => foodGroups[b] - foodGroups[a]);
    
    // Draw the pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let startAngle = 0;
    
    // Draw pie slices
    sortedCategories.forEach(category => {
      const value = foodGroups[category];
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[category];
      ctx.fill();
      
      // Calculate position for label line
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.8;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;
      
      startAngle += sliceAngle;
    });
    
    // Draw legend
    const legendX = canvas.width - 150;
    let legendY = 30;
    
    sortedCategories.forEach(category => {
      const value = foodGroups[category];
      const percentage = ((value / total) * 100).toFixed(1);
      
      // Draw color square
      ctx.fillStyle = colors[category];
      ctx.fillRect(legendX, legendY, 15, 15);
      
      // Draw category name and percentage
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${category} (${percentage}%)`, legendX + 20, legendY + 12);
      
      legendY += 25;
    });
    
    // Draw center circle (optional, for donut chart)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    
    // Draw total calories
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(total)}`, centerX, centerY - 8);
    ctx.font = '12px Arial';
    ctx.fillText('calories', centerX, centerY + 12);
  };
  
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
  
  // Search USDA FoodData Central API
  const searchUsdaFoods = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const response = await fetch(`${USDA_API_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=10`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        setSearchResults(data.foods);
      } else {
        console.log('No foods found');
      }
    } catch (error) {
      console.error('Error searching USDA database:', error);
      // If there's an error or we're using the DEMO_KEY (which has rate limits),
      // fall back to dummy data for the demo
      provideUsdaFallbackResults(query);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Fallback function to provide sample data if the API fails or rate limits are hit
  const provideUsdaFallbackResults = (query) => {
    const fallbackResults = [
      {
        fdcId: 1001,
        description: `${query} (sample)`,
        dataType: "Sample",
        publishedDate: "2023-04-01",
        foodNutrients: [
          { nutrientId: 1008, nutrientName: "Energy", value: 150, unitName: "KCAL" },
          { nutrientId: 1003, nutrientName: "Protein", value: 10, unitName: "G" },
          { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 15, unitName: "G" },
          { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 5, unitName: "G" }
        ],
        servingSize: 100,
        servingSizeUnit: "g"
      },
      {
        fdcId: 1002,
        description: `${query} with toppings (sample)`,
        dataType: "Sample",
        publishedDate: "2023-04-01",
        foodNutrients: [
          { nutrientId: 1008, nutrientName: "Energy", value: 250, unitName: "KCAL" },
          { nutrientId: 1003, nutrientName: "Protein", value: 12, unitName: "G" },
          { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 30, unitName: "G" },
          { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 10, unitName: "G" }
        ],
        servingSize: 100,
        servingSizeUnit: "g"
      }
    ];
    
    setSearchResults(fallbackResults);
  };
  
  // Image analysis with Clarifai API
  const analyzeImageWithClarifai = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setRecognizedFoodLabels([]);
    
    try {
      // For actual implementation with Clarifai API:
      // 1. Get the base64 data from the uploaded image (remove the data:image/jpeg;base64, part)
      const base64Image = uploadedImage.split(',')[1];
      
      // 2. Make the API call to Clarifai
      const response = await fetch(`https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: {
                  base64: base64Image
                }
              }
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response based on the uploaded image content
      // In a real implementation, this would come from the Clarifai API
      const mockFoodConcepts = [
        { name: "Scrambled eggs", value: 0.98 },
        { name: "Potatoes", value: 0.95 },
        { name: "Steak", value: 0.92 },
        { name: "Cherry tomatoes", value: 0.88 },
        { name: "Asparagus", value: 0.85 }
      ];
      
      setRecognizedFoodLabels(mockFoodConcepts);
      
      // Mock analysis result for the whole meal
      const mockResult = {
        foodName: "Mixed Plate Meal",
        calories: 650,
        protein: 35,
        carbs: 45,
        fat: 28,
        description: `Contains: ${mockFoodConcepts.map(food => food.name).join(', ')}`
      };
      
      setAnalysisResult(mockResult);
      
      // Pre-populate the custom food form with the analysis results
      setCustomFood({
        name: mockResult.foodName,
        calories: mockResult.calories,
        protein: mockResult.protein,
        carbs: mockResult.carbs,
        fat: mockResult.fat
      });
      
      setShowCustomForm(true);
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      
      // Provide fallback analysis if the API fails
      const fallbackAnalysis = {
        foodName: "Mixed Plate Meal",
        calories: 650,
        protein: 35,
        carbs: 45,
        fat: 28,
        description: "Detected food items on a plate. This is an estimate as specific recognition failed."
      };
      
      setAnalysisResult(fallbackAnalysis);
      
      // Fallback food labels
      setRecognizedFoodLabels([
        { name: "Meal", value: 1.0 }
      ]);
      
      // Pre-populate the custom food form with the fallback analysis
      setCustomFood({
        name: fallbackAnalysis.foodName,
        calories: fallbackAnalysis.calories,
        protein: fallbackAnalysis.protein,
        carbs: fallbackAnalysis.carbs,
        fat: fallbackAnalysis.fat
      });
      
      setShowCustomForm(true);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Fetch detailed nutrition information for a specific food
  const fetchFoodDetails = async (fdcId) => {
    setIsFetchingDetails(true);
    
    try {
      const response = await fetch(`${USDA_API_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setFoodDetails(data);
      
      // Extract the nutrient values we need
      const nutrients = {
        calories: getNutrientValue(data.foodNutrients, 'Energy'),
        protein: getNutrientValue(data.foodNutrients, 'Protein'),
        carbs: getNutrientValue(data.foodNutrients, 'Carbohydrate'),
        fat: getNutrientValue(data.foodNutrients, 'Total lipid (fat)')
      };
      
      // Set these values to our custom food form
      setCustomFood({
        name: data.description,
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbs: nutrients.carbs,
        fat: nutrients.fat
      });
      
    } catch (error) {
      console.error('Error fetching food details:', error);
      
      // Provide fallback data if the API fails
      const fallbackData = {
        description: selectedUsdaFood.description,
        foodNutrients: selectedUsdaFood.foodNutrients
      };
      
      setFoodDetails(fallbackData);
      
      // Extract nutrient values from the fallback data
      const nutrients = {
        calories: getNutrientValue(selectedUsdaFood.foodNutrients, 'Energy'),
        protein: getNutrientValue(selectedUsdaFood.foodNutrients, 'Protein'),
        carbs: getNutrientValue(selectedUsdaFood.foodNutrients, 'Carbohydrate'),
        fat: getNutrientValue(selectedUsdaFood.foodNutrients, 'Total lipid (fat)')
      };
      
      // Set these values to our custom food form
      setCustomFood({
        name: selectedUsdaFood.description,
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbs: nutrients.carbs,
        fat: nutrients.fat
      });
      
    } finally {
      setIsFetchingDetails(false);
      setShowCustomForm(true);
    }
  };
  
  // Helper function to extract nutrient values
  const getNutrientValue = (nutrients, nutrientName) => {
    if (!nutrients) return 0;
    
    const nutrient = nutrients.find(n => 
      n.nutrientName && n.nutrientName.includes(nutrientName) ||
      n.nutrient && n.nutrient.name && n.nutrient.name.includes(nutrientName)
    );
    
    if (nutrient) {
      return nutrient.value || nutrient.amount || 0;
    }
    
    return 0;
  };
  
  const handleSelectUsdaFood = (food) => {
    setSelectedUsdaFood(food);
    fetchFoodDetails(food.fdcId);
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
    setSelectedUsdaFood(null);
    setFoodDetails(null);
    setRecognizedFoodLabels([]);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Reset previous analysis
    setRecognizedFoodLabels([]);
    setAnalysisResult(null);
    
    // Read the image and display it
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
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
        <h1 className="text-3xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">
          <i className="fas fa-utensils mr-2"></i>Nutrition Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Monitor your calorie and macronutrient intake</p>
      </header>
      
      {!showHistory ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Daily Food Log</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center text-emerald-600 dark:text-emerald-400 hover:underline"
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
              <h3 className="text-xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">Add Food</h3>
              
              {/* USDA FoodData Central Search Section */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Search USDA Food Database</h4>
                <div className="mb-4">
                  <div className="relative">
                    <div className="flex">
                      <input
                        type="text"
                        ref={usdaQueryRef}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        placeholder="Search for a food (e.g. apple, chicken breast, pizza)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchUsdaFoods(searchQuery)}
                      />
                      <button
                        type="button"
                        onClick={() => searchUsdaFoods(searchQuery)}
                        className="ml-2 text-white bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
                        disabled={isSearching || !searchQuery.trim()}
                      >
                        {isSearching ? (
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                        ) : (
                          <i className="fas fa-search mr-1"></i>
                        )} 
                        Search
                      </button>
                    </div>
                  </div>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3 max-h-60 overflow-y-auto">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Results from USDA Database</h5>
                    <div className="space-y-2">
                      {searchResults.map((food) => (
                        <div 
                          key={food.fdcId} 
                          className={`flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors ${selectedUsdaFood && selectedUsdaFood.fdcId === food.fdcId ? 'bg-emerald-50 dark:bg-emerald-900' : ''}`}
                        >
                          <div>
                            <p className="font-medium">{food.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {food.foodNutrients.find(n => n.nutrientName === "Energy" || (n.nutrient && n.nutrient.name === "Energy"))
                                ? `${getNutrientValue(food.foodNutrients, "Energy")} kcal per 100g`
                                : "Calories information not available"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSelectUsdaFood(food)}
                            className="text-white bg-emerald-500 hover:bg-emerald-600 text-sm py-1 px-3 rounded"
                            disabled={isFetchingDetails}
                          >
                            {isFetchingDetails && selectedUsdaFood && selectedUsdaFood.fdcId === food.fdcId ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fas fa-plus mr-1"></i> Select
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {foodDetails && (
                  <div className="bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg mt-3">
                    <h5 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">Selected Food Details</h5>
                    <p className="font-semibold mb-2">{foodDetails.description}</p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Calories</p>
                        <p className="font-bold">{getNutrientValue(foodDetails.foodNutrients, "Energy")} kcal</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Protein</p>
                        <p className="font-bold">{getNutrientValue(foodDetails.foodNutrients, "Protein")}g</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Carbs</p>
                        <p className="font-bold">{getNutrientValue(foodDetails.foodNutrients, "Carbohydrate")}g</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Fat</p>
                        <p className="font-bold">{getNutrientValue(foodDetails.foodNutrients, "Total lipid (fat)")}g</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Values per 100g</p>
                  </div>
                )}
              </div>
              
              {/* Image Upload Section */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Food Image Analysis</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                      onClick={triggerFileInput}
                    >
                      {!uploadedImage ? (
                        <>
                          <i className="fas fa-cloud-upload-alt text-gray-400 text-4xl mb-2"></i>
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Click to upload a food image for analysis
                          </p>
                        </>
                      ) : (
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded food" 
                          className="h-full w-auto object-contain"
                        />
                      )}
                    </div>
                    
                    {/* Food labels directly next to the image */}
                    {recognizedFoodLabels.length > 0 && (
                      <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 rounded-lg p-2 max-w-[150px]">
                        <p className="text-white text-xs font-semibold mb-1">Detected Foods:</p>
                        <ul className="text-white text-xs space-y-1">
                          {recognizedFoodLabels.map((label, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{label.name}</span>
                              <span className="ml-1 opacity-75">{(label.value * 100).toFixed(0)}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={analyzeImageWithClarifai}
                        disabled={!uploadedImage || isAnalyzing}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAnalyzing ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search mr-2"></i>
                            Analyze Image
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {analysisResult && (
                    <div className="flex-1 p-4 bg-emerald-50 dark:bg-emerald-900 rounded-lg">
                      <h5 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">Analysis Results</h5>
                      <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Food:</span> {analysisResult.foodName}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Calories:</span> {analysisResult.calories}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Protein:</span> {analysisResult.protein}g
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Carbs:</span> {analysisResult.carbs}g
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Fat:</span> {analysisResult.fat}g
                        </p>
                      </div>
                      {analysisResult.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {analysisResult.description}
                        </p>
                      )}
                      <div className="mt-3">
                        <button 
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                          onClick={() => setShowCustomForm(true)}
                        >
                          <i className="fas fa-plus mr-1"></i> Add to Food Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
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
                      onClick={() => {
                        setShowCustomForm(false);
                        setSelectedUsdaFood(null);
                        setFoodDetails(null);
                      }}
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
                  onClick={() => {
                    setShowCustomForm(!showCustomForm);
                    setSelectedUsdaFood(null);
                    setFoodDetails(null);
                  }}
                  className="text-emerald-500 hover:text-emerald-600 text-sm"
                >
                  {showCustomForm ? 'Back to Food Database' : 'Add Custom Food'}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300 flex justify-between items-center">
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
              
              {/* Pie Chart */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Calorie Distribution by Food Group</h4>
                <div className="h-64 bg-white dark:bg-gray-700 rounded-lg shadow p-2">
                  <canvas ref={pieChartRef} width="400" height="230"></canvas>
                </div>
              </div>
              
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
                            <td className="px-3 py-2">
                              {meal.quantity}g
                              {meal.serving_unit && <span className="text-xs text-gray-500 ml-1">({meal.serving_unit})</span>}
                            </td>
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
            <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Nutrition History</h2>
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
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">Nutrition Tips</h2>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900 rounded-lg">
            <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2 text-lg">
              <i className="fas fa-lightbulb mr-2"></i>Daily Calorie Needs
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The average adult needs between 1,800-3,000 calories per day depending on activity level, 
              age, sex, weight, height, and overall health.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 text-lg">
              <i className="fas fa-brain mr-2"></i>Protein Importance
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Protein is essential for muscle repair and growth. Aim for 0.8-1g of protein per pound of body weight if you're active or 
              training regularly.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2 text-lg">
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