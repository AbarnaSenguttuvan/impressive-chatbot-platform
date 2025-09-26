const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const axios = require('axios'); // For potential API integration

const router = express.Router();

class SmartGPTAI {
    constructor() {
        this.memory = new Map();
        this.conversationContext = new Map();
        this.knowledgeBase = this.initializeKnowledgeBase();
    }

    initializeKnowledgeBase() {
        return {
            technologies: {
                frontend: ["React 18", "Tailwind CSS", "JavaScript ES6+", "HTML5", "CSS3"],
                backend: ["Node.js", "Express.js", "MongoDB", "Mongoose", "JWT"],
                tools: ["Git", "VS Code", "Postman", "Chrome DevTools"],
                concepts: ["REST APIs", "MVC Architecture", "Authentication", "Real-time Communication"]
            },
            coding: {
                languages: ["JavaScript", "Python", "Java", "C++", "TypeScript"],
                frameworks: ["React", "Vue", "Angular", "Express", "Django"],
                bestPractices: [
                    "Write clean, readable code",
                    "Use meaningful variable names",
                    "Follow DRY principle",
                    "Test your code thoroughly",
                    "Use version control effectively"
                ]
            },
            projectInfo: {
                name: "AI Chat Platform",
                purpose: "Demonstrate full-stack development skills with modern technologies",
                features: ["User authentication", "Real-time chat", "Project management", "AI integration"]
            }
        };
    }

    async generateResponse(message, userId) {
        try {
            const lowerMessage = message.toLowerCase().trim();
            
            // Initialize user memory if not exists
            if (!this.memory.has(userId)) {
                this.memory.set(userId, {
                    conversationHistory: [],
                    userPreferences: {},
                    lastInteraction: new Date()
                });
            }

            const userMemory = this.memory.get(userId);
            userMemory.conversationHistory.push({ role: "user", content: message, timestamp: new Date() });

            // Keep only last 10 messages in memory
            if (userMemory.conversationHistory.length > 10) {
                userMemory.conversationHistory = userMemory.conversationHistory.slice(-10);
            }

            // Analyze message intent and generate smart response
            const response = await this.analyzeAndRespond(lowerMessage, message, userMemory);
            
            userMemory.conversationHistory.push({ 
                role: "assistant", 
                content: response, 
                timestamp: new Date() 
            });
            userMemory.lastInteraction = new Date();

            return response;

        } catch (error) {
            console.error('AI Response Error:', error);
            return "I apologize, but I'm having trouble processing your request. Could you please try again?";
        }
    }

    async analyzeAndRespond(lowerMessage, originalMessage, userMemory) {
        const context = this.getConversationContext(userMemory.conversationHistory);
        const intent = this.detectIntent(lowerMessage, originalMessage);

        switch (intent.category) {
            case 'greeting':
                return this.generateGreetingResponse(userMemory);
            
            case 'technology':
                return this.generateTechResponse(intent, context);
            
            case 'coding':
                return this.generateCodingResponse(intent, context);
            
            case 'project':
                return this.generateProjectResponse(intent);
            
            case 'help':
                return this.generateHelpResponse();
            
            case 'career':
                return this.generateCareerResponse(intent);
            
            case 'complex':
                return await this.handleComplexQuery(originalMessage, context);
            
            default:
                return this.generateEngagingResponse(originalMessage, context);
        }
    }

    detectIntent(message, originalMessage) {
        // Advanced intent detection with pattern matching
        const patterns = {
            greeting: /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i,
            technology: /\b(tech|technology|stack|framework|library|tool|software|hardware|api|database)\b/i,
            coding: /\b(code|coding|programming|develop|script|algorithm|function|variable|bug|debug|optimize)\b/i,
            project: /\b(project|portfolio|demo|showcase|application|app|website|platform)\b/i,
            help: /\b(help|support|assist|guide|how to|what is|explain|teach)\b/i,
            career: /\b(hire|job|career|interview|resume|cv|portfolio|skill|experience|internship)\b/i,
            complex: /\b(why|how|what if|compare|difference between|advantages?|disadvantages?|pros?|cons?)\b/i
        };

        for (const [category, pattern] of Object.entries(patterns)) {
            if (pattern.test(message)) {
                return {
                    category,
                    keywords: this.extractKeywords(originalMessage),
                    hasQuestion: /\?$/.test(originalMessage),
                    isTechnical: this.isTechnicalMessage(message)
                };
            }
        }

        return { category: 'general', keywords: this.extractKeywords(originalMessage) };
    }

