const express = require('express');
const cors = require('cors');
const GeminiBusinessAI = require('./gemini-ai');  // ADD THIS LINE

const app = express();
const businessAI = new GeminiBusinessAI();  // CREATE AI INSTANCE

// CORS
app.use(cors({ origin: true }));
app.use(express.json());

// REAL AI ENDPOINT
app.post('/api/chat', async (req, res) => {
  console.log('📨 Received:', req.body.message);
  
  try {
    // USE REAL GEMINI AI!
    const aiResponse = await businessAI.generateBusinessAnalysis(req.body.message);
    
    res.json({ 
      success: true, 
      response: aiResponse 
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.json({ 
      success: false, 
      response: 'AI service temporarily unavailable' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', ai: 'Gemini AI Ready' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SmartBiz AI Backend with Gemini running on port ${PORT}`);
});