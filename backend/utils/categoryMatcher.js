const categoryMap = require('../data/categoryMap.json');

/**
 * Normalize a string for matching (lowercase, remove special chars)
 */
function normalizeString(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Match a name/description to a category
 * Returns { category, confidence, subcategory }
 */
function matchCategory(name) {
  if (!name || typeof name !== 'string') {
    return { category: 'Miscellaneous', confidence: 0, subcategory: null };
  }

  const normalized = normalizeString(name);
  let bestMatch = {
    category: 'Miscellaneous',
    confidence: 0,
    subcategory: null
  };

  // Check each category
  for (const [categoryName, categoryData] of Object.entries(categoryMap)) {
    const keywords = categoryData.keywords || [];
    
    // Check if any keyword matches
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeString(keyword);
      
      // Exact match gets highest confidence
      if (normalized === normalizedKeyword) {
        return {
          category: categoryName,
          confidence: 1.0,
          subcategory: categoryData.subcategories?.[0] || null
        };
      }
      
      // Partial match (keyword is contained in name)
      if (normalized.includes(normalizedKeyword)) {
        const confidence = normalizedKeyword.length / normalized.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            category: categoryName,
            confidence: confidence,
            subcategory: categoryData.subcategories?.[0] || null
          };
        }
      }
      
      // Reverse partial match (name is contained in keyword)
      if (normalizedKeyword.includes(normalized)) {
        const confidence = normalized.length / normalizedKeyword.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            category: categoryName,
            confidence: confidence,
            subcategory: categoryData.subcategories?.[0] || null
          };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Get all available categories
 */
function getAllCategories() {
  return Object.keys(categoryMap).map(categoryName => ({
    name: categoryName,
    icon: categoryMap[categoryName].icon,
    color: categoryMap[categoryName].color,
    subcategories: categoryMap[categoryName].subcategories
  }));
}

/**
 * Get metadata for a specific category
 */
function getCategoryMetadata(categoryName) {
  const category = categoryMap[categoryName];
  if (!category) {
    return null;
  }
  
  return {
    name: categoryName,
    icon: category.icon,
    color: category.color,
    subcategories: category.subcategories,
    keywords: category.keywords
  };
}

/**
 * Normalize category name (handle variations)
 */
function normalizeCategory(categoryName) {
  if (!categoryName) return 'Miscellaneous';
  
  // Check if it's an exact match
  if (categoryMap[categoryName]) {
    return categoryName;
  }
  
  // Try case-insensitive match
  const normalized = categoryName.toLowerCase();
  for (const key of Object.keys(categoryMap)) {
    if (key.toLowerCase() === normalized) {
      return key;
    }
  }
  
  // Default to Miscellaneous
  return 'Miscellaneous';
}

module.exports = {
  matchCategory,
  getAllCategories,
  getCategoryMetadata,
  normalizeCategory
};
