#!/usr/bin/env python3
"""
Silent Partners API Server
Provides REST API for programmatic network data submission
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import logging
from datetime import datetime
from pathlib import Path
from api_extraction import register_extraction_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='.')

# Configure CORS based on environment
import os
cors_origins = os.getenv('CORS_ORIGINS', '*')
CORS(app, origins=cors_origins if cors_origins != '*' else '*')

# Store for network data (in-memory, can be replaced with database)
networks = {}

# Register AI extraction routes
register_extraction_routes(app)

@app.route('/')
def index():
    """Serve the main application"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/network', methods=['POST'])
def add_network_data():
    """
    Add entities and relationships to a network
    
    Expected JSON format:
    {
        "network_id": "optional-network-id",
        "entities": [
            {
                "name": "Entity Name",
                "type": "person|organization|location|event",
                "importance": 1-5,
                "description": "Optional description"
            }
        ],
        "relationships": [
            {
                "source": "Entity Name",
                "target": "Entity Name",
                "type": "financial|employment|personal|legal|political|business",
                "description": "Optional description",
                "status": "confirmed|suspected|former",
                "value": "Optional value",
                "date": "Optional date"
            }
        ]
    }
    
    Returns:
    {
        "success": true,
        "network_id": "network-id",
        "added": {
            "entities": 5,
            "relationships": 3
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if 'entities' not in data and 'relationships' not in data:
            return jsonify({'error': 'Must provide either entities or relationships'}), 400
        
        # Get or create network ID
        network_id = data.get('network_id', f'network_{datetime.utcnow().timestamp()}')
        
        # Initialize network if it doesn't exist
        if network_id not in networks:
            networks[network_id] = {
                'entities': [],
                'relationships': [],
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        
        network = networks[network_id]
        added_entities = 0
        added_relationships = 0
        
        # Add entities
        if 'entities' in data:
            entities = data['entities']
            if not isinstance(entities, list):
                return jsonify({'error': 'entities must be an array'}), 400
            
            for entity in entities:
                # Validate entity
                if not isinstance(entity, dict) or 'name' not in entity:
                    logger.warning(f'Invalid entity: {entity}')
                    continue
                
                # Check for duplicates
                if any(e['name'].lower() == entity['name'].lower() for e in network['entities']):
                    logger.info(f'Entity already exists: {entity["name"]}')
                    continue
                
                # Normalize entity
                normalized_entity = {
                    'name': entity['name'],
                    'type': entity.get('type', 'person'),
                    'importance': min(5, max(1, entity.get('importance', 3))),
                    'description': entity.get('description', '')
                }
                
                network['entities'].append(normalized_entity)
                added_entities += 1
                logger.info(f'Added entity: {normalized_entity["name"]}')
        
        # Add relationships
        if 'relationships' in data:
            relationships = data['relationships']
            if not isinstance(relationships, list):
                return jsonify({'error': 'relationships must be an array'}), 400
            
            # Create entity name lookup
            entity_names = {e['name'].lower() for e in network['entities']}
            
            for rel in relationships:
                # Validate relationship
                if not isinstance(rel, dict) or 'source' not in rel or 'target' not in rel:
                    logger.warning(f'Invalid relationship: {rel}')
                    continue
                
                # Check if entities exist
                source_lower = rel['source'].lower()
                target_lower = rel['target'].lower()
                
                if source_lower not in entity_names:
                    logger.warning(f'Source entity not found: {rel["source"]}')
                    continue
                
                if target_lower not in entity_names:
                    logger.warning(f'Target entity not found: {rel["target"]}')
                    continue
                
                # Check for duplicates
                exists = any(
                    (r['source'].lower() == source_lower and r['target'].lower() == target_lower) or
                    (r['source'].lower() == target_lower and r['target'].lower() == source_lower)
                    for r in network['relationships']
                )
                
                if exists:
                    logger.info(f'Relationship already exists: {rel["source"]} -> {rel["target"]}')
                    continue
                
                # Normalize relationship
                normalized_rel = {
                    'source': rel['source'],
                    'target': rel['target'],
                    'type': rel.get('type', 'business'),
                    'description': rel.get('description', ''),
                    'status': rel.get('status', 'confirmed'),
                    'value': rel.get('value', ''),
                    'date': rel.get('date', '')
                }
                
                network['relationships'].append(normalized_rel)
                added_relationships += 1
                logger.info(f'Added relationship: {normalized_rel["source"]} -> {normalized_rel["target"]}')
        
        # Update timestamp
        network['updated_at'] = datetime.utcnow().isoformat()
        
        return jsonify({
            'success': True,
            'network_id': network_id,
            'added': {
                'entities': added_entities,
                'relationships': added_relationships
            },
            'total': {
                'entities': len(network['entities']),
                'relationships': len(network['relationships'])
            }
        })
    
    except Exception as e:
        logger.error(f'Error adding network data: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/network/<network_id>', methods=['GET'])
def get_network(network_id):
    """
    Get network data by ID
    
    Returns:
    {
        "network_id": "network-id",
        "entities": [...],
        "relationships": [...],
        "created_at": "...",
        "updated_at": "..."
    }
    """
    if network_id not in networks:
        return jsonify({'error': 'Network not found'}), 404
    
    return jsonify({
        'network_id': network_id,
        **networks[network_id]
    })

@app.route('/api/networks', methods=['GET'])
def list_networks():
    """
    List all networks
    
    Returns:
    {
        "networks": [
            {
                "network_id": "...",
                "entity_count": 5,
                "relationship_count": 3,
                "created_at": "...",
                "updated_at": "..."
            }
        ]
    }
    """
    network_list = [
        {
            'network_id': network_id,
            'entity_count': len(data['entities']),
            'relationship_count': len(data['relationships']),
            'created_at': data['created_at'],
            'updated_at': data['updated_at']
        }
        for network_id, data in networks.items()
    ]
    
    return jsonify({'networks': network_list})

@app.route('/api/network/<network_id>', methods=['DELETE'])
def delete_network(network_id):
    """Delete a network"""
    if network_id not in networks:
        return jsonify({'error': 'Network not found'}), 404
    
    del networks[network_id]
    logger.info(f'Deleted network: {network_id}')
    
    return jsonify({'success': True, 'message': f'Network {network_id} deleted'})

@app.route('/api/network/<network_id>/export', methods=['GET'])
def export_network(network_id):
    """
    Export network in Silent Partners format
    
    Returns JSON compatible with Silent Partners import
    """
    if network_id not in networks:
        return jsonify({'error': 'Network not found'}), 404
    
    network = networks[network_id]
    
    # Convert to Silent Partners format
    nodes = []
    for idx, entity in enumerate(network['entities']):
        nodes.append({
            'id': f'node_{idx}',
            'name': entity['name'],
            'type': entity['type'],
            'importance': entity['importance'] / 5.0  # Normalize to 0-1
        })
    
    # Create node ID lookup
    node_lookup = {node['name'].lower(): node['id'] for node in nodes}
    
    links = []
    for rel in network['relationships']:
        source_id = node_lookup.get(rel['source'].lower())
        target_id = node_lookup.get(rel['target'].lower())
        
        if source_id and target_id:
            link = {
                'source': source_id,
                'target': target_id,
                'type': rel['type'],
                'status': rel['status']
            }
            
            if rel.get('date'):
                link['date'] = rel['date']
            if rel.get('value'):
                link['value'] = rel['value']
            
            links.append(link)
    
    return jsonify({
        'nodes': nodes,
        'links': links,
        'metadata': {
            'title': f'Network {network_id}',
            'created_at': network['created_at'],
            'updated_at': network['updated_at']
        }
    })

if __name__ == '__main__':
    logger.info('Starting Silent Partners API Server')
    logger.info('API Documentation: http://localhost:5000/api/health')
    app.run(host='0.0.0.0', port=5000, debug=True)
