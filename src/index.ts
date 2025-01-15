#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { VALIDATION_FRAMEWORKS, validateWithFramework, getValidationSuggestions } from "./validation.js";

const server = new Server(
  {
    name: "anti-bullshit-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {
        analyze_claim: true,
        validate_sources: true,
        check_manipulation: true
      },
    },
  }
);

// Load validation framework configuration from environment
const VALIDATION_FRAMEWORK = (process.env.VALIDATION_FRAMEWORK || "pluralistic") as keyof typeof VALIDATION_FRAMEWORKS;

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_claim",
        description: "Analyze a claim using multiple epistemological frameworks and suggest validation steps",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Claim to analyze",
            },
            framework: {
              type: "string",
              description: "Validation framework to use (empirical, responsible, harmonic, or pluralistic)",
              enum: ["empirical", "responsible", "harmonic", "pluralistic"],
            }
          },
          required: ["text"],
        },
      },
      {
        name: "validate_sources",
        description: "Validate sources and evidence using configured framework",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Text containing claims and sources to validate",
            },
            framework: {
              type: "string",
              description: "Validation framework to use",
              enum: ["empirical", "responsible", "harmonic", "pluralistic"],
            }
          },
          required: ["text"],
        },
      },
      {
        name: "check_manipulation",
        description: "Check for manipulation tactics across different cultural contexts",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Text to analyze for manipulation",
            }
          },
          required: ["text"],
        },
      }
    ],
  };
});

// Handle tool execution
interface ToolArguments {
  text: string;
  framework?: string;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;
  const args = rawArgs as unknown as ToolArguments;

  if (!args || typeof args.text !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Text parameter is required and must be a string");
  }

  try {
    if (name === "analyze_claim") {
      const framework: keyof typeof VALIDATION_FRAMEWORKS = 
        (typeof args.framework === 'string' && args.framework in VALIDATION_FRAMEWORKS) 
          ? args.framework as keyof typeof VALIDATION_FRAMEWORKS 
          : VALIDATION_FRAMEWORK;
      const validation = validateWithFramework(args.text, framework, {
        hasEmpirical: /evidence|study|research|data/i.test(args.text),
        servesWellbeing: /benefit|improve|help|support/i.test(args.text),
        maintainsHarmony: /balance|harmony|integrate/i.test(args.text)
      });

      const suggestions = getValidationSuggestions(args.text, framework);
      
      // Generate cross-referencing prompts
      const crossRefPrompts = [
        `- Use Exa MCP server to search for general information: "${args.text}"`,
        `- Use Brave Search for independent web sources: "${args.text}"`,
        `- Search ArXiv for preprints and technical papers: "${args.text}"`,
        `- Use Google Scholar MCP server to find peer-reviewed research: "${args.text}"`,
        `- Cross-reference findings between academic and general sources to identify consensus or conflicts`
      ];

      // Framework-specific cross-references
      if (framework === "empirical" || framework === "pluralistic") {
        crossRefPrompts.push(
          `- Compare methodologies between ArXiv papers and peer-reviewed research`,
          `- Analyze replication status across different studies`,
          `- Cross-validate findings between academic databases`
        );
      }

      if (framework === "responsible" || framework === "pluralistic") {
        crossRefPrompts.push(
          `- Use Exa MCP server to search for community impact studies: "${args.text}"`,
          `- Cross-reference academic findings with community experiences`,
          `- Compare traditional knowledge with modern research findings`
        );
      }

      if (framework === "harmonic" || framework === "pluralistic") {
        crossRefPrompts.push(
          `- Use Exa MCP server to search for alternative perspectives: "${args.text}"`,
          `- Compare Eastern and Western research approaches`,
          `- Synthesize findings across different knowledge systems`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `Analysis using ${framework} framework:\n\n` +
                 `Requirements:\n${suggestions.join("\n")}\n\n` +
                 `Confidence level: ${validation.confidence}\n\n` +
                 `Suggested cross-references:\n${crossRefPrompts.join("\n")}`
          },
          {
            type: "text",
            text: JSON.stringify({
              framework,
              validation,
              suggestions,
              crossRefPrompts
            })
          }
        ],
      };
    }

