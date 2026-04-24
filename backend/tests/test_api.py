import pytest
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_get_identity():
    response = client.get("/api/bfhl")
    assert response.status_code == 200
    data = response.json()
    assert data["operation_code"] == 1
    assert "user_id" in data
    assert "email_id" in data
    assert "college_roll_number" in data

def test_post_happy_path():
    response = client.post("/api/bfhl", json={"data": ["A->B", "A->C", "B->D"]})
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["summary"]["total_trees"] == 1
    assert data["summary"]["largest_tree_root"] == "A"
    assert data["hierarchies"][0]["depth"] == 3
    assert data["hierarchies"][0]["root"] == "A"

def test_invalid_entries():
    response = client.post("/api/bfhl", json={"data": ["AB->C", "1->2", "hello", "A->", "A->A", ""]})
    assert response.status_code == 200
    data = response.json()
    assert len(data["invalid_entries"]) == 6
    assert data["summary"]["total_trees"] == 0

def test_duplicate_edge():
    response = client.post("/api/bfhl", json={"data": ["A->B", "A->B"]})
    assert response.status_code == 200
    data = response.json()
    assert len(data["duplicate_edges"]) == 1
    assert data["duplicate_edges"][0] == "A->B"
    assert data["summary"]["total_trees"] == 1

def test_multi_parent():
    response = client.post("/api/bfhl", json={"data": ["A->C", "B->C"]})
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_trees"] == 2
    assert "B" in [h["root"] for h in data["hierarchies"]]

def test_cycle():
    response = client.post("/api/bfhl", json={"data": ["A->B", "B->C", "C->A"]})
    assert response.status_code == 200
    data = response.json()
    assert data["has_cycle"] is True
    assert data["summary"]["total_cycles"] == 1
    assert "depth" not in data["hierarchies"][0]

def test_lex_tie_break():
    response = client.post("/api/bfhl", json={"data": ["Z->Y", "A->B"]})
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["largest_tree_root"] == "A"

def test_empty_data():
    response = client.post("/api/bfhl", json={"data": []})
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_trees"] == 0

def test_whitespace_trim():
    response = client.post("/api/bfhl", json={"data": [" A->B "]})
    assert response.status_code == 200
    data = response.json()
    assert len(data["invalid_entries"]) == 0
    assert data["summary"]["total_trees"] == 1

def test_response_shape():
    response = client.post("/api/bfhl", json={"data": ["A->B"]})
    assert response.status_code == 200
    data = response.json()
    assert all(k in data for k in ["user_id", "email_id", "college_roll_number", "hierarchies", "invalid_entries", "duplicate_edges", "summary", "submission_id"])

def test_post_default_saves():
    response = client.post("/api/bfhl", json={"data": ["A->B"]})
    assert response.status_code == 200
    data = response.json()
    assert "submission_id" in data

def test_post_save_false():
    response = client.post("/api/bfhl", json={"data": ["A->B"], "save": False})
    assert response.status_code == 200
    data = response.json()
    assert "submission_id" not in data

def test_get_history():
    response = client.get("/api/bfhl/history")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "count" in data
    if len(data["items"]) > 0:
        assert "_id" not in data["items"][0]
        assert "response" not in data["items"][0]

def test_get_history_unknown():
    response = client.get("/api/bfhl/history/unknown")
    assert response.status_code == 404
