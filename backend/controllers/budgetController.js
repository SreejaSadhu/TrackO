const Budget = require("../models/Budget");
const { generateInsights } = require("../utils/generateInsights");
const { getAllCategories } = require("../utils/categoryMatcher");

// Get all budgets for the current user
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching budgets", error: error.message });
  }
};

// Save budgets for the current user
const saveBudgets = async (req, res) => {
  try {
    const { budgets } = req.body;
    
    // Delete existing budgets for this user
    await Budget.deleteMany({ user: req.user._id });
    
    // Create new budget entries
    const now = new Date();
    const budgetDocs = budgets.map(budget => ({
      user: req.user._id,
      category: budget.category,
      amount: budget.amount,
      month: budget.month || now.getMonth() + 1,
      year: budget.year || now.getFullYear()
    }));
    
    const savedBudgets = await Budget.insertMany(budgetDocs);
    res.json(savedBudgets);
  } catch (error) {
    res.status(500).json({ message: "Error saving budgets", error: error.message });
  }
};

// Get AI-powered budget insights
const getBudgetInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const insights = await generateInsights(userId);
    res.json(insights);
  } catch (error) {
    console.error("Error generating budget insights:", error);
    res.status(500).json({ message: "Error generating insights", error: error.message });
  }
};

// Get all available categories
const getCategories = async (req, res) => {
  try {
    const categories = getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

module.exports = {
  getBudgets,
  saveBudgets,
  getBudgetInsights,
  getCategories
};