# Silent Partners API Documentation

## Overview

The Silent Partners API allows external AI processes to programmatically add entities and relationships to network visualizations. This enables automated network construction from various data sources.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently no authentication required (suitable for local/development use). For production deployment, add API key authentication.

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T07:00:00.000Z",
  "version": "1.0.0"
}
```

---

### 2. Add Network Data

**POST** `/api/network`

Add entities and relationships to a network.

**Request Body:**
```json
{
  "network_id": "my-investigation-2025",
  "entities": [
    {
      "name": "John Doe",
      "type": "person",
      "importance": 5,
      "description": "CEO of Example Corp"
    },
    {
      "name": "Example Corp",
      "type": "organization",
      "importance": 4,
      "description": "Technology company"
    }
  ],
  "relationships": [
    {
      "source": "John Doe",
      "target": "Example Corp",
      "type": "employment",
      "description": "CEO since 2020",
      "status": "confirmed",
      "value": "$500K salary",
      "date": "2020-01-01"
    }
  ]
}
```

**Field Descriptions:**

**Entity Fields:**
- `name` (required): Entity name
- `type` (optional): `person`, `organization`, `location`, or `event` (default: `person`)
- `importance` (optional): 1-5 scale (default: 3)
- `description` (optional): Additional context

**Relationship Fields:**
- `source` (required): Source entity name (must exist in entities)
- `target` (required): Target entity name (must exist in entities)
- `type` (optional): `financial`, `employment`, `personal`, `legal`, `political`, or `business` (default: `business`)
- `description` (optional): Relationship details
- `status` (optional): `confirmed`, `suspected`, or `former` (default: `confirmed`)
- `value` (optional): Monetary value or other metric
- `date` (optional): Date or date range

**Response:**
```json
{
  "success": true,
  "network_id": "my-investigation-2025",
  "added": {
    "entities": 2,
    "relationships": 1
  },
  "total": {
    "entities": 2,
    "relationships": 1
  }
}
```

**Notes:**
- Duplicate entities (by name, case-insensitive) are automatically skipped
- Duplicate relationships (bidirectional) are automatically skipped
- Relationships require both entities to exist
- If `network_id` is omitted, a unique ID is auto-generated

---

### 3. Get Network

**GET** `/api/network/{network_id}`

Retrieve a network by ID.

**Response:**
```json
{
  "network_id": "my-investigation-2025",
  "entities": [...],
  "relationships": [...],
  "created_at": "2025-11-03T07:00:00.000Z",
  "updated_at": "2025-11-03T07:05:00.000Z"
}
```

---

### 4. List Networks

**GET** `/api/networks`

List all networks.

**Response:**
```json
{
  "networks": [
    {
      "network_id": "my-investigation-2025",
      "entity_count": 15,
      "relationship_count": 23,
      "created_at": "2025-11-03T07:00:00.000Z",
      "updated_at": "2025-11-03T07:05:00.000Z"
    }
  ]
}
```

---

### 5. Export Network

**GET** `/api/network/{network_id}/export`

Export network in Silent Partners format (ready for import).

**Response:**
```json
{
  "nodes": [
    {
      "id": "node_0",
      "name": "John Doe",
      "type": "person",
      "importance": 1.0
    }
  ],
  "links": [
    {
      "source": "node_0",
      "target": "node_1",
      "type": "employment",
      "status": "confirmed"
    }
  ],
  "metadata": {
    "title": "Network my-investigation-2025",
    "created_at": "2025-11-03T07:00:00.000Z",
    "updated_at": "2025-11-03T07:05:00.000Z"
  }
}
```

---

### 6. Delete Network

**DELETE** `/api/network/{network_id}`

Delete a network.

**Response:**
```json
{
  "success": true,
  "message": "Network my-investigation-2025 deleted"
}
```

---

## Usage Examples

### Python Example

```python
import requests

# API base URL
API_URL = "http://localhost:5000/api"

# Add network data
data = {
    "network_id": "1mdb-investigation",
    "entities": [
        {
            "name": "Jho Low",
            "type": "person",
            "importance": 5,
            "description": "Malaysian financier"
        },
        {
            "name": "1MDB",
            "type": "organization",
            "importance": 5,
            "description": "Malaysian sovereign wealth fund"
        }
    ],
    "relationships": [
        {
            "source": "Jho Low",
            "target": "1MDB",
            "type": "financial",
            "description": "Orchestrated fraud scheme",
            "status": "confirmed",
            "value": "$4.5 billion"
        }
    ]
}