    extractKeywords(message) {
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        return message.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.has(word))
            .slice(0, 5);
    }

    isTechnicalMessage(message) {
        const techTerms = ['javascript', 'python', 'react', 'node', 'api', 'database', 'algorithm', 'function'];
        return techTerms.some(term => message.includes(term));
    }

    generateGreetingResponse(userMemory) {
        const greetings = [
            "Hello! 👋 I'm your AI assistant. How can I help you with technology, coding, or this project today?",
            "Hi there! 🤖 Ready to dive into some tech discussions? What's on your mind?",
            "Hey! Great to see you. I'm here to chat about programming, this platform, or anything tech-related!"
        ];
        
        const lastInteraction = userMemory.lastInteraction;
        const now = new Date();
        const hoursSinceLast = (now - lastInteraction) / (1000 * 60 * 60);

        if (hoursSinceLast > 24) {
            return "Welcome back! It's been a while. What would you like to explore today?";
        }

        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    generateTechResponse(intent, context) {
        const { keywords } = intent;
        
        if (keywords.includes('react') || keywords.includes('frontend')) {
            return `React is a fantastic choice! Here's what makes it great:
- **Component-based architecture** for reusability
- **Virtual DOM** for optimal performance
- **Huge ecosystem** with tons of libraries
- **Great for SPAs** and progressive web apps

What specific aspect of React interests you?`;
        }

        if (keywords.includes('node') || keywords.includes('backend')) {
            return `Node.js is powerful for backend development:
- **JavaScript everywhere** - same language frontend/backend
- **Non-blocking I/O** for high scalability
- **NPM ecosystem** with over 1 million packages
- **Perfect for real-time applications**

Are you building something specific with Node.js?`;
        }

        if (keywords.includes('mongodb') || keywords.includes('database')) {
            return `MongoDB offers great flexibility:
- **Document-based storage** - works like JSON
- **Scalable horizontally** with sharding
- **Flexible schema** - easy to evolve
- **Great for agile development**

Need help with database design or queries?`;
        }

        return `This project showcases modern full-stack development:
- **Frontend**: React 18 with Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Real-time features** ready to implement

What technology would you like to explore in detail?`;
    }

    generateCodingResponse(intent, context) {
        const tips = [
            "💡 **Tip**: Always write descriptive variable names - it makes code self-documenting!",
            "🚀 **Best Practice**: Use version control (Git) for even small projects - it's a lifesaver!",
            "🔧 **Advice**: Test your code as you write it - small, frequent tests catch issues early.",
            "📚 **Learning**: The best way to learn programming is by building real projects!",
            "⚡ **Performance**: Focus on writing readable code first, optimize bottlenecks later."
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];

        return `I love talking about coding! ${randomTip}

I can help you with:
- **Code explanations** and best practices
- **Debugging strategies** and problem-solving
- **Technology comparisons** and recommendations
- **Project architecture** and design patterns

What specific coding topic interests you?`;
    }

    generateProjectResponse(intent) {
        return `## 🚀 About This Project

This is a **full-stack AI chat platform** demonstrating modern web development:

### ✨ Key Features
- **User Authentication** with JWT tokens
- **Real-time Chat Interface** with AI responses
- **Project Management** dashboard
- **Responsive Design** that works on all devices
- **Modern UI/UX** with glass morphism effects

### 🛠 Technical Stack
- **Frontend**: React, Tailwind CSS, Context API
- **Backend**: Node.js, Express.js, MongoDB
- **Security**: JWT authentication, input validation
- **Deployment**: Ready for cloud platforms

### 🎯 Purpose
Built to showcase full-stack development skills, clean code architecture, and modern user experience design.

What would you like to know about the implementation?`;
    }

    generateHelpResponse() {
        return `## 🤖 How I Can Help You

I'm your AI assistant specialized in technology and programming. Here's what I can do:

### 💬 **Conversation Topics**
- **Technology Discussions**: React, Node.js, MongoDB, etc.
- **Coding Help**: Best practices, debugging, architecture
- **Project Insights**: Details about this platform's implementation
- **Career Advice**: Programming skills, portfolio building

### 🎯 **Ask Me About**
- How specific features were implemented
- Technology comparisons and recommendations
- Coding best practices and patterns
- Career guidance for developers

### 💡 **Pro Tip**
Be specific with your questions! Instead of "help with React", try "How do React hooks improve component logic?"

What would you like to explore first?`;
    }

    generateCareerResponse(intent) {
        return `## 💼 Developer Career Insights

### 🚀 **Building a Strong Portfolio**
- **Showcase real projects** (like this one!)
- **Document your code** with README files
- **Highlight problem-solving** skills
- **Demonstrate learning agility**

### 📚 **Key Skills for 2024**
- **Frontend**: React/Vue, TypeScript, responsive design
- **Backend**: Node.js/Python, APIs, database design
- **Tools**: Git, Docker, testing frameworks
- **Soft Skills**: Communication, teamwork, problem-solving

### 🎯 **Interview Preparation**
- **Practice algorithms** on LeetCode/HackerRank
- **Build projects** that solve real problems
- **Understand system design** fundamentals
- **Prepare your story** - why programming?

### 🌟 **This Project Demonstrates**
- Full-stack development capabilities
- Modern UI/UX design principles
- Clean code architecture
- Authentication and security implementation

Need specific career advice or technical interview tips?`;
    }

    async handleComplexQuery(message, context) {
        // For more complex queries, we can simulate deeper analysis
        if (message.includes('difference between') || message.includes('compare')) {
            return this.handleComparisonQuery(message);
        }

        if (message.includes('why') || message.includes('benefit')) {
            return this.handleExplanationQuery(message);
        }

        // Fallback to intelligent response
        return this.generateInDepthResponse(message, context);
    }

    handleComparisonQuery(message) {
        if (message.includes('react') && message.includes('vue')) {
            return `## ⚡ React vs Vue - Key Differences

### **React**
- **Learning Curve**: Steeper due to JSX and ecosystem complexity
- **Flexibility**: Unopinionated - choose your own architecture
- **Ecosystem**: Larger, more third-party libraries
- **Job Market**: More opportunities, especially in large companies

### **Vue**
- **Learning Curve**: Gentler, great documentation
- **Structure**: More opinionated with built-in solutions
- **Performance**: Slightly smaller bundle size
- **Adoption**: Growing rapidly, popular for new projects

**Verdict**: Both are excellent! React for large teams/long-term projects, Vue for rapid development.`;
        }

        return "I'd be happy to compare technologies! Could you specify which two technologies you'd like me to compare? (e.g., React vs Angular, MongoDB vs PostgreSQL)";
    }

    generateInDepthResponse(message, context) {
        const responses = [
            `That's an interesting question! Based on my analysis, here are some key insights...`,
            `Great question! Let me break this down into a comprehensive answer...`,
            `I've analyzed your query, and here's what I think you'll find valuable...`,
            `From a technical perspective, here's my detailed take on this...`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return `${randomResponse}

**Key Points:**
- Consider the specific use case and requirements
- Evaluate long-term maintainability and scalability
- Factor in team expertise and learning curve
- Always prototype and test with real users

Would you like me to dive deeper into any specific aspect?`;
    }

    generateEngagingResponse(message, context) {
        const engagingPrompts = [
            "That's fascinating! Tell me more about what you're working on.",
            "I'd love to help you explore that further. What specific aspect interests you most?",
            "Great topic! Here's what I think might be valuable for you to consider...",
            "Interesting perspective! From a technical standpoint, here are some thoughts..."
        ];

        const randomPrompt = engagingPrompts[Math.floor(Math.random() * engagingPrompts.length)];
        
        return `${randomPrompt}

I can help you with technical details, implementation strategies, or just have a conversation about technology and programming. What would you like to dive into?`;
    }

    getConversationContext(history) {
        if (history.length === 0) return { topics: [], recentFocus: '' };
        
        const recentMessages = history.slice(-3);
        const topics = new Set();
        
        recentMessages.forEach(msg => {
            this.extractKeywords(msg.content).forEach(keyword => topics.add(keyword));
        });

        return {
            topics: Array.from(topics),
            recentFocus: recentMessages[recentMessages.length - 1]?.content || '',
            messageCount: history.length
        };
    }
}

// Enhanced AI instance
const smartAI = new SmartGPTAI();

// Health check endpoint
router.get('/health', auth, (req, res) => {
    res.json({ 
        success: true, 
        status: 'AI Service Running', 
        timestamp: new Date().toISOString(),
        features: ['Smart responses', 'Context awareness', 'Multi-topic expertise']
    });
});

// Enhanced chat endpoint
router.post('/:projectId', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id.toString();

        // Enhanced validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a meaningful message to start the conversation' 
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is too long (maximum 1000 characters)' 
            });
        }

        // Find project with enhanced error handling
        const project = await Project.findOne({ 
            _id: req.params.projectId, 
            userId: userId 
        });

        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found or access denied' 
            });
        }

        // Generate smart AI response
        const aiResponse = await smartAI.generateResponse(message, userId);

        // Enhanced session management
        if (!project.chatSessions) project.chatSessions = [];
        
        if (project.chatSessions.length === 0 || 
            project.chatSessions[project.chatSessions.length - 1].messages.length >= 100) {
            
            project.chatSessions.push({ 
                title: `AI Chat - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                messages: [], 
                createdAt: new Date(),
                messageCount: 0
            });
        }

        const currentSession = project.chatSessions[project.chatSessions.length - 1];
        if (!currentSession.messages) currentSession.messages = [];

        // Add messages with enhanced metadata
        currentSession.messages.push(
            { 
                role: 'user', 
                content: message, 
                timestamp: new Date(),
                messageId: `user_${Date.now()}`,
                length: message.length
            },
            { 
                role: 'assistant', 
                content: aiResponse, 
                timestamp: new Date(),
                messageId: `ai_${Date.now()}`,
                length: aiResponse.length,
                responseTime: Date.now() // Simple timing
            }
        );

        currentSession.messageCount = currentSession.messages.length;
        currentSession.updatedAt = new Date();

        // Optimize storage - keep last 100 messages per session
        if (currentSession.messages.length > 100) {
            currentSession.messages = currentSession.messages.slice(-100);
        }

        await project.save();

        // Enhanced response with analytics
        res.json({ 
            success: true, 
            response: aiResponse, 
            messageId: Date.now().toString(),
            timestamp: new Date().toISOString(),
            analytics: {
                responseLength: aiResponse.length,
                responseTime: 'instant',
                conversationDepth: smartAI.memory.get(userId)?.conversationHistory.length || 1
            }
        });

    } catch (error) {
        console.error('Enhanced Chat Error:', error);
        
        // More specific error responses
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid project ID format' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'AI service temporarily unavailable. Please try again in a moment.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Enhanced history endpoint
router.get('/:projectId/history', auth, async (req, res) => {
    try {
        const { limit = 50, session = 'latest' } = req.query;

        const project = await Project.findOne({ 
            _id: req.params.projectId, 
            userId: req.user._id 
        });

        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }

        let messages = [];
        if (project.chatSessions && project.chatSessions.length > 0) {
            const targetSession = session === 'latest' 
                ? project.chatSessions[project.chatSessions.length - 1]
                : project.chatSessions.find(s => s._id.toString() === session);

            if (targetSession && targetSession.messages) {
                messages = targetSession.messages.slice(-parseInt(limit));
            }
        }

        res.json({ 
            success: true, 
            messages,
            sessionInfo: {
                totalSessions: project.chatSessions?.length || 0,
                currentSessionMessages: messages.length,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('History Fetch Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching chat history' 
        });
    }
});

// New endpoint to get conversation analytics
router.get('/:projectId/analytics', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ 
            _id: req.params.projectId, 
            userId: req.user._id 
        });

        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }

        const analytics = {
            totalSessions: project.chatSessions?.length || 0,
            totalMessages: project.chatSessions?.reduce((acc, session) => 
                acc + (session.messages?.length || 0), 0) || 0,
            lastActivity: project.updatedAt,
            sessionBreakdown: project.chatSessions?.map(session => ({
                sessionId: session._id,
                messageCount: session.messages?.length || 0,
                createdAt: session.createdAt,
                title: session.title
            }))
        };

        res.json({ success: true, analytics });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching analytics' 
        });
    }
});

module.exports = router;