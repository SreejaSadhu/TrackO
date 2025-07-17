const OpenAI = require('openai');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
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
      const planPrompt = `Given the user's sentence, describe in one sentence what data to fetch from the user's finances (expenses or income).\nSentence: "${sentence}"\nReply with a plan, e.g., 'total expenses for last month', 'total income for July', 'current balance', etc.`;
      const planCompletion = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that creates a data fetch plan.' },
          { role: 'user', content: planPrompt }
        ],
        max_tokens: 50,
        temperature: 0,
      });
      const plan = planCompletion.choices[0].message.content.trim();
      // 3. Fetch data based on plan (simple demo: support total expenses, total income, current balance)
      let data = null;
      let answer = '';
      if (/total expenses/i.test(plan)) {
        data = await Expense.aggregate([
          { $match: { userId: userId ? require('mongoose').Types.ObjectId(userId) : undefined } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        answer = `Your total expenses are $${data[0]?.total || 0}.`;
      } else if (/total income/i.test(plan)) {
        data = await Income.aggregate([
          { $match: { userId: userId ? require('mongoose').Types.ObjectId(userId) : undefined } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        answer = `Your total income is $${data[0]?.total || 0}.`;
      } else if (/current balance/i.test(plan)) {
        const expenses = await Expense.aggregate([
          { $match: { userId: userId ? require('mongoose').Types.ObjectId(userId) : undefined } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const income = await Income.aggregate([
          { $match: { userId: userId ? require('mongoose').Types.ObjectId(userId) : undefined } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const balance = (income[0]?.total || 0) - (expenses[0]?.total || 0);
        answer = `Your current balance is $${balance}.`;
      } else {
        answer = `Sorry, I can only answer questions about total expenses, total income, or current balance for now.`;
      }
      // 4. Use LLM to generate a natural language answer (optional, for more complex answers)
      // const answerPrompt = `Given the following data: ${JSON.stringify(data)}, answer the user's question: "${sentence}"`;
      // ...
      return res.json({ answer, plan });
    } else {
      return res.status(400).json({ error: 'Could not classify input.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 