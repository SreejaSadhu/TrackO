import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import BudgetManager from '../../components/Budget/BudgetManager';
import BudgetInsightsCard from '../../components/Budget/BudgetInsightsCard';
import Save from '../../components/Save/Save';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const SmartBudget = () => {
  useUserAuth();
  const [budgets, setBudgets] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get All Expense Details
  const fetchExpenseDetails = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`);
      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved budgets
  const fetchBudgets = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/budget/get');
      if (response.data) {
        setBudgets(response.data);
      }
    } catch (error) {
      console.log("Error fetching budgets", error);
    }
  };

  // Save budgets to backend
  const saveBudgets = async (updatedBudgets) => {
    try {
      await axiosInstance.post('/api/v1/budget/save', { budgets: updatedBudgets });
      setBudgets(updatedBudgets);
    } catch (error) {
      console.log("Error saving budgets", error);
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
    fetchBudgets(); // Fetch initial budgets
    return () => {};
  }, []);

  const handleBudgetUpdate = (category, amount) => {
    // Find if the category already exists
    const updatedBudgets = [...budgets];
    const existingIndex = updatedBudgets.findIndex(
      b => b.category.toLowerCase() === category.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Update existing category
      updatedBudgets[existingIndex] = {
        ...updatedBudgets[existingIndex],
        amount: amount
      };
    } else {
      // Add new category
      updatedBudgets.push({
        category: category,
        amount: amount
      });
    }

    saveBudgets(updatedBudgets);
  };

  return (
    <DashboardLayout activeMenu="smartbudget">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Smart Budget Planner</h1>
          <p className="text-purple-100">AI-powered insights and personalized budget management</p>
        </div>

        {/* Budget Insights - Context-Aware Analysis */}
        {budgets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Budget Insights</h2>
            <BudgetInsightsCard />
          </div>
        )}

        {/* Budget Manager */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Manage Budgets</h2>
          <BudgetManager budgets={budgets} onBudgetUpdate={handleBudgetUpdate} />
        </div>

        {/* Savings Suggestions */}
        {budgets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Savings Tips</h2>
            <Save expenses={expenseData} budgets={budgets} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SmartBudget;