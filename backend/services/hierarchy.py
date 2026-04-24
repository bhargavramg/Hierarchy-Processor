from utils.validators import parse_edge

def process_edges(edges):
    invalid_entries = []
    duplicate_edges = []
    
    seen_edges = set()
    parent_map = {}
    children_map = {}
    all_nodes = set()
    
    for edge in edges:
        parent, child, is_valid = parse_edge(edge)
        if not is_valid:
            invalid_entries.append(edge)
            continue
            
        edge_clean = f"{parent}->{child}"
        
        if edge_clean in seen_edges:
            if edge_clean not in duplicate_edges:
                duplicate_edges.append(edge_clean)
            continue
            
        seen_edges.add(edge_clean)
        
        all_nodes.add(parent)
        all_nodes.add(child)
        
        # Multi-parent rule: keep first parent, ignore later ones
        if child in parent_map:
            continue
            
        parent_map[child] = parent
        if parent not in children_map:
            children_map[parent] = []
        children_map[parent].append(child)
        
    # Cycle detection
    def _detect_cycle():
        # returns True if cycle exists
        visited = {} # node -> 0 (unvisited), 1 (visiting), 2 (visited)
        for node in all_nodes:
            visited[node] = 0
            
        def dfs(u):
            visited[u] = 1
            for v in children_map.get(u, []):
                if visited[v] == 1:
                    return True
                if visited[v] == 0:
                    if dfs(v): return True
            visited[u] = 2
            return False
            
        for node in all_nodes:
            if visited[node] == 0:
                if dfs(node): return True
        return False
        
    has_cycle = _detect_cycle()
    
    if has_cycle:
        return {
            "has_cycle": True,
            "hierarchies": [{"root": "", "tree": {}}],
            "invalid_entries": invalid_entries,
            "duplicate_edges": duplicate_edges,
            "summary": {"total_trees": 0, "total_cycles": 1, "largest_tree_root": ""}
        }
        
    # No cycle, find roots (nodes with no parents)
    roots = []
    for node in all_nodes:
        if node not in parent_map:
            roots.append(node)
            
    # Sort roots alphabetically for tie-breaking
    roots.sort()
    
    def _build_tree(root):
        tree = {}
        for child in children_map.get(root, []):
            tree[child] = _build_tree(child)
        return tree
        
    def _tree_depth(root):
        if not children_map.get(root):
            return 1
        max_child_depth = 0
        for child in children_map[root]:
            max_child_depth = max(max_child_depth, _tree_depth(child))
        return 1 + max_child_depth
        
    hierarchies = []
    max_depth = 0
    largest_tree_root = ""
    
    for root in roots:
        depth = _tree_depth(root)
        if depth > max_depth:
            max_depth = depth
            largest_tree_root = root
        hierarchies.append({
            "root": root,
            "tree": _build_tree(root),
            "depth": depth
        })
        
    return {
        "has_cycle": False,
        "hierarchies": hierarchies,
        "invalid_entries": invalid_entries,
        "duplicate_edges": duplicate_edges,
        "summary": {
            "total_trees": len(roots),
            "total_cycles": 0,
            "largest_tree_root": largest_tree_root
        }
    }
