const { VertexAI } = require('@google-cloud/vertexai');

class GeminiBusinessAI {
  constructor() {
    // Cloud Shell automatically authenticates, no API key needed!
    this.vertexAI = new VertexAI({
      project: 'bnb-marathon-2025',  // Your project ID
      location: 'us-central1'
    });
    
    this.model = 'gemini-1.0-pro';
    this.generativeModel = this.vertexAI.preview.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });
  }

  async generateBusinessAnalysis(prompt) {
    try {
      console.log('🧠 Calling Google Gemini AI...');
      
      const request = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are SmartBiz AI - a professional business consultant. Generate detailed business analysis for:

${prompt}

Provide comprehensive analysis with:
1. Market size and trends
2. Target audience and demographics  
3. Competition analysis
4. Financial projections
5. Risk assessment
6. Success probability
7. Strategic recommendations

Format with clear sections and use emojis for visual appeal.`
              }
            ]
          }
        ]
      };

      const response = await this.generativeModel.generateContent(request);
      const analysis = response.response.candidates[0].content.parts[0].text;
      
      console.log('✅ Gemini AI Response received');
      return analysis;
      
    } catch (error) {
      console.error('❌ Gemini AI Error:', error);
      // Fallback response if AI fails
      return this.getFallbackResponse(prompt);
    }
  }

  getFallbackResponse(prompt) {
    return `
🚀 **SMARTBIZ AI BUSINESS ANALYSIS**

**PROMPT**: ${prompt}

📊 **MARKET ANALYSIS**:
• Growing demand in current market
• Target: Urban professionals and millennials
• Competition: Medium level with differentiation opportunities

💰 **FINANCIAL PROJECTIONS**:
• Initial Investment: Varies based on scale
• Revenue Potential: Strong with proper execution
• Break-even: 12-18 months typical

🎯 **SUCCESS PROBABILITY: 75%** ✅

**RECOMMENDATIONS**:
1. Conduct local market validation
2. Build strong online presence
3. Focus on customer experience
4. Consider partnerships

*Note: Enhanced AI analysis available when Gemini API is fully configured*
`;
  }
}

module.exports = GeminiBusinessAI;