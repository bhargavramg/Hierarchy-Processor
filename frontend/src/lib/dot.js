export function toDot(result) {
  let lines = ['digraph Hierarchy {'];
  lines.push('  rankdir=TB;');
  lines.push('  node [fontname="JetBrains Mono", shape=box, style=rounded, color="#e6dfd4", fontcolor="#141210"];');
  lines.push('  edge [color="#c2410c"];');
  lines.push('');

  const roots = [];
  const edges = new Set(); // to avoid dupes

  const traverse = (node, tree, depth) => {
    Object.keys(tree).forEach(child => {
      edges.add(`  "${node}" -> "${child}";`);
      traverse(child, tree[child], depth + 1);
    });
  };

  if (result.hierarchies && !result.has_cycle) {
    result.hierarchies.forEach(h => {
      if (h.root) {
        roots.push(h.root);
        traverse(h.root, h.tree, 0);
      }
    });
  }

  // Style roots
  roots.forEach(root => {
    lines.push(`  "${root}" [color="#c2410c", style="filled,rounded", fillcolor="#c2410c", fontcolor="#ffffff"];`);
  });

  lines.push('');
  edges.forEach(e => lines.push(e));
  lines.push('}');
  
  return lines.join('\n');
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function b64urlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  try {
    return atob(b64);
  } catch(e) {
    return '';
  }
}
