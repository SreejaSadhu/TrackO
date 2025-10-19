import React, { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";

// Category mapping for auto-detection
const categoryKeywords = {
  "Food & Drinks": ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "kfc", "pizza", "burger", "food", "dining", "lunch", "dinner", "breakfast", "snack", "meal"],
  "Food Delivery": ["swiggy", "zomato", "ubereats", "delivery", "food delivery"],
  "Shopping": ["amazon", "flipkart", "myntra", "shopping", "clothes", "fashion", "shoes", "accessories", "electronics"],
  "Groceries": ["grocery", "supermarket", "vegetables", "fruits", "milk", "bread", "eggs", "meat", "bigbasket", "grofers", "blinkit", "zepto"],
  "Transportation": ["uber", "ola", "taxi", "cab", "bus", "train", "metro", "auto", "rickshaw", "fuel", "petrol", "diesel", "gas", "parking"],
  "Entertainment": ["movie", "cinema", "netflix", "prime", "spotify", "hotstar", "disney", "gaming", "game", "concert"],
  "Utilities": ["electricity", "water", "gas", "internet", "wifi", "broadband", "phone", "mobile", "recharge", "bill"],
  "Healthcare": ["doctor", "hospital", "clinic", "medicine", "pharmacy", "medical", "health"],
  "Housing": ["rent", "mortgage", "emi", "housing", "apartment", "flat", "home"],
  "Education": ["school", "college", "university", "course", "tuition", "books", "education"],
  "Personal Care": ["salon", "spa", "haircut", "grooming", "cosmetics", "beauty"],
  "Fitness": ["gym", "fitness", "yoga", "sports", "exercise", "workout"],
  "Insurance": ["insurance", "premium", "policy"],
  "Investments": ["investment", "mutual fund", "stocks", "shares", "sip", "fd"],
  "Miscellaneous": ["other", "misc"]
};

const categoryIcons = {
  "Food & Drinks": "🍔",
  "Food Delivery": "🛵",
  "Shopping": "🛍️",
  "Groceries": "🛒",
  "Transportation": "🚗",
  "Entertainment": "🎬",
  "Utilities": "💡",
  "Healthcare": "🏥",
  "Housing": "🏠",
  "Education": "📚",
  "Personal Care": "💅",
  "Fitness": "💪",
  "Insurance": "🛡️",
  "Investments": "📈",
  "Miscellaneous": "📦"
};

const AddExpenseForm = ({onAddExpense}) => {
  const [expense, setExpense] = useState({
    name: "",
    category: "",
    amount: "",
    date: "",
    icon: "",
  });
  const [categories, setCategories] = useState([]);
  const [suggestedCategory, setSuggestedCategory] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/budget/categories');
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.log("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Auto-detect category from name
  const detectCategory = (name) => {
    if (!name) return null;
    
    const normalized = name.toLowerCase().trim();
    let bestMatch = { category: null, confidence: 0 };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (normalized.includes(keyword)) {
          const confidence = keyword.length / normalized.length;
          if (confidence > bestMatch.confidence) {
            bestMatch = { category, confidence };
          }
        }
      }
    }

    return bestMatch.confidence > 0.3 ? bestMatch.category : null;
  };

  const handleChange = (key, value) => {
    setExpense({ ...expense, [key]: value });

    // Auto-detect category when name changes
    if (key === "name" && value) {
      const detected = detectCategory(value);
      if (detected) {
        setSuggestedCategory(detected);
        // Auto-set category and icon if not already set
        if (!expense.category) {
          setExpense(prev => ({
            ...prev,
            category: detected,
            icon: categoryIcons[detected] || ""
          }));
        }
      } else {
        setSuggestedCategory(null);
      }
    }
  };

  const handleCategoryChange = (value) => {
    setExpense({ 
      ...expense, 
      category: value,
      icon: categoryIcons[value] || expense.icon
    });
    setSuggestedCategory(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={expense.name}
        onChange={({ target }) => handleChange("name", target.value)}
        label="Expense Name"
        placeholder="e.g., Starbucks Coffee, Uber Ride"
        type="text"
      />

      {suggestedCategory && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Suggested category: <strong>{suggestedCategory}</strong>
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={expense.category}
          onChange={({ target }) => handleCategoryChange(target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select a category</option>
          {Object.keys(categoryKeywords).map((cat) => (
            <option key={cat} value={cat}>
              {categoryIcons[cat]} {cat}
            </option>
          ))}
        </select>
      </div>

      <Input
        value={expense.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder="₹0.00"
        type="number"
      />

      <Input
        value={expense.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date"
        placeholder=""
        type="date"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={()=>onAddExpense(expense)}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;