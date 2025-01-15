# Anti-Bullshit MCP Server

A Model Context Protocol server for analyzing claims, validating sources, and detecting manipulation using multiple epistemological frameworks.

## Features

The server provides three main tools for detecting and analyzing bullshit:

### 1. analyze_claim
Analyzes claims using multiple epistemological frameworks:

- **Empirical Framework**
  - Focuses on verifiable evidence
  - Evaluates reproducible results
  - Cross-references academic and scientific sources
  - Assesses methodological rigor

- **Responsible Framework**
  - Evaluates ethical implications
  - Assesses community impact
  - Considers traditional knowledge
  - Validates source credibility

- **Harmonic Framework**
  - Assesses coherence with established knowledge
  - Integrates multiple perspectives
  - Considers contextual appropriateness
  - Evaluates systemic implications

- **Pluralistic Framework**
  - Combines all other frameworks
  - Considers multiple ways of knowing
  - Evaluates contextual appropriateness
  - Assesses practical outcomes
  - Checks alignment with community values

### 2. validate_sources
- Extracts and analyzes cited sources
- Validates credibility and authority
- Cross-references across multiple platforms
- Evaluates methodological soundness
- Checks for conflicts of interest

### 3. check_manipulation
Detects manipulation tactics including:
- Emotional manipulation
- Social pressure
- False authority
- Artificial scarcity
- Urgency creation

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

3. Add to Claude Desktop (MacOS):
```json
{
  "mcpServers": {
    "anti-bullshit": {
      "command": "node",
      "args": ["/path/to/anti-bullshit-mcp-server/build/index.js"]
    }
  }
}
```

Path: `~/Library/Application Support/Claude/claude_desktop_config.json`

Or for VSCode extension:
Path: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

## Usage Examples

```typescript
// Analyze a claim
const result = await analyze_claim({
  text: "Studies show that 87% of experts agree with this controversial claim",
  framework: "empirical"
});

// Validate sources
const validation = await validate_sources({
  text: "According to Dr. Smith's groundbreaking research...",
  framework: "responsible"
});

// Check for manipulation
const check = await check_manipulation({
  text: "Act now! This exclusive offer expires in the next 10 minutes!"
});
```

## Development

For development with auto-rebuild:
```bash
npm run watch
```

Debug with MCP Inspector:
```bash
npm run inspector
```

## Testing Timeline

The server uses 2025-01-01 as the reference date for temporal analysis of claims (particularly relevant for Goodman's "grue" paradox and similar philosophical puzzles).

## License

MIT

## Author

Teglon Labs (teglon@vibes.lol)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
