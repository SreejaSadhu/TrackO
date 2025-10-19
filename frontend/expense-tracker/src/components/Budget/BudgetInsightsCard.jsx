import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

const BudgetInsightsCard = ({ insights }) => {
  if (!insights) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">Loading insights...</p>
      </div>
    );
  }

  const { summary, categoryInsights } = insights;

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'danger':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'exceeded':
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'safe':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-orange-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`p-6 rounded-lg shadow-lg border-l-4 ${getStatusColor(summary.status)}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{summary.emoji}</span>
              <h2 className="text-2xl font-bold">Budget Overview</h2>
            </div>
            <p className="text-lg mb-4">{summary.message}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalSpent)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalBudget)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-xl font-bold">{formatCurrency(summary.remaining)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-xl font-bold">{summary.savingsRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Insights */}
      {categoryInsights && categoryInsights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryInsights.map((insight, index) => (
              <motion.div
                key={insight.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-5 rounded-lg shadow-md border-l-4 ${getStatusColor(insight.status)}`}
              >
                <div className="mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">{insight.category}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatCurrency(insight.spent)}</span>
                    <span>{insight.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(insight.percentage, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full ${getProgressColor(insight.status)}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Budget: {formatCurrency(insight.budget)}</span>
                    <span>Remaining: {formatCurrency(insight.remaining)}</span>
                  </div>
                </div>

                {/* Top Expenses */}
                {insight.topExpenses && insight.topExpenses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Top Expenses:</p>
                    <div className="space-y-1">
                      {insight.topExpenses.slice(0, 3).map((expense, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600">
                          <span className="truncate flex-1">{expense.name}</span>
                          <span className="font-semibold ml-2">{formatCurrency(expense.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Category Insights */}
      {(!categoryInsights || categoryInsights.length === 0) && (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No category insights available. Start by setting budgets for your categories!</p>
        </div>
      )}
    </div>
  );
};

BudgetInsightsCard.propTypes = {
  insights: PropTypes.shape({
    summary: PropTypes.shape({
      message: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      totalSpent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      totalBudget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      remaining: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      savingsRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    categoryInsights: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        spent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        budget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        remaining: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        status: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        topExpenses: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string,
            amount: PropTypes.number,
            date: PropTypes.string
          })
        )
      })
    )
  })
};

export default BudgetInsightsCard;
