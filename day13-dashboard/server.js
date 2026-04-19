const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const client = new Anthropic();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/tone', async (req, res) => {
  const { text, tone } = req.body;
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Rewrite the following text in a ${tone} tone. Return only the rewritten text, no explanation.\n\n${text}`
      }]
    });
    res.json({ result: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/email', async (req, res) => {
  const { recipient, situation, goal, tone, details } = req.body;
  const detailsLine = details ? `Specific points to include: ${details}.` : '';
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are an expert business writer. Draft clear, polished emails.',
      messages: [{
        role: 'user',
        content: `Draft a professional email.\nRecipient: ${recipient}\nSituation: ${situation}\nGoal: ${goal}\nTone: ${tone}\n${detailsLine}\n\nInclude Subject line, greeting, body, and sign-off. Output only the email.`
      }]
    });
    res.json({ result: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/brief', async (req, res) => {
  const { product, audience, usp, tone, cta } = req.body;
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a senior copywriter. Write structured, actionable copywriting briefs.',
      messages: [{
        role: 'user',
        content: `Create a copywriting brief.\nProduct/Service: ${product}\nTarget Audience: ${audience}\nUnique Selling Point: ${usp}\nTone: ${tone}\nCall to Action: ${cta}\n\nStructure with: Overview, Target Audience, Key Messages, Tone & Voice, CTA, and Do/Don't guidelines. Output only the brief.`
      }]
    });
    res.json({ result: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Dashboard running at http://localhost:${PORT}`));
