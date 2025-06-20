import { getOpenAIKey } from '../../lib/env-helper';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { message, history = [] } = req.body;
  
  // Get API key using the helper function
  const apiKey = getOpenAIKey();

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: "You are a chatbot helping recruiters learn about Olga Yasovsky's leadership, R&D experience, and personality through stories and answers." },
      ...history.map((msg) => ({ role: msg.fromUser ? 'user' : 'assistant', content: msg.content })),
      { role: 'user', content: message }
    ]
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from OpenAI' });
  }
}
