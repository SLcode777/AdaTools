# AdaTools

<div align="center">
  <h3>A collection of practical tools for developers</h3>
  <p>Fast, secure, and easy to use - just one click away 💫</p>

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

- **WebP Converter**: Convert PNG/JPG images to WebP format with customizable quality
- **Background Remover**: Remove image backgrounds with AI-powered precision
- **Translator**: Translate text with DeepL's powerful AI engine
- **Base64 Encoder/Decoder**: Encode and decode Base64 strings
- **UUID Generator**: Generate UUIDs v4 and v7
- **Lorem Ipsum Generator**: Generate placeholder text with custom word/character count
- And more tools coming soon!

## 🎨 Customization

- **9 Color Themes**: Choose from cyan, lime, amber, blue, emerald, fuschia, indigo, orange, and pink
- **Dark/Light Mode**: Seamless theme switching
- **Pinnable Modules**: Pin your favorite tools for quick access
- **Responsive Design**: Works on all devices

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/)
- **API**: [tRPC](https://trpc.io/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📦 Installation

### Prerequisites

- **Node.js 20+** and **pnpm**
- **PostgreSQL database** (see setup options below)
- **API keys** (optional, only needed for specific features):
  - [DeepL API](https://www.deepl.com/pro-api) for translation module
  - [Remove.bg API](https://www.remove.bg/api) for background remover module

### Database Setup (Optional - Only for Dashboard/Auth Development)

**⚠️ You can skip this section unless you're working on:**

- User authentication features
- Dashboard pinning system
- User preferences

If you need a database, choose one option:

**Option 1: Docker (Recommended - Easiest)**

```bash
docker run --name adatools-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=adatools \
  -p 5432:5432 \
  -d postgres:16

# Your DATABASE_URL will be:
# postgresql://postgres:postgres@localhost:5432/adatools
```

**Option 2: Local PostgreSQL**

```bash
# Install PostgreSQL on your system
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Download from postgresql.org

# Create database
createdb adatools

# Your DATABASE_URL will be:
# postgresql://yourusername@localhost:5432/adatools
```

**Option 3: Free Cloud Database**

- [Neon](https://neon.tech) - Free tier with instant setup
- [Supabase](https://supabase.com) - Free tier
- [Railway](https://railway.app) - Free tier

### OAuth Setup (Optional - Only for Dashboard/Auth Development)

**⚠️ You can skip this section unless you're working on:**

- User authentication features
- Dashboard pinning system
- User preferences

**GitHub OAuth:**

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Application name: `AdaTools Dev`
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy the Client ID and Client Secret to your `.env`

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/SLcode777/AdaTools.git
   cd AdaTools
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database (Optional)
   DATABASE_URL="postgresql://user:password@localhost:5432/adatools"

   # Better Auth (Optional)
   BETTER_AUTH_SECRET="your-secret-key-here"
   BETTER_AUTH_URL="http://localhost:3000"

   # OAuth (Optional)
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # API Keys (Optional)
   DEEPL_API_KEY="your-deepl-api-key"
   REMOVE_BG_API_KEY="your-removebg-api-key"
   ```

4. **Set up the database**

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🔑 What You Need to Develop

| Feature                | Database + Auth | API Keys       | Notes                                            |
| ---------------------- | --------------- | -------------- | ------------------------------------------------ |
| **WebP Converter**     | ❌ No           | ❌ No          | Works standalone                                 |
| **Base64 Encoder**     | ❌ No           | ❌ No          | Works standalone                                 |
| **UUID Generator**     | ❌ No           | ❌ No          | Works standalone                                 |
| **Lorem Ipsum**        | ❌ No           | ❌ No          | Works standalone                                 |
| **Translation Module** | ❌ No           | ✅ DeepL\*     | \*Can use env variable instead of user-saved key |
| **Background Remover** | ❌ No           | ✅ Remove.bg\* | \*Can use env variable instead of user-saved key |
| **User Dashboard**     | ✅ Yes          | ❌ No          | Only needed for testing pinning/preferences      |
| **API Key Management** | ✅ Yes          | ❌ No          | Only needed for testing user API key storage     |

**For most development**, you can work on:

- All modules (UI, features, fixes)
- New modules
- Landing page
- General improvements

**You only need Database + Auth** if you're working on:

- User authentication flow
- Dashboard pinning system
- User preferences storage
- Per-user API key management

## 🏗️ Project Structure

```
AdaTools/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── themes/            # Color theme CSS files
│   └── page.tsx           # Landing page
├── components/
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components (header, footer)
│   ├── modules/           # Tool modules
│   └── ui/                # Reusable UI components (shadcn)
├── src/
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and configurations
│   └── server/            # tRPC server and routers
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

## 🛠️ Development

### Adding a New Tool Module

1. Create a new component in `components/modules/`:

   ```tsx
   // components/modules/your-tool-module.tsx
   "use client";

   import { Module } from "../dashboard/module";

   interface YourToolModuleProps {
     isPinned?: boolean;
     onTogglePin?: () => void;
     isAuthenticated: boolean;
     onAuthRequired: () => void;
   }

   export function YourToolModule({
     isPinned,
     onTogglePin,
     isAuthenticated,
     onAuthRequired,
   }: YourToolModuleProps) {
     return (
       <Module
         title="Your Tool"
         description="Tool description"
         icon={<YourIcon className="h-5 w-5 text-primary" />}
         isPinned={isPinned}
         onTogglePin={onTogglePin}
         isAuthenticated={isAuthenticated}
         onAuthRequired={onAuthRequired}
       >
         {/* Your tool UI here */}
       </Module>
     );
   }
   ```

2. Add it to the modules registry in `src/contexts/modules-context.tsx`

3. If your tool needs server-side processing, create a tRPC router in `src/server/api/routers/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icons
- All the amazing open source libraries that make this project possible
- For the pomodoro sounds, see [Pomodoro-sounds-attribution.md](Pomodoro-sounds-attribution.md) for author credits
- security : Ihan Boo for disclosing a clickjacking vulnerability

## 📧 Contact

For questions or suggestions, reach out at: sl.code.777@gmail.com

## 🗺️ Roadmap

- [ ] More developer tools
- [ ] Drag and Drop the modules to organize them freely on the dashboard
- [ ] Rework the UI for modules exploration
- [ ] Add a searchbar to easily find modules
- [ ] Tool usage analytics

---

<div align="center">
  Made with ❤️ by the AdaTools team
</div>
