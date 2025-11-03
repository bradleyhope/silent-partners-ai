#!/usr/bin/env python3
"""
Test script for Silent Partners API
Demonstrates how to programmatically add network data
"""

import requests
import json
import time

# API base URL
API_URL = "http://localhost:5000/api"

def test_health():
    """Test API health check"""
    print("Testing API health...")
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    return response.status_code == 200

def test_add_network():
    """Test adding network data"""
    print("Testing network data submission...")
    
    # Sample network data
    data = {
        "network_id": "test-1mdb",
        "entities": [
            {
                "name": "Jho Low",
                "type": "person",
                "importance": 5,
                "description": "Malaysian financier, primary architect of 1MDB fraud"
            },
            {
                "name": "Najib Razak",
                "type": "person",
                "importance": 5,
                "description": "Former Prime Minister of Malaysia"
            },
            {
                "name": "1MDB",
                "type": "organization",
                "importance": 5,
                "description": "Malaysian sovereign wealth fund"
            },
            {
                "name": "Goldman Sachs",
                "type": "organization",
                "importance": 4,
                "description": "Investment bank that arranged bond sales"
            },
            {
                "name": "Tim Leissner",
                "type": "person",
                "importance": 3,
                "description": "Goldman Sachs Southeast Asia chairman"
            }
        ],
        "relationships": [
            {
                "source": "Jho Low",
                "target": "1MDB",
                "type": "financial",
                "description": "Orchestrated systematic looting",
                "status": "confirmed",
                "value": "$4.5 billion"
            },
            {
                "source": "Jho Low",
                "target": "Najib Razak",
                "type": "personal",
                "description": "Cultivated relationship with PM",
                "status": "confirmed"
            },
            {
                "source": "Najib Razak",
                "target": "1MDB",
                "type": "employment",
                "description": "Chairman of 1MDB advisory board",
                "status": "confirmed"
            },
            {
                "source": "Goldman Sachs",
                "target": "1MDB",
                "type": "financial",
                "description": "Arranged bond sales",
                "status": "confirmed",
                "value": "$6.5 billion raised, $600M fees"
            },
            {
                "source": "Tim Leissner",
                "target": "Goldman Sachs",
                "type": "employment",
                "description": "Southeast Asia chairman",
                "status": "former"
            }
        ]
    }
    
    response = requests.post(f"{API_URL}/network", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    return response.status_code == 200

def test_get_network():
    """Test retrieving network data"""
    print("Testing network retrieval...")
    
    network_id = "test-1mdb"
    response = requests.get(f"{API_URL}/network/{network_id}")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Network ID: {data['network_id']}")
        print(f"Entities: {len(data['entities'])}")
        print(f"Relationships: {len(data['relationships'])}")
        print(f"Created: {data['created_at']}")
        print(f"Updated: {data['updated_at']}\n")
    else:
        print(f"Error: {response.json()}\n")
    
    return response.status_code == 200

def test_export_network():
    """Test exporting network in Silent Partners format"""
    print("Testing network export...")
    
    network_id = "test-1mdb"
    response = requests.get(f"{API_URL}/network/{network_id}/export")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Nodes: {len(data['nodes'])}")
        print(f"Links: {len(data['links'])}")
        
        # Save to file
        output_file = "network_export.json"
        with open(output_file, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Exported to: {output_file}\n")
    else:
        print(f"Error: {response.json()}\n")
    
    return response.status_code == 200

def test_list_networks():
    """Test listing all networks"""
    print("Testing network listing...")
    
    response = requests.get(f"{API_URL}/networks")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total networks: {len(data['networks'])}")
        for network in data['networks']:
            print(f"  - {network['network_id']}: {network['entity_count']} entities, {network['relationship_count']} relationships")
        print()
    else:
        print(f"Error: {response.json()}\n")
    
    return response.status_code == 200

def test_incremental_add():
    """Test adding data incrementally to existing network"""
    print("Testing incremental data addition...")
    
    # Add more entities to existing network
    data = {
        "network_id": "test-1mdb",
        "entities": [
            {
                "name": "Roger Ng",
                "type": "person",
                "importance": 3,
                "description": "Goldman Sachs banker convicted for role in scandal"
            },
            {
                "name": "Red Granite Pictures",
                "type": "organization",
                "importance": 2,
                "description": "Production company that financed Wolf of Wall Street"
            }
        ],
        "relationships": [
            {
                "source": "Roger Ng",
                "target": "Goldman Sachs",
                "type": "employment",
                "description": "Banker involved in 1MDB transactions",
                "status": "former"
            },
            {
                "source": "Jho Low",
                "target": "Red Granite Pictures",
                "type": "financial",
                "description": "Financed film production with stolen funds",
                "status": "confirmed"
            }
        ]
    }
    
    response = requests.post(f"{API_URL}/network", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    return response.status_code == 200

def main():
    """Run all tests"""
    print("=" * 60)
    print("Silent Partners API Test Suite")
    print("=" * 60)
    print()
    
    tests = [
        ("Health Check", test_health),
        ("Add Network Data", test_add_network),
        ("Get Network", test_get_network),
        ("List Networks", test_list_networks),
        ("Incremental Add", test_incremental_add),
        ("Export Network", test_export_network),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"ERROR in {test_name}: {str(e)}\n")
            results.append((test_name, False))
        
        time.sleep(0.5)  # Brief pause between tests
    
    # Summary
    print("=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    for test_name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")
    print()

if __name__ == "__main__":
    main()
