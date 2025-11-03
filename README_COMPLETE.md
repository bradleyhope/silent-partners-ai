# Silent Partners - Complete AI-Enhanced Version

## What's New

This version includes three major improvements:

1. **✅ Fixed PNG Export** - Now creates proper high-quality PNG images
2. **✅ Improved Themes** - Colors only, preserves Lombardi typography
3. **✅ AI Network Extraction** - Extract entities and relationships from text using AI
4. **✅ API for Programmatic Access** - External AI processes can push network data

---

## Quick Start

### Option 1: Use the Web Interface

1. Open `index.html` in a web browser
2. Click the 🤖 button (bottom right) to open AI extraction
3. Configure your OpenAI API key
4. Paste text and click "Extract Network"
5. Review results and add to visualization

### Option 2: Use the API (for AI processes)

1. Start the API server:
   ```bash
   python3 api_server.py
   ```

2. Send network data programmatically:
   ```python
   import requests
   
   data = {
       "network_id": "my-investigation",
       "entities": [
           {"name": "John Doe", "type": "person", "importance": 5}
       ],
       "relationships": [
           {"source": "John Doe", "target": "Acme Corp", "type": "employment"}
       ]
   }
   
   requests.post("http://localhost:5000/api/network", json=data)
   ```

3. See `API_DOCUMENTATION.md` for full API reference

---

## Features

### 1. AI Network Extraction (Modal UI)

**What it does:**
- Extracts entities (people, organizations, locations, events) from text
- Identifies relationships (financial, employment, personal, legal, etc.)
- Provides review interface before adding to network

**How to use:**
1. Click the 🤖 button (floating button, bottom right)
2. Enter your OpenAI API key (stored locally)
3. Paste article, court document, or report
4. Select AI model (GPT-4.1 Mini recommended)
5. Click "Extract Network"
6. Review extracted entities and relationships
7. Select what to add and click "Add to Network"

**Supported Models:**
- GPT-4.1 Mini (Fast, Cheap) - **Recommended**
- GPT-4.1 Nano (Fastest)
- Gemini 2.5 Flash (Fast)

**Cost:** ~$0.0006 per extraction (very cheap)

### 2. API for External AI Processes

**What it does:**
- Provides REST API for programmatic network construction
- Allows external AI agents to push extracted data
- Supports incremental network building
- Exports in Silent Partners format

**Use cases:**
- Batch document processing
- Real-time network building from streams
- Integration with custom AI pipelines
- Automated investigation workflows

**Endpoints:**
- `POST /api/network` - Add entities and relationships
- `GET /api/network/{id}` - Retrieve network data
- `GET /api/network/{id}/export` - Export for Silent Partners
- `GET /api/networks` - List all networks
- `DELETE /api/network/{id}` - Delete network

See `API_DOCUMENTATION.md` for complete reference.

### 3. Fixed PNG Export

**What was broken:**
- PNG export created 0-byte empty files
- SVG-to-image conversion failed silently

**What's fixed:**
- Proper style inlining for all SVG elements
- Correct background color from current theme
- High-quality 2x resolution output
- Error handling and user feedback

**How to use:**
1. Build your network
2. Scroll to "Export" section
3. Click "📸 Export PNG"
4. PNG file downloads automatically

### 4. Improved Theme System

**What changed:**
- **Removed** font changes (fonts now consistent across all themes)
- **Improved** color palettes for better contrast
- **Preserved** Lombardi aesthetic (serif typography)

**Available themes:**
- **Lombardi Classic** - Original cream/beige palette
- **Dark Mode** - High contrast for low-light environments
- **Clean Minimal** - Pure white, subtle grayscale
- **Corporate** - Professional blue/purple
- **Vibrant** - Material Design colors

**What themes change:**
- Background colors (canvas, sidebar)
- Node colors (entity types)
- Line colors (relationship types)
- Text colors

**What themes DON'T change:**
- Fonts (stays Georgia/Times serif)
- Typography hierarchy
- Layout or spacing

