# AI Portfolio Generator Setup

This system uses a two-step AI approach:
1. **Data Extraction**: Google Gemini API extracts structured data from text input
2. **Portfolio Generation**: OpenRouter's NVIDIA Nemotron-Nano-9B-V2 model generates the complete website

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys

#### Create .env file
1. Copy the example file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your actual API keys:
   ```bash
   # API Keys Configuration
   # Get your Gemini API key from: https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your-gemini-api-key-here

   # Get your OpenRouter API key from: https://openrouter.ai/keys
   OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here
   ```

#### Get Your API Keys

**Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

**OpenRouter API Key:**
1. Go to [OpenRouter.ai](https://openrouter.ai/keys)
2. Create an account and get your API key (starts with `sk-or-v1-`)
3. Copy the key to your `.env` file

### 3. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

## How It Works

### Step 1: Data Extraction (Gemini)
- User provides text input about themselves
- Gemini API extracts structured data including:
  - name, profession, bio
  - skills, projects, social links
  - contact information

### Step 2: Portfolio Generation (OpenRouter)
- Uses the extracted data to generate a complete HTML/CSS/JS portfolio
- Applies the specified design requirements
- Creates responsive, modern websites with:
  - Hero, About, Skills, Projects, Contact sections
  - Smooth animations and hover effects
  - Google Fonts typography
  - Blue/turquoise gradient accent (#00ffff)

## API Endpoints

- `POST /api/extract-data` - Extract structured data using Gemini
- `POST /api/generate-portfolio` - Generate portfolio using OpenRouter
- `POST /api/generate` - Legacy endpoint (uses Gemini for both steps)

## Features

- **Dual AI System**: Gemini for data extraction, OpenRouter for code generation
- **Automatic Image Generation**: Default images based on profession and project type
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, minimalistic design with smooth animations
- **Easy Setup**: Just add your OpenRouter API key and you're ready to go

## Troubleshooting

### OpenRouter API Issues
- Make sure your API key is valid and has credits
- Check that you're using the correct model: `nvidia/nemotron-nano-9b-v2:free`

### Gemini API Issues
- Verify the API key is correct
- Check your API quota and billing

### General Issues
- Ensure all dependencies are installed: `npm install`
- Check the server logs for detailed error messages
- Make sure both API keys are properly configured

