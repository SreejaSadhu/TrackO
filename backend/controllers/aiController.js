const OpenAI = require('openai');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const mongoose = require('mongoose');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Helper: Classify user input as query or add command
async function classifyInput(sentence) {
  const prompt = `Classify the following sentence as either 'add' (if the user wants to add an expense or income) or 'query' (if the user is asking about their finances). Only reply with 'add' or 'query'.\nSentence: "${sentence}"`;
  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a classifier.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 10,
    temperature: 0,
  });
  return completion.choices[0].message.content.trim().toLowerCase();
}

// Helper: Generate a data plan for the query, with few-shot examples
async function generateDataPlan(sentence) {
  const planPrompt = `Given the user's sentence, describe in one sentence what data to fetch from the user's finances (expenses, income, budgets, goals, etc).\nUse the following examples to help you generalize:\n
"I earned ₹10,000 today." => add income ₹10,000 for today\n"Add my salary of ₹25,000." => add income ₹25,000, category salary\n"How much did I earn this month?" => sum all income for current month\n"Show my total income in June." => sum all income for June\n"Which source gave me the most income?" => group income by source, return top\n"I spent ₹300 on groceries." => add expense ₹300, category groceries\n"Add ₹1200 for electricity bill." => add expense ₹1200, category electricity\n"Show my total expenses this month." => sum all expenses for current month\n"How much did I spend on food?" => sum all expenses, category food\n"What’s my biggest spending category?" => group expenses by category, return top\n"Are my expenses increasing?" => compare total expenses this month to last month\n"Set a budget of ₹10,000 for groceries this month." => set budget ₹10,000, category groceries, period current month\n"Am I exceeding my grocery budget?" => compare total expenses in groceries to budget for groceries\n"Give me a summary of my finances." => summarize total income, total expenses, balance\n"How much did I save this month?" => income minus expenses for current month\n"Suggest how to reduce expenses." => analyze expenses, suggest categories to cut\n"I want to save ₹50,000 in 6 months — how?" => savings plan for ₹50,000 in 6 months\n"Where is all my money going?" => group expenses by category, show top categories\n"Show me last month." => show summary for last month\n"What’s my average monthly expense?" => average expenses per month\n"How much did I spend in the first week of this month?" => sum expenses for first week of current month\n"What can you do?" => list bot capabilities\n"How’s my spending vibe?" => analyze spending patterns, give fun feedback\n
Now, for the following sentence, reply with a one-sentence data plan:\nSentence: "${sentence}"`;
  const planCompletion = await openai.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that creates a data fetch plan.' },
      { role: 'user', content: planPrompt }
    ],
    max_tokens: 80,
    temperature: 0,
  });
  return planCompletion.choices[0].message.content.trim();
}

// Helper: Execute the data plan
async function executeDataPlan(plan, userId) {
  if (!userId) return { answer: "User not authenticated." };
  // 1. Top spending category
  if (/top spending category|most of your money|category you spend the most/i.test(plan)) {
    const data = await Expense.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);
    if (data.length > 0) {
      return { answer: `You spend most of your money on ${data[0]._id} ($${data[0].total}).`, data };
    } else {
      return { answer: "No expenses found to determine top category.", data: [] };
    }
  }
  // 2. Recent transactions
  if (/recent transactions|last (\d+) (expenses|incomes)/i.test(plan)) {
    const match = plan.match(/last (\d+) (expenses|incomes)/i);
    const count = match ? parseInt(match[1]) : 5;
    if (/expenses/i.test(plan)) {
      const data = await Expense.find({ userId: mongoose.Types.ObjectId(userId) }).sort({ date: -1 }).limit(count);
      return { answer: `Here are your last ${count} expenses: ${data.map(e => `${e.category} $${e.amount}`).join(", ")}`, data };
    } else {
      const data = await Income.find({ userId: mongoose.Types.ObjectId(userId) }).sort({ date: -1 }).limit(count);
      return { answer: `Here are your last ${count} incomes: ${data.map(i => `${i.source} $${i.amount}`).join(", ")}`, data };
    }
  }
  // 3. Total expenses
  if (/total expenses/i.test(plan)) {
    const data = await Expense.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    return { answer: `Your total expenses are $${data[0]?.total || 0}.`, data };
  }
  // 4. Total income
  if (/total income/i.test(plan)) {
    const data = await Income.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    return { answer: `Your total income is $${data[0]?.total || 0}.`, data };
  }
  // 5. Current balance
  if (/current balance/i.test(plan)) {
    const expenses = await Expense.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const income = await Income.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const balance = (income[0]?.total || 0) - (expenses[0]?.total || 0);
    return { answer: `Your current balance is $${balance}.`, data: { expenses, income } };
  }
  // 6. Fallback
  return { answer: "Sorry, I can only answer questions about total expenses, total income, current balance, top spending category, or recent transactions for now.", data: [] };
}

exports.parseSentence = async (req, res) => {
  const { sentence } = req.body;
  const userId = req.user?.id || req.user?._id; // If using auth, get userId
  if (!sentence) {
    return res.status(400).json({ error: 'Sentence is required.' });
  }
  try {
    // 1. Classify input
    const intent = await classifyInput(sentence);
    if (intent === 'add') {
      // Old add logic
      const prompt = `Extract the following from the sentence: (1) type: income or expense, (2) amount (number), (3) description (short text, or null if not present).\nSentence: "${sentence}"\nReturn as JSON: {\"type\":...,\"amount\":...,\"description\":...}`;
      const completion = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that extracts structured data from financial sentences.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0,
      });
      const text = completion.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse AI response.', raw: text });
      }
      return res.json(parsed);
    } else if (intent === 'query') {
      // 2. Use LLM to generate a plan for the query
      const plan = await generateDataPlan(sentence);
      // 3. Fetch data based on plan
      const { answer, data } = await executeDataPlan(plan, userId);
      // 4. Use LLM to generate a natural language answer (RAG)
      const answerPrompt = `Given the following data: ${JSON.stringify(data)}, answer the user's question: "${sentence}"`;
      const answerCompletion = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that answers user questions about their finances.' },
          { role: 'user', content: answerPrompt }
        ],
        max_tokens: 150,
        temperature: 0.2,
      });
      const finalAnswer = answerCompletion.choices[0].message.content.trim();
      return res.json({ answer: finalAnswer, plan });
    } else {
      return res.status(400).json({ error: 'Could not classify input.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 