---

## File Structure

```
silent_partners_enhanced/
├── index.html                      # Main application
├── styles.css                      # Core styles
├── lombardi-visualizer.js          # Main visualization engine
├── initial_data.js                 # Example networks (1MDB, BCCI, Epstein)
├── export-feature.js               # Fixed PNG/SVG export
│
├── ai-extraction.js                # AI extraction core logic
├── ai-extraction-modal.js          # Modal UI for AI extraction
├── ai-extraction.css               # AI extraction styles
├── ai-extraction-modal.css         # Modal-specific styles
├── ai-visualizer-integration.js    # Integration with visualizer
│
├── api_server.py                   # Flask API server
├── test_api.py                     # API test script
├── API_DOCUMENTATION.md            # Complete API reference
│
└── README_COMPLETE.md              # This file
```

---

## Installation & Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.7+ (for API server)
- OpenAI API key (for AI extraction)

### Web Interface Only

No installation needed! Just open `index.html` in a browser.

### With API Server

1. Install Python dependencies:
   ```bash
   pip install flask flask-cors
   ```

2. Start the API server:
   ```bash
   python3 api_server.py
   ```

3. Server runs on `http://localhost:5000`

---

## Usage Examples

### Example 1: Manual Network Building

1. Open `index.html`
2. Click "1MDB" to load example network
3. Explore the visualization
4. Export as PNG or SVG

### Example 2: AI-Assisted Extraction

1. Open `index.html`
2. Click 🤖 button
3. Configure OpenAI API key
4. Paste this text:
   ```
   John Smith, CEO of Acme Corp, has been under investigation
   for his financial ties to offshore company Panama Holdings.
   Smith served on the board of Panama Holdings from 2015-2020.
   ```
5. Click "Extract Network"
6. Review and add to visualization

### Example 3: Programmatic Network Building

```python
import requests

# Start with base entities
data = {
    "network_id": "investigation-2025",
    "entities": [
        {"name": "Alice", "type": "person", "importance": 5},
        {"name": "Bob", "type": "person", "importance": 4},
        {"name": "Acme Corp", "type": "organization", "importance": 4}
    ],
    "relationships": [
        {"source": "Alice", "target": "Acme Corp", "type": "employment"},
        {"source": "Bob", "target": "Acme Corp", "type": "employment"}
    ]
}

# Add to network
response = requests.post("http://localhost:5000/api/network", json=data)
print(response.json())

# Add more data incrementally
more_data = {
    "network_id": "investigation-2025",
    "entities": [
        {"name": "Charlie", "type": "person", "importance": 3}
    ],
    "relationships": [
        {"source": "Alice", "target": "Charlie", "type": "personal"}
    ]
}

requests.post("http://localhost:5000/api/network", json=more_data)

# Export for Silent Partners
export = requests.get("http://localhost:5000/api/network/investigation-2025/export")
with open("network.json", "w") as f:
    json.dump(export.json(), f)
```

### Example 4: Batch Document Processing

```python
import requests
from openai import OpenAI

client = OpenAI()

def extract_and_build_network(documents, network_id):
    """Process multiple documents and build a network"""
    
    for doc in documents:
        # Use AI to extract entities and relationships
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": f"Extract entities and relationships in JSON format:\n\n{doc}"
            }]
        )
        
        extracted = json.loads(response.choices[0].message.content)
        extracted['network_id'] = network_id
        
        # Add to network via API
        requests.post("http://localhost:5000/api/network", json=extracted)
    
    # Export final network
    export = requests.get(f"http://localhost:5000/api/network/{network_id}/export")
    return export.json()
```

---

## Advanced Features

### Two-Stage AI Extraction

For complex documents, use a two-stage approach:

**Stage 1: Fast Extraction (Claude 3.5 Sonnet)**
- Quick extraction of explicit relationships
- ~5 seconds, ~$0.001 per document

