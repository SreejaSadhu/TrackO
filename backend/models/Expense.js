const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // Expense description/name
  icon: { type: String }, 
  category: { type: String, required: true }, // Example: Food, Rent, Groceries
  subCategory: { type: String }, // Detailed tracking (e.g., "Restaurant", "Fast Food")
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Expense", ExpenseSchema);
