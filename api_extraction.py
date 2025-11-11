"""
AI Extraction API Endpoint
Handles AI-powered entity and relationship extraction using server-side OpenAI key
"""

from flask import request, jsonify
import os
import json
from openai import OpenAI

# Initialize OpenAI client with server-side API key
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def extract_network(text, model='gpt-4.1-mini'):
    """
    Extract entities and relationships from text using OpenAI API
    
    Args:
        text: Input text to analyze
        model: OpenAI model to use
        
    Returns:
        dict with entities and relationships
    """
    
    # Extraction prompt
    prompt = f"""Analyze the following text and extract all entities (people, organizations, locations, events) and their relationships.

Return a JSON object with this structure:
{{
  "entities": [
    {{
      "id": "unique_id",
      "name": "Entity Name",
      "type": "person|organization|location|event|financial_institution|government_entity",
      "importance": 1-10,
      "description": "Brief description"
    }}
  ],
  "relationships": [
    {{
      "source": "entity_id",
      "target": "entity_id",
      "type": "financial|employment|personal|legal|ownership|other",
      "description": "Relationship description",
      "status": "confirmed|suspected|former",
      "value": "monetary value if applicable"
    }}
  ]
}}

Text to analyze:
{text}

Return ONLY the JSON object, no additional text."""

    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert at analyzing documents and extracting network relationships. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Add metadata
        result['metadata'] = {
            'model': model,
            'tokens_used': response.usage.total_tokens,
            'cost_estimate': calculate_cost(response.usage.total_tokens, model)
        }
        
        return result
        
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def infer_relationships(entities, relationships, original_text, model='gpt-4.1-mini'):
    """
    Find missing relationships between entities using graph analysis and AI reasoning
    
    Args:
        entities: List of extracted entities
        relationships: List of existing relationships
        original_text: Original source text
        model: OpenAI model to use
        
    Returns:
        dict with inferred relationships
    """
    
    # Create entity summary
    entity_summary = "\n".join([
        f"- {e['name']} ({e['type']}): {e.get('description', 'No description')}"
        for e in entities
    ])
    
    # Create existing relationships summary
    rel_summary = "\n".join([
        f"- {r['source']} → {r['target']}: {r['type']}"
        for r in relationships
    ])
    
    prompt = f"""Given these entities and their known relationships, identify any MISSING connections that are likely but not explicitly stated.

ENTITIES:
{entity_summary}

KNOWN RELATIONSHIPS:
{rel_summary}

ORIGINAL TEXT (for context):
{original_text[:2000]}...

Analyze the entities and find implicit or transitive relationships that are missing. Consider:
1. Co-occurrence (entities mentioned together)
2. Transitive connections (if A→B and B→C, is there A→C?)
3. Implicit relationships (colleagues, partners, etc.)

Return a JSON object:
{{
  "inferred_relationships": [
    {{
      "source": "entity_id",
      "target": "entity_id",
      "type": "relationship_type",
      "description": "Why this relationship is inferred",
      "confidence": 0.0-1.0,
      "evidence": "Evidence from text or logical inference"
    }}
  ]
}}

Return ONLY the JSON object."""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert at network analysis and finding implicit connections. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Add metadata
        result['metadata'] = {
            'model': model,
            'tokens_used': response.usage.total_tokens,
            'cost_estimate': calculate_cost(response.usage.total_tokens, model)
        }
        
        return result
        
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def calculate_cost(tokens, model):
    """Calculate estimated cost based on tokens and model"""
    # Pricing per 1M tokens (as of Nov 2024)
    pricing = {
        'gpt-4.1-mini': {'input': 0.15, 'output': 0.60},
        'gpt-4.1-nano': {'input': 0.10, 'output': 0.40},
        'gemini-2.5-flash': {'input': 0.075, 'output': 0.30}
    }
    
    # Rough estimate (assume 50/50 input/output)
    if model in pricing:
        avg_cost = (pricing[model]['input'] + pricing[model]['output']) / 2
        return (tokens / 1_000_000) * avg_cost
    else:
        return 0.001  # Default estimate


# Flask route handlers
def register_extraction_routes(app):
    """Register extraction routes with Flask app"""
    
    @app.route('/api/extract', methods=['POST'])
    def api_extract():
        """Extract entities and relationships from text"""
        try:
            data = request.get_json()
            
            if not data or 'text' not in data:
                return jsonify({'error': 'Missing text parameter'}), 400
            
            text = data['text']
            model = data.get('model', 'gpt-4.1-mini')
            
            if not text.strip():
                return jsonify({'error': 'Text cannot be empty'}), 400
            
            # Perform extraction
            result = extract_network(text, model)
            
            return jsonify(result), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/infer', methods=['POST'])
    def api_infer():
        """Infer missing relationships"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'Missing request data'}), 400
            
            entities = data.get('entities', [])
            relationships = data.get('relationships', [])
            original_text = data.get('text', '')
            model = data.get('model', 'gpt-4.1-mini')
            
            if not entities:
                return jsonify({'error': 'No entities provided'}), 400
            
            # Perform inference
            result = infer_relationships(entities, relationships, original_text, model)
            
            return jsonify(result), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
