import re

def parse_edge(edge_str: str):
    edge_str = edge_str.strip()
    # Validate format A->B
    if not re.match(r"^[A-Z]->[A-Z]$", edge_str):
        return None, None, False
    
    parts = edge_str.split("->")
    parent = parts[0]
    child = parts[1]
    
    # Reject self-loops
    if parent == child:
        return None, None, False
        
    return parent, child, True
