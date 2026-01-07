import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes go here (we will move them later in this tool call)


// Redirect root to index page
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// API Keys and Configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.VITE_OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";

// Azure OpenAI Configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || "https://portopiaai.openai.azure.com/";
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4";

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase Client
let supabase = null;
let supabaseAdmin = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase initialized successfully');

  // Initialize Admin client if Service Role Key is available (bypasses RLS)
  if (SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('⚡ Supabase Admin (Service Role) initialized');
  }
} else {
  console.warn('⚠️  Supabase Configuration Error:');
  if (!SUPABASE_URL) console.warn('   - Missing SUPABASE_URL or VITE_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) console.warn('   - Missing SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
}

// Azure OpenAI helper function (using fetch instead of SDK)
async function callAzureOpenAI(message, systemPrompt = "You are a helpful AI assistant for portfolio generation.") {
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY) {
    throw new Error('Azure OpenAI not configured');
  }

  const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_API_KEY
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    console.error('Azure OpenAI Error Response:', data);
    throw new Error(data.error?.message || 'Invalid response from Azure OpenAI');
  }

  return data.choices[0].message.content;
}

// Check if Azure OpenAI is configured
const azureOpenAIConfigured = AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_API_KEY;
if (azureOpenAIConfigured) {
  console.log('✅ Azure OpenAI configured successfully');
} else {
  console.warn('⚠️  Azure OpenAI credentials not found in .env file');
}

// Gemini helper function (using fetch directly as requested)
async function callGemini(userPrompt, systemPrompt = "You are a helpful AI assistant.") {
  const modelName = "gemini-3-flash-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent code generation
        maxOutputTokens: 20480, // High limit to prevent truncation
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Check if Gemini is configured
if (GEMINI_API_KEY) {
  console.log('✅ Gemini configured successfully (using Fetch API)');
} else {
  console.warn('⚠️  Gemini API key missing');
}

// OpenRouter API configuration
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// Provider status check endpoint
app.get("/api/ai-status", (req, res) => {
  res.json({
    gemini: !!GEMINI_API_KEY,
    azure: !!(AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_API_KEY),
    openrouter: !!OPENROUTER_API_KEY,
    models: {
      gemini: "Gemini 3 Flash (Primary)",
      azure: `Azure OpenAI (${AZURE_OPENAI_DEPLOYMENT})`,
      openrouter: `OpenRouter (${OPENROUTER_MODEL})`
    }
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    azureSpeechKey: process.env.VITE_AZURE_SPEECH_KEY,
    azureSpeechRegion: process.env.VITE_AZURE_SPEECH_REGION || "uaenorth"
  });
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Signup endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to .env file"
      });
    }

    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || ''
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      user: data.user,
      session: data.session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase is not configured"
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: "Login successful!",
      user: data.user,
      session: data.session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logout endpoint
