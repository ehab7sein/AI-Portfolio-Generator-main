# 🔐 Authentication & AI Integration Setup Guide

This guide will help you set up authentication with Supabase and integrate multiple AI providers (Azure OpenAI, OpenRouter, and Google Gemini).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Azure OpenAI Setup](#azure-openai-setup)
4. [OpenRouter Setup](#openrouter-setup)
5. [Environment Configuration](#environment-configuration)
6. [Testing Authentication](#testing-authentication)
7. [API Endpoints](#api-endpoints)

## 🎯 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free tier available)
- Azure account (for Azure OpenAI) - Optional
- OpenRouter account - Optional
- Google AI Studio account (for Gemini)

## 🗄️ Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub or create an account
4. Click "New Project"
5. Fill in the project details:
   - **Name**: AI Portfolio Generator
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
6. Click "Create new project"

### Step 2: Get Your API Credentials

1. Once your project is created, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (this is safe to use in client-side code)

### Step 3: Enable Email Authentication

1. Go to **Authentication** > **Providers**
2. Find **Email** provider
3. Make sure it's **enabled**
4. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize confirmation and password reset emails

### Step 4: Configure Email Settings (Optional)

For production, you should configure custom SMTP:

1. Go to **Settings** > **Auth**
2. Scroll to **SMTP Settings**
3. Enable custom SMTP and add your email provider details

## ☁️ Azure OpenAI Setup

### Step 1: Create Azure Account

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign up for an Azure account (free trial available)

### Step 2: Create Azure OpenAI Resource

1. In Azure Portal, click **Create a resource**
2. Search for **Azure OpenAI**
3. Click **Create**
4. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: Create new or use existing
   - **Region**: Choose available region
   - **Name**: Your resource name
   - **Pricing tier**: Standard S0
5. Click **Review + create** then **Create**

### Step 3: Deploy a Model

1. Go to your Azure OpenAI resource
2. Click **Go to Azure OpenAI Studio**
3. Navigate to **Deployments**
4. Click **Create new deployment**
5. Select a model (e.g., **gpt-4** or **gpt-35-turbo**)
6. Give it a deployment name (e.g., `gpt-4`)
7. Click **Create**

### Step 4: Get Your Credentials

1. Go back to Azure Portal
2. Navigate to your Azure OpenAI resource
3. Click **Keys and Endpoint**
4. Copy:
   - **Endpoint** (e.g., `https://your-resource.openai.azure.com/`)
   - **Key 1** or **Key 2**

## 🌐 OpenRouter Setup

### Step 1: Create Account

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up with your email or GitHub

### Step 2: Generate API Key

1. Go to **Keys** section
2. Click **Create Key**
3. Give it a name (e.g., "Portfolio Generator")
4. Copy the generated key

### Step 3: Add Credits

1. Go to **Credits** section
2. Add credits to your account (starting from $5)
3. OpenRouter provides access to multiple AI models

## ⚙️ Environment Configuration

### Step 1: Create .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

### Step 2: Fill in Your Credentials

Open `.env` and add your credentials:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key

# OpenRouter API Key
OPENROUTER_API_KEY=your_actual_openrouter_api_key

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your_actual_azure_api_key
AZURE_OPENAI_DEPLOYMENT=gpt-4

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# Server Configuration
PORT=3000
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
✅ Supabase initialized successfully
✅ Azure OpenAI initialized successfully
🚀 Server running on http://localhost:3000
```

## 🧪 Testing Authentication

### Test Signup

1. Navigate to `http://localhost:3000/signup.html`
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
   - Confirm Password: TestPassword123!
3. Check "I agree to the Terms"
4. Click "Create Account"
5. Check your email for verification (if email is configured)

### Test Login

1. Navigate to `http://localhost:3000/login.html`
2. Enter your credentials:
   - Email: test@example.com
   - Password: TestPassword123!
3. Click "Login"
4. You should be redirected to the main app

### Verify in Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Authentication** > **Users**
3. You should see your newly created user

## 📡 API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "user": { ... },
  "session": { ... }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful!",
  "user": { ... },
  "session": { ... }
}
```

#### POST `/api/auth/logout`
Logout the current user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/user`
Get current user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### AI Endpoints

#### POST `/api/ai/chat`
Chat with AI using Azure OpenAI, OpenRouter, or Gemini.

**Request:**
```json
{
  "message": "Hello, how can you help me?",
  "provider": "azure"  // or "openrouter" or "gemini"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I can help you create an amazing portfolio...",
  "provider": "azure"
}
```

#### POST `/api/extract-data`
Extract portfolio data from text using Gemini.

**Request:**
```json
{
  "prompt": "My name is John Doe, I'm a web developer..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "profession": "Web Developer",
    ...
  }
}
```

#### POST `/api/generate-portfolio`
Generate portfolio HTML using OpenRouter.

**Request:**
```json
{
  "name": "John Doe",
  "profession": "Web Developer",
  "skills": ["JavaScript", "React", "Node.js"],
  ...
}
```

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>..."
}
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - Minimum 8 characters with mixed case, numbers, and symbols
3. **Enable email verification** - Configure in Supabase Auth settings
4. **Use HTTPS in production** - Never use HTTP for authentication
5. **Rotate API keys regularly** - Especially if they're exposed
6. **Set up Row Level Security (RLS)** - In Supabase for database tables

## 🐛 Troubleshooting

### "Supabase is not configured" Error
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`
- Restart the server after updating `.env`

### "Azure OpenAI credentials not found" Warning
- This is optional - the app will fall back to OpenRouter or Gemini
- If you want to use Azure OpenAI, add the credentials to `.env`

### Email not sending
- For development, check Supabase logs in the dashboard
- For production, configure custom SMTP in Supabase settings

### CORS errors
- Make sure CORS is enabled in `server.js` (already configured)
- Check that you're accessing from the correct origin

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

## 🎉 Next Steps

1. Customize the login/signup pages to match your brand
2. Add password reset functionality
3. Implement social authentication (Google, GitHub, etc.)
4. Create protected routes that require authentication
5. Add user profile management
6. Implement role-based access control

---

**Need help?** Check the documentation or create an issue on GitHub.
