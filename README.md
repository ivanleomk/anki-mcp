# anki-mcp

A Model Context Protocol (MCP) server for Anki that enables AI assistants to interact with your Anki flashcard decks.

## Prerequisites

### Anki Desktop Application
- **Anki Desktop** (>=2.1.45, released 2021-07-30) must be installed and running
- Download from: https://apps.ankiweb.net/

### AnkiConnect Add-on
The AnkiConnect add-on is required for API communication with Anki.

1. **Install AnkiConnect Add-on**:
   - Open Anki Desktop
   - Go to Tools → Add-ons → Get Add-ons...
   - Enter code: `2055492159`
   - Click OK and restart Anki

2. **Verify Installation**:
   - Go to Tools → Add-ons
   - You should see "AnkiConnect" in the list
   - The version should be >=25.2.25.0 (released 2025-02-25) for full compatibility

3. **Configure AnkiConnect** (Optional):
   - Go to Tools → Add-ons → AnkiConnect → Config
   - Default settings should work for most users:
     ```json
     {
         "apiKey": null,
         "apiLogPath": null,
         "webBindAddress": "127.0.0.1",
         "webBindPort": 8765,
         "webCorsOriginList": ["http://localhost"]
     }
     ```

## Installation

To install dependencies:

```bash
bun install
```

## Building

To build the project:

```bash
bun run build
```

## Running

### Development
```bash
bun run index.ts
```

### MCP Inspector (for testing)
```bash
bun run inspector
```

### Preview (build + inspect)
```bash
bun run preview
```

## Usage

Once running, the MCP server provides the following tools:

### `list_anki_decks`
Lists all available Anki deck names.

**Example output:**
```
Available Anki decks:
• Default
• Japanese
• Spanish
• Programming
```

## Environment Configuration

### Default Configuration
The yanki-connect client uses these defaults:
- **Host**: `http://127.0.0.1`
- **Port**: `8765`
- **API Version**: `6`
- **Security Key**: Not required by default

### Custom Configuration
If you need to customize the connection (e.g., different port, security key), you can modify the YankiConnect client initialization in [`lib/handlers.ts`](lib/handlers.ts).

## Troubleshooting

### "Error connecting to Anki"
1. **Ensure Anki is running**: The Anki Desktop application must be open
2. **Check AnkiConnect**: Verify the add-on is installed and enabled
3. **Check port**: Default port 8765 should be free
4. **Firewall**: Ensure localhost connections on port 8765 are allowed

### AnkiConnect Version Issues
- This library is tested against AnkiConnect version 25.2.25.0
- Older versions may work but are not guaranteed to support all features
- Update AnkiConnect if you experience compatibility issues

### Permission Issues
Some AnkiConnect actions may require explicit permission. If prompted in Anki, allow the connection.

## Development

This project was created using `bun init` in bun v1.1.37. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
