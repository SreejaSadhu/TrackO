const Budget = require("../models/Budget");

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
    const budgetDocs = budgets.map(budget => ({
      user: req.user._id,
      category: budget.category,
      amount: budget.amount
    }));
    
    const savedBudgets = await Budget.insertMany(budgetDocs);
    res.json(savedBudgets);
  } catch (error) {
    res.status(500).json({ message: "Error saving budgets", error: error.message });
  }
};

module.exports = {
  getBudgets,
  saveBudgets
};