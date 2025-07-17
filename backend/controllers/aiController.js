const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com/v1", // Update if DeepSeek uses a different base URL
});

exports.parseSentence = async (req, res) => {
  const { sentence } = req.body;
  if (!sentence) {
    return res.status(400).json({ error: 'Sentence is required.' });
  }
  try {
    const prompt = `Extract the following from the sentence: (1) type: income or expense, (2) amount (number), (3) description (short text, or null if not present).\nSentence: "${sentence}"\nReturn as JSON: {\"type\":...,\"amount\":...,\"description\":...}`;
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat', // Use DeepSeek's model name
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
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 