**Stage 2: Relationship Inference (o1-mini)**
- Analyzes extracted entities
- Finds implicit connections
- Discovers transitive relationships
- ~30 seconds, ~$0.01 per document

*Note: Stage 2 requires custom implementation - see `best_models_for_extraction.md`*

### Custom AI Models

The AI extraction supports multiple models. To add more:

1. Edit `ai-extraction.js`
2. Add model to `MODEL_CONFIGS`
3. Update UI dropdown in `ai-extraction-modal.js`

### API Authentication

For production use, add API key authentication:

1. Edit `api_server.py`
2. Add authentication middleware
3. Require API key in headers

---

## Troubleshooting

### PNG Export Issues

**Problem:** PNG export still creates empty files

**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Check browser console for errors

### AI Extraction Not Working

**Problem:** "Please configure your OpenAI API key first"

**Solution:**
- Get API key from https://platform.openai.com/api-keys
- Click 💾 to save key
- Key is stored in browser localStorage

**Problem:** Extraction fails with error

**Solution:**
- Check API key is valid
- Ensure you have OpenAI credits
- Try shorter text (< 2000 words)

### API Server Issues

**Problem:** API server not responding

**Solution:**
- Check server is running: `curl http://localhost:5000/api/health`
- Check port 5000 is not in use
- Restart server: `python3 api_server.py`

**Problem:** CORS errors in browser

**Solution:**
- Ensure flask-cors is installed: `pip install flask-cors`
- Check CORS is enabled in `api_server.py`

---

## Performance Tips

1. **Use GPT-4.1 Mini** for best balance of speed/cost/quality
2. **Batch API requests** when adding multiple entities
3. **Export regularly** to save network state
4. **Use network IDs** for organized data management
5. **Normalize entity names** to avoid duplicates

---

## Security Considerations

### Web Interface

- API keys stored in browser localStorage (client-side only)
- No data sent to external servers except OpenAI
- All processing happens in browser

### API Server

- **Development mode only** - not production-ready
- No authentication by default
- In-memory storage (data lost on restart)
- Suitable for local/trusted environments only

**For production:**
- Add API key authentication
- Use HTTPS
- Add database persistence (PostgreSQL/MongoDB)
- Implement rate limiting
- Add input validation and sanitization

---

## Known Limitations

1. **API server storage is in-memory** - data lost on restart
2. **No authentication** on API endpoints
3. **AI extraction requires OpenAI API key** - user must provide
4. **Browser localStorage** for API key (cleared if cache cleared)
5. **No real-time collaboration** - single-user only

---

## Future Enhancements

- [ ] Database persistence for API server
- [ ] API key authentication for production use
- [ ] Two-stage AI extraction (with relationship inference)
- [ ] Support for Claude 3.5 Sonnet and o1-mini
- [ ] Batch document processing UI
- [ ] Network merging and comparison
- [ ] Real-time collaboration
- [ ] Advanced search and filtering
- [ ] Export to other formats (GraphML, GEXF)
- [ ] Integration with document management systems

---

## Credits

**Original Silent Partners** by Project Brazen

**AI Enhancements** added in this version:
- AI network extraction with OpenAI integration
- REST API for programmatic access
- Fixed PNG export
- Improved theme system

**Inspired by** Mark Lombardi's network visualization art

---

## License

See original Silent Partners license.

---

## Support

For issues or questions:
- Check `API_DOCUMENTATION.md` for API reference
- Review `best_models_for_extraction.md` for AI model recommendations
- Test with `test_api.py` to verify API functionality

---

## Changelog

### Version 2.0 (Current)

**Added:**
- AI network extraction modal UI
- REST API for programmatic access
- API documentation and test scripts

**Fixed:**
- PNG export now creates proper images
- Theme system preserves typography

**Improved:**
- Theme color palettes
- Error handling and user feedback
- Code organization and documentation

### Version 1.0 (Original)

- Initial Silent Partners implementation
- Example networks (1MDB, BCCI, Epstein)
- Multiple layout algorithms
- Basic export functionality
