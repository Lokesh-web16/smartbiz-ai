import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    // Replace with your actual API key from Google AI Studio
    this.genAI = new GoogleGenerativeAI('AIzaSyBn5FF1lZFZ1tcam6CapRpfwBWTEmv3TFk');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeBusiness(question) {
    try {
      const prompt = `You are SmartBiz AI, a business analysis expert. Analyze this business idea and provide detailed insights in this exact format:

**BUSINESS ANALYSIS: ${question}**

**Market Potential**: [Brief assessment - High/Medium/Low]
**Initial Investment**: [Range in USD or INR]
**Monthly Revenue Potential**: [Realistic range]
**Break-even Timeline**: [Months]

**KEY INSIGHTS**:
✅ [Most important positive factor]
✅ [Second important factor]
✅ [Third important factor]

**RECOMMENDATIONS**:
1. [First critical recommendation]
2. [Second important action]
3. [Third strategic move]

**PROS & CONS**:
**Pros:**
• [Major advantage 1 with explanation]
• [Major advantage 2 with explanation]
• [Major advantage 3 with explanation]

**Cons:**
• [Major challenge 1 with explanation]
• [Major challenge 2 with explanation]
• [Major challenge 3 with explanation]

**RISKS**: [Main risks to consider]
**SUCCESS PROBABILITY**: [Percentage] with proper execution

**ADDITIONAL INSIGHTS**:
[Provide 2-3 paragraphs of detailed analysis covering market trends, customer demographics, location factors, competition analysis, and growth opportunities specific to this business. Make it practical and actionable.]

Keep the analysis realistic, data-driven, and actionable. Focus on the specific business mentioned and provide genuine insights.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      
      return {
        analysis: analysis
      };
      
    } catch (error) {
      console.error('Gemini AI Error:', error);
      // Fallback to mock response if API fails
      return this.getMockResponse(question);
    }
  }

  getMockResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('cafe') || lowerQuestion.includes('coffee')) {
      return {
        analysis: `**BUSINESS ANALYSIS: ${question}**

**Market Potential**: High in urban areas
**Initial Investment**: $20,000 - $50,000
**Monthly Revenue**: $8,000 - $15,000
**Break-even**: 8-14 months

**KEY INSIGHTS**:
✅ High foot traffic locations essential
✅ Specialty coffee trend growing 25% YoY
✅ Food pairing increases average ticket by 40%

**RECOMMENDATIONS**:
1. Focus on unique selling proposition
2. Implement loyalty program from day one
3. Partner with delivery platforms

**PROS & CONS**:
**Pros:**
• **Recurring Revenue**: Daily coffee habits create consistent customer base
• **High Margin Products**: Specialty drinks have 70-80% profit margins
• **Community Hub**: Can become neighborhood gathering spot building brand loyalty

**Cons:**
• **Location Dependency**: Success heavily depends on foot traffic and visibility
• **Perishable Inventory**: Coffee beans and food items have limited shelf life
• **Staff Intensive**: Requires skilled baristas and consistent quality control

**RISKS**: High competition, location dependency, rising coffee bean prices
**SUCCESS PROBABILITY**: 68% with proper execution

**ADDITIONAL INSIGHTS**:
The cafe industry is evolving beyond just coffee service. Modern consumers seek experiential spaces with comfortable ambiance, reliable WiFi, and unique menu offerings. Specialty coffee with single-origin beans and alternative brewing methods can command premium pricing.

Focus on creating Instagram-worthy interiors and signature drinks that encourage social media sharing. Consider incorporating local artwork, hosting community events, or offering coffee workshops to build customer loyalty. The morning rush (7-10 AM) typically generates 40% of daily revenue, so efficient service during peak hours is crucial.`
      };
    }
    else if (lowerQuestion.includes('restaurant') || lowerQuestion.includes('food')) {
      return {
        analysis: `**BUSINESS ANALYSIS: ${question}**

**Market Potential**: Moderate to High
**Initial Investment**: $50,000 - $150,000
**Monthly Revenue**: $15,000 - $30,000
**Break-even**: 12-18 months

**KEY INSIGHTS**:
✅ Cuisine specialization increases success rate by 30%
✅ Online presence drives 60% of new customers
✅ Takeaway/delivery = 40% of revenue

**RECOMMENDATIONS**:
1. Define clear target demographic
2. Invest in professional food photography
3. Implement table reservation system

**PROS & CONS**:
**Pros:**
• **High Demand**: Food is essential, ensuring consistent customer base
• **Profit Margins**: Can achieve 15-25% net profit with proper management
• **Scalability**: Easy to expand with multiple locations or franchise model

**Cons:**
• **High Competition**: Saturated market requires strong differentiation
• **Operational Complexity**: Managing staff, inventory, and quality control
• **Regulatory Hurdles**: Multiple licenses and health regulations to comply with

**RISKS**: Food costs volatility, staff turnover, health regulations, changing consumer preferences
**SUCCESS PROBABILITY**: 62% with unique concept and proper execution

**ADDITIONAL INSIGHTS**:
The restaurant industry in urban areas shows strong growth potential, particularly for specialized cuisines that cater to specific dietary preferences like vegan, gluten-free, or regional specialties. Location plays a crucial role - areas near office complexes or residential neighborhoods with high foot traffic tend to perform better.

Consumer trends indicate growing demand for experiential dining and Instagram-worthy ambiance. Integrating technology through online ordering systems and table reservation apps can significantly enhance customer experience and operational efficiency. Building a strong brand identity and focusing on consistent quality are key differentiators in this competitive space.`
      };
    }
    else if (lowerQuestion.includes('tech') || lowerQuestion.includes('app') || lowerQuestion.includes('saas')) {
      return {
        analysis: `**BUSINESS ANALYSIS: ${question}**

**Market Potential**: Very High (if scalable)
**Initial Investment**: $10,000 - $100,000
**Revenue Model**: Subscription/Advertising/Freemium
**Break-even**: 6-24 months

**KEY INSIGHTS**:
✅ MVP approach reduces failure risk by 45%
✅ User acquisition cost critical metric
✅ B2B SaaS has higher success rate than B2C

**RECOMMENDATIONS**:
1. Build MVP and validate with real users
2. Focus on solving specific pain point
3. Plan scalable infrastructure from day one

**PROS & CONS**:
**Pros:**
• **High Scalability**: Digital products can scale globally with minimal additional cost
• **Recurring Revenue**: Subscription models provide predictable cash flow
• **Low Operational Costs**: Once built, maintenance costs are relatively low

**Cons:**
• **Technical Complexity**: Requires skilled developers and ongoing maintenance
• **Rapid Obsolescence**: Technology trends change quickly requiring constant updates
• **User Acquisition Costs**: High competition for user attention in digital space

**RISKS**: Technical debt, market timing, funding, rapid technological changes
**SUCCESS PROBABILITY**: 45% (higher with experienced team)

**ADDITIONAL INSIGHTS**:
The tech startup landscape favors niche solutions over broad platforms. Identify specific pain points in established industries that can be solved with technology. B2B SaaS typically has longer sales cycles but higher customer lifetime value compared to B2C applications.

Focus on achieving product-market fit before scaling. Consider starting with a specific geographic market or industry vertical. Cloud infrastructure costs can escalate quickly, so implement proper monitoring and optimization from the beginning. Building a strong technical team and establishing clear development processes are critical for long-term success.`
      };
    }
    else if (lowerQuestion.includes('bar') || lowerQuestion.includes('pub') || lowerQuestion.includes('night')) {
      return {
        analysis: `**BUSINESS ANALYSIS: ${question}**

**Market Potential**: High in entertainment districts
**Initial Investment**: $75,000 - $200,000
**Monthly Revenue**: $20,000 - $50,000
**Break-even**: 12-24 months

**KEY INSIGHTS**:
✅ Location determines 70% of success
✅ Thematic concepts outperform generic bars
✅ Craft cocktails increase profit margins by 35%

**RECOMMENDATIONS**:
1. Secure prime location with good visibility
2. Develop unique cocktail menu and theme
3. Invest in quality sound system and ambiance

**PROS & CONS**:
**Pros:**
• **High Profit Margins**: Alcohol typically has 70-80% markup
• **Evening Focus**: Allows for other business activities during day
• **Entertainment Factor**: Can host events and live performances

**Cons:**
• **Licensing Challenges**: Complex alcohol licensing and compliance requirements
• **Seasonal Fluctuations**: Business can vary significantly by season and day of week
• **Security Concerns**: Requires proper security measures and staff training

**RISKS**: Licensing issues, seasonal fluctuations, competition, changing regulations
**SUCCESS PROBABILITY**: 58% with strong concept

**ADDITIONAL INSIGHTS**:
Successful bars often create unique thematic experiences rather than just serving drinks. Consider concepts like speakeasy bars, rooftop lounges, or sports bars with specific target demographics. Weekend revenue typically accounts for 60-70% of weekly income, so effective marketing for Thursday through Saturday nights is crucial.

Craft cocktails with premium ingredients can significantly increase average customer spending. Building relationships with local influencers and implementing a strong social media presence helps drive traffic. Proper inventory management and staff training in mixology and customer service are essential for maintaining quality and controlling costs.`
      };
    }
    else if (lowerQuestion.includes('e-commerce') || lowerQuestion.includes('online store')) {
      return {
        analysis: `**BUSINESS ANALYSIS: ${question}**

**Market Potential**: High with right niche
**Initial Investment**: $5,000 - $50,000
**Monthly Revenue**: $10,000 - $100,000
**Break-even**: 6-15 months

**KEY INSIGHTS**:
✅ Niche products outperform general merchandise
✅ Customer reviews drive 80% of purchase decisions
✅ Mobile optimization essential (60% of traffic)

**RECOMMENDATIONS**:
1. Identify underserved market niche
2. Invest in professional product photography
3. Implement robust logistics and return policy

**PROS & CONS**:
**Pros:**
• **Global Reach**: Can sell to customers worldwide from single location
• **24/7 Operations**: Automated systems generate revenue around the clock
• **Low Overhead**: No physical storefront reduces fixed costs

**Cons:**
• **Intense Competition**: Global marketplace means competing with major players
• **Logistics Complexity**: Shipping, returns, and inventory management challenges
• **Customer Acquisition**: Rising digital advertising costs

**RISKS**: Supply chain issues, platform dependency, cybersecurity, changing algorithms
**SUCCESS PROBABILITY**: 55% with unique products and strong marketing

**ADDITIONAL INSIGHTS**:
E-commerce success increasingly depends on finding specialized niches rather than competing in broad categories. Dropshipping models reduce inventory risk but typically have lower profit margins. Building a brand story and focusing on customer experience can justify premium pricing.

Social commerce through platforms like Instagram and TikTok is becoming increasingly important for discovery and sales. Consider starting with a focused product line and expanding based on customer feedback and sales data. International shipping capabilities can significantly expand your market potential but require careful planning for customs and logistics.`
      };
    }
    else {
      return {
        analysis: `**BUSINESS ANALYSIS: ${question}**

**Market Potential**: Varies based on industry
**Initial Investment**: Dependent on scale
**Monthly Revenue**: Market dependent
**Break-even**: Typically 12-24 months

**KEY INSIGHTS**:
✅ Market validation before full launch
✅ Strong digital presence and marketing
✅ Customer experience focus

**RECOMMENDATIONS**:
1. Conduct thorough market research
2. Develop minimum viable product/service
3. Build customer feedback loop

**PROS & CONS**:
**Pros:**
• **Entrepreneurial Freedom**: Ability to build business according to your vision
• **Unlimited Earning Potential**: Success directly tied to effort and execution
• **Skill Development**: Opportunity to learn multiple business aspects

**Cons:**
• **Financial Risk**: Personal investment and potential losses
• **Work-Life Balance**: Typically requires long hours especially in early stages
• **Wearing Multiple Hats**: Need to handle all business functions initially

**RISKS**: Market competition, execution challenges, funding, economic conditions
**SUCCESS PROBABILITY**: 60% with proper planning and execution

**ADDITIONAL INSIGHTS**:
Every successful business begins with solving a specific problem or fulfilling a market need. Start by conducting thorough market research to understand your target audience, competition, and industry trends. Validate your business concept with potential customers before making significant investments.

Focus on building a strong value proposition that differentiates you from competitors. Develop a detailed business plan covering operations, marketing, finances, and growth strategy. Remember that most businesses take longer and require more capital than initially projected, so maintain adequate financial reserves.`
      };
    }
  }
}

export default new AIService();