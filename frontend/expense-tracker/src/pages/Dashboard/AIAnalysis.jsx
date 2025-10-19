import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  HiSparkles, 
  HiArrowTrendingUp, 
  HiArrowTrendingDown, 
  HiLightBulb,
  HiExclamationCircle,
  HiCheckCircle,
  HiChartBar,
  HiClock,
  HiCurrencyRupee,
  HiArrowPath
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const AIAnalysis = () => {
  useUserAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [expenseRes, incomeRes, budgetRes] = await Promise.all([
        axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE),
        axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
        axiosInstance.get('/api/v1/budget/get')
      ]);
      
      setExpenses(expenseRes.data || []);
      setIncome(incomeRes.data || []);
      setBudgets(budgetRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    setAnalyzing(true);
    try {
      // Calculate comprehensive stats
      const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;
      
      // Category-wise spending
      const categorySpending = {};
      expenses.forEach(exp => {
        categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
      });
      
      const topCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      // Time-based analysis
      const currentMonth = new Date().getMonth();
      const currentMonthExpenses = expenses.filter(exp => 
        new Date(exp.date).getMonth() === currentMonth
      );
      const currentMonthSpending = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // Budget adherence
      const budgetAdherence = budgets.map(budget => {
        const spent = categorySpending[budget.category] || 0;
        const percentage = (spent / budget.amount * 100).toFixed(1);
        return { category: budget.category, spent, budget: budget.amount, percentage };
      }).sort((a, b) => b.percentage - a.percentage);
      
      // Spending patterns
      const avgDailySpending = (totalExpense / 30).toFixed(0);
      const highestExpense = expenses.length > 0 ? 
        expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max) : null;
      
      // Generate AI insights
      const aiInsights = {
        summary: {
          totalIncome,
          totalExpense,
          savings: totalIncome - totalExpense,
          savingsRate,
          avgDailySpending,
          transactionCount: expenses.length
        },
        topCategories,
        budgetAdherence,
        currentMonthSpending,
        highestExpense,
        recommendations: generateRecommendations(
          savingsRate, 
          budgetAdherence, 
          topCategories, 
          totalIncome,
          totalExpense
        ),
        spendingTrends: analyzeSpendingTrends(expenses),
        financialHealth: calculateFinancialHealth(savingsRate, budgetAdherence)
      };
      
      setInsights(aiInsights);
      toast.success('AI Analysis Complete!');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRecommendations = (savingsRate, budgetAdherence, topCategories, totalIncome, totalExpense) => {
    const recommendations = [];
    
    // Savings rate recommendations
    if (savingsRate < 10) {
      recommendations.push({
        type: 'critical',
        icon: HiExclamationCircle,
        title: 'Critical: Low Savings Rate',
        message: `Your savings rate is only ${savingsRate}%. Aim for at least 20% to build financial security.`,
        action: 'Reduce non-essential spending immediately'
      });
    } else if (savingsRate < 20) {
      recommendations.push({
        type: 'warning',
        icon: HiLightBulb,
        title: 'Improve Your Savings',
        message: `You're saving ${savingsRate}% of income. Try to reach 20-30% for better financial health.`,
        action: 'Identify areas to cut back'
      });
    } else {
      recommendations.push({
        type: 'success',
        icon: HiCheckCircle,
        title: 'Excellent Savings Rate!',
        message: `You're saving ${savingsRate}% of your income. Keep up the great work!`,
        action: 'Consider investing surplus funds'
      });
    }
    
    // Budget adherence recommendations
    const overBudget = budgetAdherence.filter(b => b.percentage > 100);
    if (overBudget.length > 0) {
      recommendations.push({
        type: 'critical',
        icon: HiExclamationCircle,
        title: 'Budget Exceeded',
        message: `You've exceeded budget in ${overBudget.length} categories: ${overBudget.map(b => b.category).join(', ')}`,
        action: 'Review and adjust spending habits'
      });
    }
    
    // Top spending category recommendations
    if (topCategories.length > 0) {
      const [topCategory, topAmount] = topCategories[0];
      const percentage = ((topAmount / totalExpense) * 100).toFixed(1);
      
      if (percentage > 40) {
        recommendations.push({
          type: 'warning',
          icon: HiChartBar,
          title: `High Spending on ${topCategory}`,
          message: `${percentage}% of your expenses go to ${topCategory}. Consider if this aligns with your priorities.`,
          action: 'Look for cost-saving alternatives'
        });
      }
    }
    
    // Income vs Expense recommendations
    if (totalExpense > totalIncome) {
      recommendations.push({
        type: 'critical',
        icon: HiArrowTrendingDown,
        title: 'Spending Exceeds Income',
        message: `You're spending ₹${(totalExpense - totalIncome).toFixed(0)} more than you earn!`,
        action: 'Urgent: Create a debt reduction plan'
      });
    }
    
    // Positive reinforcement
    if (savingsRate > 30 && overBudget.length === 0) {
      recommendations.push({
        type: 'success',
        icon: HiSparkles,
        title: 'Financial Superstar!',
        message: 'You\'re managing your finances exceptionally well. Your discipline is paying off!',
        action: 'Explore investment opportunities'
      });
    }
    
    return recommendations;
  };

  const analyzeSpendingTrends = (expenses) => {
    const last30Days = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return expDate >= thirtyDaysAgo;
    });
    
    const previous30Days = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return expDate >= sixtyDaysAgo && expDate < thirtyDaysAgo;
    });
    
    const currentTotal = last30Days.reduce((sum, exp) => sum + exp.amount, 0);
    const previousTotal = previous30Days.reduce((sum, exp) => sum + exp.amount, 0);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1) : 0;
    
    return {
      current: currentTotal,
      previous: previousTotal,
      change,
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
    };
  };

  const calculateFinancialHealth = (savingsRate, budgetAdherence) => {
    let score = 0;
    
    // Savings rate scoring (40 points)
    if (savingsRate >= 30) score += 40;
    else if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else score += 10;
    
    // Budget adherence scoring (40 points)
    const withinBudget = budgetAdherence.filter(b => b.percentage <= 100).length;
    const totalBudgets = budgetAdherence.length;
    if (totalBudgets > 0) {
      score += (withinBudget / totalBudgets) * 40;
    }
    
    // Transaction discipline (20 points)
    score += 20; // Base score for tracking
    
    let rating = 'Poor';
    let color = 'red';
    if (score >= 80) { rating = 'Excellent'; color = 'green'; }
    else if (score >= 60) { rating = 'Good'; color = 'blue'; }
    else if (score >= 40) { rating = 'Fair'; color = 'yellow'; }
    
    return { score: Math.round(score), rating, color };
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeIconColor = (type) => {
    switch(type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <DashboardLayout activeMenu="aianalysis">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <HiSparkles className="text-purple-600" />
                AI Financial Analysis
              </h1>
              <p className="text-gray-600 mt-2">Get personalized insights powered by intelligent analysis</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateAIInsights}
              disabled={analyzing || loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <HiArrowPath className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <HiSparkles />
                  Generate Insights
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <HiArrowPath className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your financial data...</p>
            </div>
          </div>
        ) : !insights ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <HiSparkles className="text-8xl text-purple-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready for AI-Powered Insights?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Click "Generate Insights" to get personalized financial analysis, spending patterns, 
              budget recommendations, and actionable tips to improve your financial health.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-purple-50 rounded-xl">
                <HiChartBar className="text-4xl text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Spending Analysis</h3>
                <p className="text-sm text-gray-600">Detailed breakdown of where your money goes</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-xl">
                <HiLightBulb className="text-4xl text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">Personalized tips to optimize your finances</p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl">
                <HiArrowTrendingUp className="text-4xl text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Financial Health Score</h3>
                <p className="text-sm text-gray-600">Track your overall financial wellness</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-6">
              {/* Financial Health Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Financial Health Score</h2>
                    <p className="text-purple-100">Overall assessment of your financial wellness</p>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold">{insights.financialHealth.score}</div>
                    <div className="text-xl font-semibold mt-2">{insights.financialHealth.rating}</div>
                  </div>
                </div>
              </motion.div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <HiCurrencyRupee className="text-3xl text-green-600" />
                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      Income
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">₹{insights.summary.totalIncome.toLocaleString()}</div>
                  <p className="text-gray-600 text-sm mt-2">Total Income</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <HiArrowTrendingDown className="text-3xl text-red-600" />
                    <span className="text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                      Expenses
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">₹{insights.summary.totalExpense.toLocaleString()}</div>
                  <p className="text-gray-600 text-sm mt-2">Total Expenses</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <HiArrowTrendingUp className="text-3xl text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      Savings
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">₹{insights.summary.savings.toLocaleString()}</div>
                  <p className="text-gray-600 text-sm mt-2">{insights.summary.savingsRate}% Savings Rate</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <HiClock className="text-3xl text-purple-600" />
                    <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      Daily Avg
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">₹{insights.summary.avgDailySpending}</div>
                  <p className="text-gray-600 text-sm mt-2">Average Daily Spending</p>
                </motion.div>
              </div>

              {/* Spending Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <HiChartBar className="text-purple-600" />
                  Spending Trends
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <p className="text-gray-600 mb-2">Last 30 Days</p>
                    <p className="text-3xl font-bold text-gray-800">₹{insights.spendingTrends.current.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <p className="text-gray-600 mb-2">Previous 30 Days</p>
                    <p className="text-3xl font-bold text-gray-800">₹{insights.spendingTrends.previous.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <p className="text-gray-600 mb-2">Trend</p>
                    <div className="flex items-center justify-center gap-2">
                      {insights.spendingTrends.trend === 'increasing' ? (
                        <HiArrowTrendingUp className="text-3xl text-red-600" />
                      ) : insights.spendingTrends.trend === 'decreasing' ? (
                        <HiArrowTrendingDown className="text-3xl text-green-600" />
                      ) : (
                        <span className="text-3xl">→</span>
                      )}
                      <span className={`text-2xl font-bold ${
                        insights.spendingTrends.change > 0 ? 'text-red-600' : 
                        insights.spendingTrends.change < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {insights.spendingTrends.change > 0 ? '+' : ''}{insights.spendingTrends.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Top Spending Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Top Spending Categories</h3>
                <div className="space-y-4">
                  {insights.topCategories.map(([category, amount], index) => {
                    const percentage = ((amount / insights.summary.totalExpense) * 100).toFixed(1);
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-800">{category}</span>
                            <span className="text-gray-600">₹{amount.toLocaleString()} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* AI Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <HiLightBulb className="text-yellow-500" />
                  AI-Powered Recommendations
                </h3>
                <div className="space-y-4">
                  {insights.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className={`p-6 rounded-xl border-2 ${getTypeColor(rec.type)}`}
                    >
                      <div className="flex items-start gap-4">
                        <rec.icon className={`text-3xl ${getTypeIconColor(rec.type)} flex-shrink-0`} />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg mb-2">{rec.title}</h4>
                          <p className="text-gray-700 mb-3">{rec.message}</p>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                            <span>💡 Action:</span>
                            <span>{rec.action}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Budget Performance */}
              {insights.budgetAdherence.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Budget Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.budgetAdherence.map((item, index) => (
                      <motion.div
                        key={item.category}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1 + index * 0.05 }}
                        className={`p-6 rounded-xl border-2 ${
                          item.percentage > 100 ? 'bg-red-50 border-red-200' :
                          item.percentage > 80 ? 'bg-yellow-50 border-yellow-200' :
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-800 mb-3">{item.category}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Spent:</span>
                            <span className="font-semibold">₹{item.spent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Budget:</span>
                            <span className="font-semibold">₹{item.budget.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div
                              className={`h-2 rounded-full ${
                                item.percentage > 100 ? 'bg-red-600' :
                                item.percentage > 80 ? 'bg-yellow-600' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                          </div>
                          <p className={`text-center font-bold text-lg mt-2 ${
                            item.percentage > 100 ? 'text-red-600' :
                            item.percentage > 80 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.percentage}%
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIAnalysis;
