# Portopia - AI Portfolio Generator

## 🚀 Overview
Portopia is an intelligent portfolio generator powered by AI. Create stunning, professional portfolios in minutes using advanced AI technology.

## ✨ Features
- 🤖 AI-powered portfolio generation using Gemini
- 🎨 Multiple design templates
- 📱 Responsive design (Mobile, Tablet, Desktop preview)
- ✏️ Live code editor with syntax highlighting
- 🔄 Real-time preview
- 👤 User authentication with Supabase
- 📊 Dashboard to manage portfolios
- 🔗 Custom URL slugs
- 🗑️ Portfolio management (Edit, Rename, Delete)

## 🛠️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Hosting**: Vercel-ready

## 📋 Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Gemini API key

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/portopia.git
cd portopia
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. **Set up Supabase**
- Create a new Supabase project
- Run the SQL from `supabase_delete_policy.sql`
- Configure RLS policies

5. **Start the development server**
```bash
npm start
```

Visit `http://localhost:3000`

## 📁 Project Structure
```
portopia/
├── public/              # Frontend files
│   ├── index.html       # Landing page
│   ├── editor.html      # Portfolio editor
│   ├── dashboard.html   # User dashboard
│   ├── data-collection.html
│   └── design-selection.html
├── server.js            # Express server
├── vercel.json          # Vercel configuration
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## 🚀 Deployment

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel Dashboard
4. Deploy: `vercel --prod`

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔐 Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Optional |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key | Optional |
| `NODE_ENV` | Environment (development/production) | No |

## 📖 Usage

1. **Create Account**: Sign up with email
2. **Enter Data**: Fill in your information or use AI extraction
3. **Choose Design**: Select a template or describe your style
4. **Edit**: Use the live editor to customize
5. **Publish**: Get your unique portfolio URL
6. **Manage**: View, edit, rename, or delete from dashboard

## 🎨 Features in Detail

### AI-Powered Editor
- Real-time code streaming
- Syntax highlighting
- Line numbers
- Live preview

### Device Preview
- Mobile (375px)
- Tablet (768px)
- Desktop (100%)

### Portfolio Management
- View all portfolios
- Edit existing portfolios
- Rename URL slugs
- Copy shareable links
- Delete portfolios

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

## 🆘 Support
For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments
- Google Gemini for AI capabilities
- Supabase for backend infrastructure
- Vercel for hosting platform

---

Made with ❤️ by Ehab Hussein
