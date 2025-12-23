# Contributing to AdaTools

First off, thank you for considering contributing to AdaTools! It's people like you that make AdaTools such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct (see below).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, browser, Node.js version)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear use case**: Why is this feature useful?
- **Detailed description**: How should it work?
- **Examples**: Mock-ups or similar features in other tools

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Write clear commit messages**
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Create the PR** with a clear description

## Development Setup

See the [README.md](README.md#installation) for detailed setup instructions, including:
- Database setup options (Docker, local, or cloud)
- OAuth configuration (GitHub, Google)
- API keys setup (optional, for specific modules)

**Quick start for most development** (no database needed):
```bash
git clone https://github.com/SLcode777/AdaTools.git
cd AdaTools
pnpm install
pnpm dev
```

**Full setup** (for database-dependent features):
```bash
# 1. Set up database (see README for options)
# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your database URL and credentials

# 3. Initialize database
pnpm prisma db push

# 4. Run dev server
pnpm dev
```

**Note**: Most modules work without any setup. You only need the full environment for authentication and testing user's workspace features.

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Prefer `interface` over `type` for object shapes
- Use proper typing, avoid `any`

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use "use client" directive only when needed (client-side features)
- Export component interfaces

Example:
```tsx
"use client";

import { useState } from "react";
import { Module } from "../dashboard/module";

interface MyModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export function MyModule({ isPinned, onTogglePin }: MyModuleProps) {
  // Component logic
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color theme system
- Use CSS variables for theme-dependent colors
- Responsive design is mandatory (mobile-first)

### File Organization

- Components: `components/`
- Server logic: `src/server/`
- Utilities: `src/lib/`
- Types: Co-locate with the code or in `*.d.ts` files

## Adding a New Tool Module

1. **Create the component** in `components/modules/your-tool.tsx`
2. **Register it** in `src/contexts/modules-context.tsx`:
   ```tsx
   export const ALL_MODULES: ModuleConfig[] = [
     // ... existing modules
     {
       id: "your-tool",
       name: "Your Tool",
       description: "Tool description",
       icon: "YourIcon",
       component: YourToolModule,
       category: "utilities",
     },
   ];
   ```
3. **Add server logic** (if needed) in `src/server/api/routers/your-tool.ts`
4. **Export the router** in `src/server/api/root.ts`
5. **Test thoroughly** in both light and dark modes, all color themes

## Testing

Currently, the project doesn't have automated tests (contributions welcome!), but please manually test:

- ✅ Your feature works as expected
- ✅ No console errors
- ✅ Works in light and dark mode
- ✅ Works with all 9 color themes
- ✅ Responsive on mobile, tablet, and desktop
- ✅ No TypeScript errors (`pnpm build`)

## Commit Message Guidelines

Follow conventional commits:

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

examples : 
```
feat: add UUID v7 generator
fix: correct WebP quality slider behavior
docs: update README installation steps
style: format code with prettier
refactor: simplify base64 encoding logic
test: add tests for UUID module
chore: update dependencies
```

## Questions?

Feel free to reach out at sl.code.777@gmail.com or open a discussion on GitHub.

---

Thank you for contributing! 🎉
