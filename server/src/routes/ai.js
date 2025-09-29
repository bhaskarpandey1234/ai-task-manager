const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Check if API key is configured
if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY not found in environment variables');
} else {
  console.log('Groq API key configured:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
}

// Generate subtasks using AI
router.post('/generate-subtasks', authenticateToken, [
  body('title').trim().isLength({ min: 1 }),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful task management assistant. Break down tasks into 3-5 actionable subtasks. Return only a JSON array of strings.'
          },
          {
            role: 'user',
            content: `Break down this task: "${title}"${description ? ` - ${description}` : ''}`
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      const subtasks = JSON.parse(content);
      const validSubtasks = Array.isArray(subtasks) 
        ? subtasks.filter(task => typeof task === 'string').slice(0, 5)
        : [];
      
      const formattedSubtasks = validSubtasks.map(task => ({
        title: task,
        description: ''
      }));

      res.json({ subtasks: formattedSubtasks });
    } catch (parseError) {
      // Fallback: split by lines if JSON parsing fails
      const lines = content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
      const fallbackSubtasks = lines.map(line => ({
        title: line.replace(/^[\d\-\*\.\s]+/, '').trim(),
        description: ''
      }));
      
      res.json({ subtasks: fallbackSubtasks });
    }

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ message: 'Failed to generate subtasks' });
  }
});

module.exports = router;