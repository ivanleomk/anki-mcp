# Jishik

A Model Context Protocol (MCP) server for Anki that enables AI assistants to create, search, and manage flashcards with rich media support. Jishik bridges the gap between AI workflows and spaced repetition learning, making it easy to generate educational content from any source.

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

Jishik provides powerful tools for creating and managing Anki flashcards through AI assistants. Here are the available tools:

### `list_anki_decks`
Lists all available Anki deck names.

**Example:**
```
AI: What Anki decks are available?
You: [Uses list_anki_decks tool]

Available Anki decks:
• Default
• Japanese
• Spanish  
• Programming
• Medical Terminology
```

### `addCard`
Creates individual flashcards with rich media support.

**Basic Example:**
```javascript
{
  "front": "What is the capital of France?",
  "back": "Paris",
  "deckName": "Geography",
  "tags": ["europe", "capitals"]
}
```

### `addBulkCards` 
Creates multiple flashcards in one operation for efficient batch processing.

**Example:**
```javascript
{
  "cards": [
    {
      "front": "JavaScript variable declaration keyword",
      "back": "let, const, var",
      "tags": ["javascript", "variables"]
    },
    {
      "front": "React hook for state management", 
      "back": "useState",
      "tags": ["react", "hooks"]
    }
  ],
  "deckName": "Programming"
}
```

### `searchCards`
Find existing flashcards by content matching.

**Example:**
```javascript
{
  "query": "React",
  "deckName": "Programming"  // Optional: search specific deck
}
```

### `getCardsInDeck`
Retrieve cards from a specific deck with pagination.

**Example:**
```javascript
{
  "deckName": "Spanish",
  "limit": 20,
  "offset": 0
}
```

## Integration Examples

### ElevenLabs Audio Generation

Jishik seamlessly integrates with ElevenLabs for pronunciation cards:

```javascript
// 1. Generate audio with ElevenLabs
const audioResponse = await elevenLabs.textToSpeech({
  text: "Bonjour, comment allez-vous?",
  voice: "French-native",
  outputPath: "/tmp/french-greeting.mp3"
});

// 2. Create Anki card with audio
{
  "front": "How do you say 'Hello, how are you?' in French?",
  "back": "Bonjour, comment allez-vous? {french-greeting.mp3}",
  "deckName": "French Pronunciation",
  "media": ["/tmp/french-greeting.mp3"],
  "tags": ["french", "greetings", "pronunciation"]
}
```

The `{french-greeting.mp3}` syntax automatically embeds the audio file in your flashcard.

### File System Integration

Transform any content into flashcards by reading from files:

```javascript
// Read content from a file
const content = await fs.readFile("./study-notes.md", "utf8");

// Extract key concepts and create cards
const concepts = parseMarkdownHeaders(content);

// Bulk create flashcards
{
  "cards": concepts.map(concept => ({
    "front": `What is ${concept.term}?`,
    "back": concept.definition,
    "tags": ["study-notes", concept.category]
  })),
  "deckName": "Study Notes"
}
```

### Web Scraping + Flashcard Generation

```javascript
// Scrape content from a webpage
const webContent = await scrapeWebsite("https://example.com/tutorial");

// Generate image flashcards with screenshots
{
  "front": "What does this UI component look like?",
  "back": "Button with rounded corners and blue background {ui-component.png}",
  "deckName": "UI Patterns",
  "media": ["/screenshots/ui-component.png"],
  "tags": ["ui", "components", "design"]
}
```

### PDF Document Processing

```javascript
// Extract content from PDF
const pdfText = await extractPDFContent("research-paper.pdf");
const definitions = extractDefinitions(pdfText);

// Create cards with references
{
  "cards": definitions.map(def => ({
    "front": def.term,
    "back": `${def.definition}\n\nSource: Research Paper, Page ${def.page}`,
    "tags": ["research", "definitions", def.category]
  })),
  "deckName": "Research Terms"
}
```

## Media File Support

Jishik supports various media file types:

- **Audio**: `.mp3`, `.wav`, `.m4a`, `.aac`, `.flac`, `.opus`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

Media files are automatically:
1. Stored in Anki's media collection
2. Referenced in card content using `{filename}` syntax
3. Converted to appropriate Anki tags (`[sound:file.mp3]` for audio, `<img src="file.jpg">` for images)

## Environment Configuration

### Default Configuration
Jishik uses these AnkiConnect defaults:
- **Host**: `http://127.0.0.1`
- **Port**: `8765`
- **API Version**: `6`
- **Security Key**: Not required by default

### Custom Configuration
If you need to customize the connection, modify the YankiConnect client initialization in [`lib/handlers.ts`](lib/handlers.ts).

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

### Media File Issues
- Ensure media files exist and are readable before adding cards
- Large media files may take time to upload
- Supported formats: audio (mp3, wav, m4a), images (jpg, png, gif)

## Development

This project was created using `bun init` in bun v1.1.37. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Repository

- **GitHub**: https://github.com/ivanleomk/jishik
- **Issues**: https://github.com/ivanleomk/jishik/issues
- **Version**: 1.0.3