    if (name === "validate_sources") {
      const framework: keyof typeof VALIDATION_FRAMEWORKS = 
        (typeof args.framework === 'string' && args.framework in VALIDATION_FRAMEWORKS) 
          ? args.framework as keyof typeof VALIDATION_FRAMEWORKS 
          : VALIDATION_FRAMEWORK;
      
      // Extract sources
      const sourcePattern = /according to|cited by|reported by|study by|research by|experts|scientists/gi;
      const sources = [];
      let match: RegExpExecArray | null;
      while ((match = sourcePattern.exec(args.text)) !== null) {
        const context = args.text.substring(
          Math.max(0, match.index - 30),
          Math.min(args.text.length, match.index + 70)
        );
        sources.push({
          type: "citation",
          context: context.trim()
        });
      }

      // Generate validation prompts for each source
      const validationPrompts = sources.flatMap((source: { type: string; context: string }) => {
        const basePrompts = [
          `- Use Exa MCP server to verify credibility of: "${source.context}"`,
          `- Use Brave Search to find independent verification: "${source.context}"`,
          `- Search ArXiv for related technical papers: "${source.context}"`,
          `- Use Google Scholar MCP server to check academic citations: "${source.context}"`,
          `- Cross-reference findings between different platforms to establish credibility`
        ];

        if (framework === "empirical" || framework === "pluralistic") {
          basePrompts.push(
            `- Compare methodologies and results across different studies`,
            `- Verify replication status and reproducibility`,
            `- Cross-validate findings between different research groups`
          );
        }

        if (framework === "responsible" || framework === "pluralistic") {
          basePrompts.push(
            `- Use Exa MCP server to search for community perspectives: "${source.context}"`,
            `- Compare academic findings with real-world impacts`,
            `- Cross-reference with local knowledge and experiences`
          );
        }

        if (framework === "harmonic" || framework === "pluralistic") {
          basePrompts.push(
            `- Compare perspectives across different cultural contexts`,
            `- Synthesize findings from multiple knowledge systems`,
            `- Identify areas of consensus and divergence`
          );
        }

        return basePrompts;
      });

      return {
        content: [
          {
            type: "text",
            text: `Source validation using ${framework} framework:\n\n` +
                 `Found ${sources.length} sources to validate.\n\n` +
                 `Validation steps:\n${validationPrompts.join("\n")}`
          },
          {
            type: "text",
            text: JSON.stringify({
              framework,
              sources,
              validationPrompts
            }, null, 2)
          }
        ],
      };
    }

    if (name === "check_manipulation") {
      const patterns = {
        emotional: /fear|urgent|must act|limited time|don't wait|before it's too late/i,
        social: /everyone knows|nobody wants|you don't want to be|don't miss out/i,
        authority: /experts say|scientists claim|studies show|research proves/i,
        scarcity: /limited time|exclusive|rare opportunity|don't miss out/i
      };

      const detectedPatterns = Object.entries(patterns)
        .filter(([_, pattern]) => pattern.test(args.text))
        .map(([type]) => type);

      // Generate validation prompts
      const validationPrompts = [
        `- Use Exa MCP server to search for factual information: "${args.text}"`,
        `- Use Brave Search for independent fact-checking: "${args.text}"`,
        `- Search ArXiv for technical analysis: "${args.text}"`,
        `- Use Google Scholar MCP server to find peer-reviewed research: "${args.text}"`,
        `- Cross-reference findings across different platforms to establish truth`
      ];

      if (detectedPatterns.includes("authority")) {
        validationPrompts.push(
          `- Use Google Scholar MCP server to verify credibility of cited authorities`,
          `- Cross-reference authority claims with independent research`,
          `- Compare expert opinions across different fields`
        );
      }

      if (detectedPatterns.includes("emotional")) {
        validationPrompts.push(
          `- Use Exa MCP server to find balanced, non-emotional discussions`,
          `- Compare emotional appeals with empirical evidence`,
          `- Cross-validate claims across multiple neutral sources`
        );
      }

      if (detectedPatterns.includes("social") || detectedPatterns.includes("scarcity")) {
        validationPrompts.push(
          `- Verify claims using multiple independent sources`,
          `- Cross-reference marketing claims with factual data`,
          `- Compare urgency claims with historical patterns`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `Manipulation check results:\n\n` +
                 `Detected patterns: ${detectedPatterns.join(", ") || "None"}\n\n` +
                 `Suggested validation:\n${validationPrompts.join("\n")}`
          },
          {
            type: "text",
            text: JSON.stringify({
              detectedPatterns,
              validationPrompts
            }, null, 2)
          }
        ],
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  } catch (error: unknown) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error analyzing text: ${(error instanceof Error ? error.message : String(error)) as string}`
    );
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Anti-bullshit MCP server running on stdio");