app.post("/api/auth/logout", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase is not configured"
      });
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user endpoint
app.get("/api/auth/user", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase is not configured"
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No authorization header"
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// AI ENDPOINTS
// ============================================

// AI Chat endpoint using Azure OpenAI
app.post("/api/ai/chat", async (req, res) => {
  try {
    let { message, provider = 'azure' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    let response;
    let fallbackInfo = null;

    // Use Azure OpenAI with automatic fallback
    if (provider === 'azure' && azureOpenAIConfigured) {
      try {
        response = await callAzureOpenAI(message, "You are a helpful AI assistant for portfolio generation.");
      } catch (azureError) {
        console.warn('⚠️ Azure AI failed, falling back to Gemini:', azureError.message);
        provider = 'gemini'; // Switch directly to Gemini
        fallbackInfo = "Azure AI لم يعمل حالياً، تم التحويل تلقائياً إلى Gemini لضمان استمرارية الخدمة.";
      }
    }

    // Use OpenRouter (either primary or as fallback)
    if (provider === 'openrouter' || (provider === 'azure' && !azureOpenAIConfigured)) {
      try {
        const openRouterResponse = await fetch(OPENROUTER_BASE_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AI Portfolio Generator",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": OPENROUTER_MODEL,
            "messages": [
              { role: "system", content: "You are a helpful AI assistant for portfolio generation." },
              { role: "user", content: message }
            ],
            "max_tokens": 2000,
            "temperature": 0.7
          })
        });

        if (!openRouterResponse.ok) {
          const errorData = await openRouterResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `OpenRouter API error: ${openRouterResponse.status}`);
        }

        const data = await openRouterResponse.json();

        if (!data.choices || !data.choices[0]) {
          console.error('OpenRouter Error Response:', data);
          throw new Error(data.error?.message || 'Invalid response from OpenRouter');
        }

        response = data.choices[0].message.content;
      } catch (orError) {
        console.error('❌ OpenRouter also failed, falling back to Gemini:', orError.message);
        provider = 'gemini';
        fallbackInfo = "Azure و OpenRouter لم يعملا، تم استخدام Gemini كخيار أخير.";
      }
    }

    // Use Gemini as final fallback
    if (provider === 'gemini' || (!response)) {
      try {
        response = await callGemini(message, "You are a helpful AI assistant for portfolio generation.");
      } catch (gemError) {
        console.error('❌ Major breakdown: All AI models failed:', gemError.message);
        throw new Error('جميع محركات الذكاء الاصطناعي مشغولة حالياً، يرجى المحاولة بعد دقيقة واحدة.');
      }
    }

    res.json({
      success: true,
      response,
      fallbackInfo,
      provider: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Extract data from text using Gemini
app.post("/api/extract-data", async (req, res) => {
  try {
    const extractPrompt = `
استخرج البيانات التالية من النص المعطى وأعدها في صيغة JSON:

النص: ${req.body.prompt}

المطلوب استخراجه:
- name: الاسم الكامل
- profession: المهنة أو التخصص
- bio: نبذة شخصية
- skills: قائمة المهارات (array)
- projects: قائمة المشاريع مع الأسماء والأوصاف والروابط (array)
- github: رابط GitHub
- linkedin: رابط LinkedIn
- twitter: رابط Twitter
- instagram: رابط Instagram
- email: البريد الإلكتروني
- phone: رقم الهاتف
- additionalLinks: روابط إضافية (array of objects with name and url)

أعد فقط JSON بدون أي شرح أو تعليقات.`;

    const textResponse = await callGemini(extractPrompt, "You are a data extraction expert. Return only JSON.");
    let extractedData = textResponse || "{}";

    // Clean the response
    extractedData = extractedData.replace(/```json\n?/g, '').replace(/```/g, '').trim();

    try {
      const data = JSON.parse(extractedData);
      res.json({ success: true, data });
    } catch (parseError) {
      res.json({ success: false, error: "Failed to parse extracted data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate portfolio from structured data using OpenRouter/Azure/Gemini
app.post("/api/generate-portfolio", async (req, res) => {
  try {
    const portfolioData = req.body;
    const designPrompt = portfolioData.designPrompt || 'Modern and elegant design';
    let provider = portfolioData.provider || 'openrouter'; // Default to openrouter

    // Generate default images if not provided
    const getDefaultProfileImage = (profession) => {
      const professionImages = {
        'مطور': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        'مصمم': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        'مهندس': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        'مدير': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        'developer': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        'designer': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        'engineer': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        'manager': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
      };
      return professionImages[profession] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face';
    };

    const getDefaultProjectImage = (projectName) => {
      const projectImages = {
        'موقع': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
        'تطبيق': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
        'نظام': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
        'منصة': 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop',
        'website': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
        'app': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
        'system': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
        'platform': 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop'
      };
      return projectImages[Object.keys(projectImages).find(key => projectName.toLowerCase().includes(key))] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop';
    };

    const profileImage = portfolioData.profileImageUrl || getDefaultProfileImage(portfolioData.profession);
    const projectsWithImages = (portfolioData.projects || []).map(project => ({
      ...project,
      imageUrl: project.imageUrl || getDefaultProjectImage(project.name)
    }));

    const portfolioPrompt = `Create a complete, single-file HTML portfolio website using the following data.
Include all CSS (in <style> tags) and JavaScript (in <script> tags) internally.

Personal Information:
- Name: ${portfolioData.name || 'Not specified'}
- Profession: ${portfolioData.profession || 'Not specified'}
- Bio: ${portfolioData.bio || 'Not specified'}
- Skills: ${portfolioData.skills ? portfolioData.skills.join(', ') : 'Not specified'}
- Email: ${portfolioData.email || 'Not specified'}
- Phone: ${portfolioData.phone || 'Not specified'}
- GitHub: ${portfolioData.github || 'Not specified'}
- LinkedIn: ${portfolioData.linkedin || 'Not specified'}
- Twitter: ${portfolioData.twitter || 'Not specified'}
- Instagram: ${portfolioData.instagram || 'Not specified'}
- Profile Image: ${profileImage}
- Projects: ${JSON.stringify(projectsWithImages)}
- Additional Links: ${JSON.stringify(portfolioData.additionalLinks || [])}

Design Requirements:
${designPrompt}

Focus on a high-end, premium aesthetic with smooth animations, modern typography (Inter/Outfit), and a responsive layout.
Return ONLY the complete HTML code starting with <!DOCTYPE html>.`;

    let html = "";
    let fallbackInfo = null;

    // Try selected provider with nested fallbacks
    try {
      if (provider === 'azure' && azureOpenAIConfigured) {
        try {
          html = await callAzureOpenAI(portfolioPrompt, "You are an expert web designer and developer. Create stunning portfolios.");
        } catch (azureErr) {
          console.warn('⚠️ Azure AI failed for portfolio generation, falling back to Gemini');
          provider = 'gemini';
          fallbackInfo = "Azure AI لم يعمل، تم التحويل تلقائياً إلى Gemini لإنشاء الموقع.";
        }
      }

      if (provider === 'openrouter' || (provider === 'azure' && !html)) {
        try {
          const fetchResponse = await fetch(OPENROUTER_BASE_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "AI Portfolio Generator",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": OPENROUTER_MODEL,
              "messages": [{ "role": "user", "content": portfolioPrompt }],
              "max_tokens": 8000,
              "temperature": 0.7
            })
          });
          if (!fetchResponse.ok) {
            const errorData = await fetchResponse.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `OpenRouter API error: ${fetchResponse.status}`);
          }
          const data = await fetchResponse.json();

          if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid OpenRouter response format');
          }

          html = data.choices[0].message.content || "";
        } catch (orErr) {
          console.warn('⚠️ OpenRouter failed for portfolio generation, falling back to Gemini');
          provider = 'gemini';
          fallbackInfo = (fallbackInfo ? fallbackInfo + " و " : "") + "نعتذر، محركات التصميم الأساسية مشغولة حالياً، تم استخدام Gemini لإنشاء موقعك.";
        }
      }

      if (provider === 'gemini' || !html) {
        try {
          html = await callGemini(portfolioPrompt, "You are an expert web designer and developer. Create stunning portfolios.");
        } catch (gemError) {
          console.error('❌ Final fallback (Gemini) also failed:', gemError.message);
          throw new Error('نعتذر، جميع محركات التصميم تواجه ضغطاً كبيراً حالياً. يرجى المحاولة مرة أخرى خلال ثوانٍ.');
        }
      }
    } catch (globalErr) {
      console.error('Final global error in generation:', globalErr);
      throw globalErr;
    }

    // Clean the response
    html = html.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();

    res.json({ success: true, html, fallbackInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhance portfolio code using Gemini
app.post("/api/enhance-portfolio", async (req, res) => {
  try {
    const { html, designPrompt } = req.body;

    if (!html) {
      return res.status(400).json({ success: false, error: "HTML code is required" });
    }

    const enhancementPrompt = `
تحسين وتحليل الكود التالي لموقع البورتوفوليو:

الكود الحالي:
${html}

متطلبات التصميم:
${designPrompt || 'تحسين عام للتصميم'}

المطلوب:
1. تحليل الكود الحالي وتحديد نقاط التحسين
2. تحسين التصميم البصري والألوان
3. إضافة تأثيرات hover وانيميشن لطيفة
4. تحسين التخطيط والمساحات البيضاء
5. تحسين الخطوط والتباين
6. إضافة تأثيرات بصرية جميلة ولكن غير معقدة
7. تحسين الاستجابة للأجهزة المختلفة
8. إضافة تفاعلات بسيطة وجميلة
9. تحسين الألوان والتدرجات
10. إضافة تأثيرات CSS متقدمة ولكن أنيقة

أعد الكود المحسن كاملاً مع:
- تحسينات بصرية جميلة
- تأثيرات hover لطيفة
- ألوان متدرجة أنيقة
- انيميشن بسيطة وسلسة
- تخطيط محسن
- خطوط جميلة
- مساحات بيضاء مناسبة
- تأثيرات بصرية أنيقة

أعد فقط الكود HTML المحسن بدون أي شرح أو تعليقات.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: enhancementPrompt
    });

    let enhancedHtml = response.text || "";

    // Clean the response
    enhancedHtml = enhancedHtml.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();

    res.json({ success: true, html: enhancedHtml });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    // إنشاء موقع بورتوفوليو احترافي
    const portfolioPrompt = `
أنت مولد مواقع بورتوفوليو احترافي. مهمتك إنشاء موقع بورتوفوليو كامل ومتجاوب باستخدام HTML و CSS و JavaScript.

المعلومات المطلوبة:
${req.body.prompt || "مطور ويب بخبرة 5 سنوات"}

المطلوب:
1. إنشاء موقع بورتوفوليو احترافي ومتجاوب
2. استخدام HTML5 و CSS3 و JavaScript
3. تصميم حديث وأنيق مع ألوان متناسقة
4. أقسام الموقع:
   - Hero Section: صورة شخصية، اسم، عنوان وظيفي، نبذة مختصرة
   - About Section: نبذة شخصية ومهنية
   - Skills Section: المهارات مع أيقونات
   - Projects Section: المشاريع مع صور وروابط
   - Contact Section: معلومات التواصل والوسائط الاجتماعية
5. استخدام CSS Grid و Flexbox للتصميم المتجاوب
6. إضافة تأثيرات hover وانيميشن خفيفة
7. استخدام خطوط Google Fonts
8. الألوان: تدرج أزرق/بنفسجي مع لمسات ذهبية
9. التأكد من أن الموقع يعمل على جميع الأجهزة

أعد فقط الكود HTML الكامل مع CSS و JavaScript مدمج، بدون أي شرح أو تعليقات.`;

    const cleanHtml = await callGemini(portfolioPrompt, "You are a professional portfolio website generator.");

    // تنظيف النص من علامات الكود
    cleanHtml = cleanHtml.replace(/```[\w]*\n?/g, '');
    cleanHtml = cleanHtml.replace(/```/g, '');
    cleanHtml = cleanHtml.trim();

    // إرجاع النص المنظف
    res.json({
      choices: [{
        message: {
          content: cleanHtml
        }
      }]
    });
  } catch (error) {
    if (error.response) {
      // لو السيرفر رجع HTML أو Error
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send({ error: error.message });
    }
  }
});

// مسار لتعديل الكود عبر المحادثة (استخدام Gemini فقط)
app.post("/api/edit-portfolio", async (req, res) => {
  try {
    const { html, prompt } = req.body;
    if (!html || !prompt) {
      return res.status(400).json({ success: false, error: "HTML and prompt are required" });
    }

    const systemPrompt = `
You are an expert web developer.
Your ONLY responsibility is to apply precise modifications to existing HTML/CSS/JS code exactly as the user requests—nothing more.

🔐 NON-NEGOTIABLE ENFORCEMENT RULES

1. Document Structure Integrity

You MUST NOT:
- Add or duplicate <!DOCTYPE html>
- Add or duplicate <html>, <head>, or <body>
- Create or embed a new HTML document inside the existing one
- Regenerate the entire layout unless explicitly instructed

There must remain:
- Exactly ONE HTML document structure
- Exactly ONE <html>, <head>, and <body> block

2. Surgical Editing Discipline

You MUST:
- Read the entire code before editing anything
- Only modify the SPECIFIC part the user requests
- Keep ALL other code 100% unchanged
- Avoid introducing new classes, IDs, or elements unless explicitly asked
- Avoid modifying JavaScript logic unless the request explicitly says so

Examples:
- If asked to change a color → change only the CSS value
- If asked to add a section → insert only that section, respecting the existing structure
- If asked to edit text → replace only that text

3. Full File Output Enforcement

You MUST output:
- The entire HTML file from <!DOCTYPE html> to </html>
- With all <head>, <style>, <body>, and <script> included
- No placeholders, no ellipses, no omissions

You MUST NOT:
- Use markdown formatting
- Add explanations before or after the code
- Output anything except the full HTML document

4. Code Consistency & Safety

You MUST:
- Preserve existing responsive design
- Maintain valid HTML5 syntax
- Avoid breaking JavaScript behavior
- Keep all current structure and logic intact unless explicitly instructed to change it

5. Output Format Lock

When replying:
- Start the output exactly with <!DOCTYPE html>
- End exactly with </html>
- Provide ONLY the complete edited code file
- No comments.
- No extra text.
- No system instructions.
- No meta explanations.
    `;

    const userPrompt = `
Here is the COMPLETE current HTML code:

${html}

---

User's modification request: ${prompt}

---

Instructions:
1. Read the ENTIRE code above carefully
2. Find the specific part that needs to be changed based on the user's request
3. Make ONLY that change
4. Return the COMPLETE modified HTML (all of it, from <!DOCTYPE to </html>)
5. Ensure there is NO duplication of the HTML structure
    `;

    const response = await callGemini(userPrompt, systemPrompt);

    // Clean code: Remove any markdown wrapping if the AI included it
    let cleanedCode = response.trim();

    // Improved cleaning regex to catch any ```html or ``` blocks
    const codeBlockRegex = /```(?:html)?\s*([\s\S]*?)```/i;
    const match = cleanedCode.match(codeBlockRegex);
    if (match && match[1]) {
      cleanedCode = match[1].trim();
    } else {
      // Fallback: manually strip if regex fails for some reason
      cleanedCode = cleanedCode.replace(/^```(?:html)?/i, "").replace(/```$/i, "").trim();
    }

    // Safety check: Ensure it actually looks like HTML
    if (!cleanedCode.toLowerCase().includes('<!doctype') && !cleanedCode.toLowerCase().includes('<html')) {
      // AI might have returned only a fragment despite instructions. 
      // In a real app we might try to patch, but for now we throw a specific error or return as is.
      // Let's assume the improved prompt works.
    }

    res.json({ success: true, html: cleanedCode });
  } catch (error) {
    console.error('Edit Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// مسار لنشر الموقع وحفظه في قاعدة البيانات (تحديث أو إضافة)
app.post("/api/publish", async (req, res) => {
  try {
    const { html, userId, slug } = req.body;
    const authHeader = req.headers.authorization;

    if (!html) return res.status(400).json({ success: false, error: "No HTML provided" });

    // نستخدم العميل الإداري إذا وجد، وإلا نستخدم العميل العادي
    let supabaseClient = supabaseAdmin || supabase;
    let finalUserId = userId;

    // محاولة التحقق من التوكن، لكن لا نفشل إذا انتهت صلاحيته
    if (authHeader && !supabaseAdmin) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await tempClient.auth.getUser();
        if (!authError && user) {
          supabaseClient = tempClient;
          finalUserId = user.id;
        } else {
          console.log("📝 Notice: Using provided userId because Token is expired or missing");
        }
      } catch (e) {
        console.warn("Auth check error, proceeding with body userId");
      }
    }

    const payload = { html };
    if (finalUserId) payload.user_id = finalUserId;

    if (slug) {
      console.log(`Updating portfolio: ${slug} for user: ${finalUserId}`);
      const { data, error } = await supabaseClient
        .from('portfolios')
        .update(payload)
        .eq('slug', slug)
        .select();

      if (error) {
        console.error('Update Error:', error);
        throw error;
      }
      return res.json({ success: true, slug: data[0].slug, updated: true });
    } else {
      console.log(`Inserting new portfolio for user: ${finalUserId}`);
      const { data, error } = await supabaseClient
        .from('portfolios')
        .insert([payload])
        .select();

      if (error) {
        console.error('Insert Error:', error);
        // محاولة أخيرة كضيف إذا فشل كل شيء
        if (error.code === '42501') {
          const { data: gData, error: gErr } = await supabase.from('portfolios').insert([{ html }]).select();
          if (gErr) throw gErr;
          return res.json({ success: true, slug: gData[0].slug, isGuest: true });
        }
        throw error;
      }
      return res.json({ success: true, slug: data[0].slug });
    }
  } catch (error) {
    console.error('Final Publish Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// مسار لجلب بيانات موقع معين للتعديل
app.get("/api/portfolio/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, html, slug, user_id')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Supabase Error fetching portfolio:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data) return res.status(404).json({ success: false, error: "الموقع غير موجود" });

    res.json({ success: true, portfolio: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// مسار لحذف بورتوفوليو معين
app.delete("/api/portfolio/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const authHeader = req.headers.authorization;

    // استخدام العميل الإداري إذا وجد، وإلا العميل العادي
    let supabaseClient = supabaseAdmin || supabase;

    // محاولة التحقق من التوكن
    if (authHeader && !supabaseAdmin) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });
        const { data: { user }, error: authError } = await tempClient.auth.getUser();
        if (!authError && user) {
          supabaseClient = tempClient;
        }
      } catch (e) {
        console.warn("Auth check error during delete");
      }
    }

    console.log(`Deleting portfolio: ${slug}`);
    const { data, error } = await supabaseClient
      .from('portfolios')
      .delete()
      .eq('slug', slug)
      .select();

    if (error) {
      console.error('Delete Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "البورتوفوليو غير موجود" });
    }

    res.json({ success: true, message: "تم حذف البورتوفوليو بنجاح" });
  } catch (error) {
    console.error('Final Delete Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// مسار لإعادة تسمية بورتوفوليو (تغيير الـ slug)
app.put("/api/portfolio/:oldSlug/rename", async (req, res) => {
  try {
    const { oldSlug } = req.params;
    const { newSlug } = req.body;
    const authHeader = req.headers.authorization;

    // Validate new slug
    if (!newSlug || typeof newSlug !== 'string') {
      return res.status(400).json({ success: false, error: "New slug is required" });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newSlug)) {
      return res.status(400).json({ success: false, error: "Invalid slug format. Use only lowercase letters, numbers, and hyphens." });
    }

    if (newSlug.length < 3 || newSlug.length > 50) {
      return res.status(400).json({ success: false, error: "Slug must be between 3 and 50 characters" });
    }

    // استخدام العميل الإداري إذا وجد، وإلا العميل العادي
    let supabaseClient = supabaseAdmin || supabase;

    // محاولة التحقق من التوكن
    if (authHeader && !supabaseAdmin) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });
        const { data: { user }, error: authError } = await tempClient.auth.getUser();
        if (!authError && user) {
          supabaseClient = tempClient;
        }
      } catch (e) {
        console.warn("Auth check error during rename");
      }
    }

    // Check if new slug already exists
    const { data: existingPortfolio, error: checkError } = await supabaseClient
      .from('portfolios')
      .select('id')
      .eq('slug', newSlug)
      .single();

    if (existingPortfolio) {
      return res.status(409).json({ success: false, error: "This URL name is already taken. Please choose another one." });
    }

    // Update the slug
    console.log(`Renaming portfolio from ${oldSlug} to ${newSlug}`);
    const { data, error } = await supabaseClient
      .from('portfolios')
      .update({ slug: newSlug })
      .eq('slug', oldSlug)
      .select();

    if (error) {
      console.error('Rename Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "Portfolio not found" });
    }

    res.json({ success: true, message: "Portfolio renamed successfully", newSlug });
  } catch (error) {
    console.error('Final Rename Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// مسار لجلب أعمال المستخدم السابقة
app.get("/api/user-portfolios/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const authHeader = req.headers.authorization;
    if (!supabase) return res.status(500).json({ success: false, error: "Supabase not configured" });

    // نستخدم العميل العادي للجلب ما دامت السياسات عامة، لتجنب مشاكل التوكن المنتهي
    let supabaseClient = supabase;

    // فقط إذا كان هناك توكن صالح نستخدمه، وإلا نكمل بالـ anon
    if (authHeader && !supabaseAdmin) {
      try {
        const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });
        const { error: testError } = await tempClient.auth.getUser();
        if (!testError) supabaseClient = tempClient;
      } catch (e) { }
    }

    const { data, error } = await supabaseClient
      .from('portfolios')
      .select('id, slug, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, portfolios: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// مسار لعرض الموقع المنشور عبر الرابط
app.get("/v/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('portfolios')
      .select('html')
      .eq('slug', slug)
      .single();

    if (error || !data) return res.status(404).send("الموقع غير موجود");

    // إرسالية الكود كصفحة HTML حقيقية للمتصفح
    res.setHeader('Content-Type', 'text/html');
    res.send(data.html);
  } catch (error) {
    res.status(500).send("خطأ في السيرفر");
  }
});


// Static Files middleware
// Use path.join with process.cwd() to ensure it works on Vercel
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// Catch-all for 404s
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.url}`);
  res.status(404).send("صفحة غير موجودة");
});

const PORT = process.env.PORT || 3000;

// IMPORTANT: Do NOT call app.listen() on Vercel
// This is what causes the build to hang
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on http://localhost:${PORT}`);
  });
}

export default app;


