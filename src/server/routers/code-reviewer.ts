import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { decrypt, encrypt } from "../utils/encryption";

// Type definition for file tree nodes
interface FileNode {
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
}

// Type for GitHub API tree response
interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

// Type for GitHub API file content response
interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

// Helper function to parse GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } {
  // Handle both https://github.com/owner/repo and git@github.com:owner/repo formats
  const httpsMatch = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
  const sshMatch = url.match(/github\.com:([^\/]+)\/([^\/\.]+)/);

  const match = httpsMatch || sshMatch;

  if (!match) {
    throw new Error("Invalid GitHub URL format");
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

// Helper function to build hierarchical tree structure
function buildTree(files: Array<{ path: string; type: string }>): FileNode[] {
  const root: { [key: string]: FileNode } = {};

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const fullPath = parts.slice(0, index + 1).join("/");

      if (!current[part]) {
        current[part] = {
          path: fullPath,
          type: isLast && file.type === "blob" ? "file" : "dir",
          children: isLast && file.type === "blob" ? undefined : [],
        };
      }

      if (!isLast && current[part].children) {
        const childrenMap: { [key: string]: FileNode } = {};
        current[part].children!.forEach((child) => {
          childrenMap[child.path.split("/").pop()!] = child;
        });
        current = childrenMap;
      }
    });
  });

  return Object.values(root);
}

// Helper function to build system prompt based on analysis type
function buildSystemPrompt(
  analysisType: "issues" | "improvements" | "full",
): string {
  const basePrompt = `You are an expert code reviewer. Analyze the provided code files and provide a detailed, structured review.`;

  if (analysisType === "issues") {
    return `${basePrompt}

Focus your analysis on:
- Bugs and potential runtime errors
- Security vulnerabilities (SQL injection, XSS, authentication issues, etc.)
- Code smells and anti-patterns
- Violations of best practices
- Performance bottlenecks
- Memory leaks or resource management issues
- Error handling gaps
- Type safety issues

Provide specific line references where possible and suggest concrete fixes.`;
  }

  if (analysisType === "improvements") {
    return `${basePrompt}

Focus your analysis on:
- Feature enhancement suggestions
- Architecture improvements
- Code organization and modularity
- Design pattern opportunities
- Performance optimization opportunities
- Developer experience improvements
- Testing strategy improvements
- Documentation suggestions

Provide actionable recommendations with examples where helpful.`;
  }

  // Full analysis
  return `${basePrompt}

Provide a comprehensive code review covering:

**Issues & Problems:**
- Bugs and potential runtime errors
- Security vulnerabilities
- Code smells and anti-patterns
- Best practice violations
- Error handling gaps

**Improvements & Enhancements:**
- Architecture suggestions
- Feature enhancement ideas
- Performance optimizations
- Code organization improvements
- Testing and documentation recommendations

Provide specific line references and actionable recommendations.`;
}

export const codeReviewerRouter = createTRPCRouter({
  // Get user's API key
  getApiKey: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { anthropicApiKey: true },
    });

    let decryptedApiKey = null;
    if (user?.anthropicApiKey) {
      try {
        decryptedApiKey = decrypt(user.anthropicApiKey);
      } catch (error) {
        console.error("Error decrypting API key:", error);
      }
    }

    return {
      hasApiKey: !!user?.anthropicApiKey,
      apiKey: decryptedApiKey,
    };
  }),

  // Save user's API key
  saveApiKey: protectedProcedure
    .input(z.object({ apiKey: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Encrypt the API key before saving
      const encryptedApiKey = encrypt(input.apiKey);

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { anthropicApiKey: encryptedApiKey },
      });

      return { success: true };
    }),

  // Fetch GitHub repository tree
  fetchGitHubRepo: protectedProcedure
    .input(
      z.object({
        repoUrl: z.string().url(),
        branch: z.string().optional().default("main"),
      }),
    )
    .mutation(async ({ input }) => {
      // Parse GitHub URL
      const { owner, repo } = parseGitHubUrl(input.repoUrl);

      // Fetch repository tree from GitHub API
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${input.branch}?recursive=1`;

      const response = await fetch(treeUrl, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add GitHub token if available in environment
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("GitHub API error:", errorText);
        throw new Error(
          `Failed to fetch repository: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as GitHubTreeResponse;

      // Build hierarchical tree structure
      const tree = buildTree(
        data.tree.map((item) => ({
          path: item.path,
          type: item.type,
        })),
      );

      return {
        tree,
        owner,
        repo,
      };
    }),

  // Fetch file content from GitHub
  fetchFileContent: protectedProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        path: z.string(),
        branch: z.string().optional().default("main"),
      }),
    )
    .query(async ({ input }) => {
      const contentUrl = `https://api.github.com/repos/${input.owner}/${input.repo}/contents/${input.path}?ref=${input.branch}`;

      const response = await fetch(contentUrl, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("GitHub API error:", errorText);
        throw new Error(
          `Failed to fetch file content: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as GitHubFileContent;

      // Decode base64 content
      const content = Buffer.from(data.content, "base64").toString("utf-8");

      return {
        content,
        path: input.path,
      };
    }),

  // Analyze code using Claude API
  analyzeCode: protectedProcedure
    .input(
      z.object({
        files: z.array(
          z.object({
            path: z.string(),
            content: z.string(),
          }),
        ),
        analysisType: z.enum(["issues", "improvements", "full"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's encrypted API key from database
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { anthropicApiKey: true },
      });

      const encryptedApiKey = user?.anthropicApiKey;

      if (!encryptedApiKey) {
        throw new Error("Please configure your Anthropic API key first");
      }

      // Decrypt the API key
      let apiKey: string;
      try {
        apiKey = decrypt(encryptedApiKey);
      } catch (error) {
        console.error("Error decrypting API key:", error);
        throw new Error(
          "Failed to decrypt API key. Please re-configure your API key.",
        );
      }

      // Create Anthropic client
      const anthropic = new Anthropic({
        apiKey,
      });

      // Build system prompt
      const systemPrompt = buildSystemPrompt(input.analysisType);

      // Build user message with file contents
      const fileContents = input.files
        .map((file) => {
          return `### File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``;
        })
        .join("\n\n");

      const userMessage = `Please analyze the following code files:\n\n${fileContents}`;

      try {
        // Call Claude API
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
          system: systemPrompt,
        });

        // Extract text content from response
        const report = message.content
          .filter(
            (block): block is Anthropic.TextBlock => block.type === "text",
          )
          .map((block) => block.text)
          .join("\n");

        return {
          report,
          usage: {
            inputTokens: message.usage.input_tokens,
            outputTokens: message.usage.output_tokens,
          },
        };
      } catch (error) {
        console.error("Anthropic API error:", error);
        throw new Error(
          "Failed to analyze code. Please check your API key and try again.",
        );
      }
    }),
});
