const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getBudgets, saveBudgets, getBudgetInsights, getCategories } = require("../controllers/budgetController");
const router = express.Router();

router.post("/save", protect, saveBudgets);
router.get("/get", protect, getBudgets);
router.get("/insights", protect, getBudgetInsights);
router.get("/categories", protect, getCategories);

module.exports = router;