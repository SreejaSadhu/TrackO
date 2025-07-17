const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.parseSentence = async (req, res) => {
  const { sentence } = req.body;
  if (!sentence) {
    return res.status(400).json({ error: 'Sentence is required.' });
  }
  try {
    const prompt = `Extract the following from the sentence: (1) type: income or expense, (2) amount (number), (3) description (short text).\nSentence: "${sentence}"\nReturn as JSON: {\"type\":..., \"amount\":..., \"description\":...}`;
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts structured data from financial sentences.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0,
    });
    const text = completion.data.choices[0].message.content;
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