response = requests.post(f"{API_URL}/network", json=data)
print(response.json())

# Get network
network_id = "1mdb-investigation"
response = requests.get(f"{API_URL}/network/{network_id}")
print(response.json())

# Export for Silent Partners
response = requests.get(f"{API_URL}/network/{network_id}/export")
export_data = response.json()

# Save to file for import
with open("network_export.json", "w") as f:
    json.dump(export_data, f, indent=2)
```

### JavaScript Example

```javascript
// Add network data
const data = {
  network_id: "investigation-2025",
  entities: [
    {
      name: "Alice Smith",
      type: "person",
      importance: 4,
      description: "Board member"
    }
  ],
  relationships: []
};

fetch('http://localhost:5000/api/network', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => console.log(result));
```

### cURL Example

```bash
# Add network data
curl -X POST http://localhost:5000/api/network \
  -H "Content-Type: application/json" \
  -d '{
    "network_id": "test-network",
    "entities": [
      {
        "name": "Test Entity",
        "type": "person",
        "importance": 3
      }
    ]
  }'

# Get network
curl http://localhost:5000/api/network/test-network

# Export network
curl http://localhost:5000/api/network/test-network/export > network.json
```

---

## Starting the API Server

### Development Mode

```bash
cd /path/to/silent_partners_enhanced
python3 api_server.py
```

The server will start on `http://localhost:5000`

### Production Mode

For production deployment, use a production WSGI server like Gunicorn:

```bash
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api_server:app
```

---

## Integration with AI Processes

### Use Case 1: Document Analysis Pipeline

```python
import openai
import requests

def analyze_document_and_build_network(document_text, network_id):
    """
    Analyze a document with AI and build a network
    """
    # Use AI to extract entities and relationships
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"Extract entities and relationships from this text in JSON format:\n\n{document_text}"
        }]
    )
    
    extracted_data = json.loads(response.choices[0].message.content)
    extracted_data['network_id'] = network_id
    
    # Send to Silent Partners API
    api_response = requests.post(
        "http://localhost:5000/api/network",
        json=extracted_data
    )
    
    return api_response.json()
```

### Use Case 2: Batch Processing

```python
def process_multiple_documents(documents, network_id):
    """
    Process multiple documents and add to the same network
    """
    for doc in documents:
        # Extract data from each document
        data = extract_network_data(doc)
        data['network_id'] = network_id
        
        # Add to network
        requests.post("http://localhost:5000/api/network", json=data)
    
    # Export final network
    export = requests.get(f"http://localhost:5000/api/network/{network_id}/export")
    return export.json()
```

### Use Case 3: Real-time Network Building

```python
def stream_network_updates(data_stream, network_id):
    """
    Build network in real-time from streaming data
    """
    for chunk in data_stream:
        entities, relationships = process_chunk(chunk)
        
        requests.post("http://localhost:5000/api/network", json={
            "network_id": network_id,
            "entities": entities,
            "relationships": relationships
        })
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Network not found
- `500 Internal Server Error`: Server error

Error responses include a message:

```json
{
  "error": "Error description"
}
```

---

## Best Practices

1. **Use consistent network IDs** for related data
2. **Normalize entity names** to avoid duplicates (case-insensitive matching is automatic)
3. **Batch requests** when possible to reduce API calls
4. **Validate data** before sending to avoid errors
5. **Export regularly** to save network state
6. **Use descriptive network IDs** for easy identification

---

## Limitations

- **In-memory storage**: Data is lost when server restarts (add database for persistence)
- **No authentication**: Suitable for local use only (add API keys for production)
- **Single server**: Not horizontally scalable (add Redis/database for multi-instance)

---

## Future Enhancements

- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] API key authentication
- [ ] Rate limiting
- [ ] Webhook notifications
- [ ] Batch import/export
- [ ] Network merging
- [ ] Advanced search and filtering
- [ ] WebSocket support for real-time updates

---

## Support

For issues or questions, refer to the main Silent Partners documentation or create an issue in the project repository.
