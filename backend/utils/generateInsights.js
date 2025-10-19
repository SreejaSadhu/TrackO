const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

/**
 * Get status level based on percentage
 */
function getStatus(percentage) {
  if (percentage < 70) return 'safe';
  if (percentage < 90) return 'warning';
  if (percentage < 100) return 'danger';
  return 'exceeded';
}

/**
 * Get top expenses for a category
 */
async function getTopExpenses(userId, category, limit = 5) {
  try {
    const expenses = await Expense.find({ 
      userId, 
      category 
    })
    .sort({ amount: -1 })
    .limit(limit)
    .select('name amount date category');
    
    return expenses;
  } catch (error) {
    console.error('Error fetching top expenses:', error);
    return [];
  }
}

/**
 * Generate personalized insight message based on spending
 */
function generateInsightMessage(category, spent, budget, percentage, status) {
  const remaining = budget - spent;
  
  const messages = {
    safe: [
      `Great job! You're doing well with your ${category} budget. You've spent ₹${spent.toFixed(2)} out of ₹${budget.toFixed(2)}.`,
      `You're on track! Only ${percentage.toFixed(1)}% of your ${category} budget used. Keep it up!`,
      `Excellent control on ${category} spending! ₹${remaining.toFixed(2)} still available.`
    ],
    warning: [
      `Heads up! You've used ${percentage.toFixed(1)}% of your ${category} budget. ₹${remaining.toFixed(2)} remaining.`,
      `Watch your ${category} spending. You're at ${percentage.toFixed(1)}% of your budget.`,
      `Getting close to your ${category} limit. Consider cutting back a bit.`
    ],
    danger: [
      `Alert! You've spent ${percentage.toFixed(1)}% of your ${category} budget. Only ₹${remaining.toFixed(2)} left!`,
      `Critical: Your ${category} spending is at ${percentage.toFixed(1)}%. Be careful!`,
      `Warning: Almost at your ${category} budget limit. Only ₹${remaining.toFixed(2)} remaining.`
    ],
    exceeded: [
      `Budget exceeded! You've overspent on ${category} by ₹${Math.abs(remaining).toFixed(2)}.`,
      `Over budget alert! ${category} spending is ${percentage.toFixed(1)}% of your limit.`,
      `You've exceeded your ${category} budget by ₹${Math.abs(remaining).toFixed(2)}. Time to cut back!`
    ]
  };
  
  const statusMessages = messages[status] || messages.safe;
  return statusMessages[Math.floor(Math.random() * statusMessages.length)];
}

/**
 * Generate summary insight for overall budget health
 */
function generateSummaryInsight(totalSpent, totalBudget, categoriesCount) {
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const status = getStatus(percentage);
  const remaining = totalBudget - totalSpent;
  
  let message = '';
  let emoji = '';
  
  if (status === 'safe') {
    emoji = '✅';
    message = `You're doing great! You've spent ₹${totalSpent.toFixed(2)} out of ₹${totalBudget.toFixed(2)} across ${categoriesCount} categories.`;
  } else if (status === 'warning') {
    emoji = '⚠️';
    message = `Be careful! You've used ${percentage.toFixed(1)}% of your total budget. ₹${remaining.toFixed(2)} remaining.`;
  } else if (status === 'danger') {
    emoji = '🚨';
    message = `Critical! You're at ${percentage.toFixed(1)}% of your budget. Only ₹${remaining.toFixed(2)} left!`;
  } else {
    emoji = '❌';
    message = `Budget exceeded! You've overspent by ₹${Math.abs(remaining).toFixed(2)}. Time to review your expenses.`;
  }
  
  return {
    message,
    emoji,
    status,
    percentage: percentage.toFixed(1),
    totalSpent: totalSpent.toFixed(2),
    totalBudget: totalBudget.toFixed(2),
    remaining: remaining.toFixed(2)
  };
}

/**
 * Generate insights for all budgets
 */
async function generateInsights(userId) {
  try {
    // Get all budgets for the user
    const budgets = await Budget.find({ user: userId });
    
    if (!budgets || budgets.length === 0) {
      return {
        summary: {
          message: 'No budgets set yet. Start by creating budgets for your expense categories!',
          emoji: '💡',
          status: 'info',
          percentage: 0,
          totalSpent: 0,
          totalBudget: 0,
          remaining: 0
        },
        categoryInsights: []
      };
    }
    
    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Calculate insights for each category
    const categoryInsights = [];
    let totalSpent = 0;
    let totalBudget = 0;
    
    for (const budget of budgets) {
      // Get expenses for this category in current month
      const expenses = await Expense.aggregate([
        {
          $match: {
            userId: userId,
            category: budget.category,
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const spent = expenses.length > 0 ? expenses[0].total : 0;
      const budgetAmount = budget.amount;
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      const status = getStatus(percentage);
      
      // Get top expenses for this category
      const topExpenses = await getTopExpenses(userId, budget.category, 5);
      
      categoryInsights.push({
        category: budget.category,
        spent: spent.toFixed(2),
        budget: budgetAmount.toFixed(2),
        remaining: (budgetAmount - spent).toFixed(2),
        percentage: percentage.toFixed(1),
        status,
        message: generateInsightMessage(budget.category, spent, budgetAmount, percentage, status),
        topExpenses: topExpenses.map(exp => ({
          name: exp.name || 'Unnamed',
          amount: exp.amount,
          date: exp.date
        }))
      });
      
      totalSpent += spent;
      totalBudget += budgetAmount;
    }
    
    // Generate summary insight
    const summary = generateSummaryInsight(totalSpent, totalBudget, budgets.length);
    
    // Calculate savings rate
    const savingsRate = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget * 100) : 0;
    summary.savingsRate = savingsRate.toFixed(1);
    
    return {
      summary,
      categoryInsights: categoryInsights.sort((a, b) => b.percentage - a.percentage) // Sort by percentage descending
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}

module.exports = {
  generateInsights,
  generateSummaryInsight,
  getStatus,
  getTopExpenses
};
