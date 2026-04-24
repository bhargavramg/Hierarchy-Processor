import React, { useState } from 'react';

export default function TreeView({ root, tree }) {
  const [collapsed, setCollapsed] = useState({});

  const toggle = (path) => {
    setCollapsed(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const rows = [];

  const flattenTree = (name, subtree, depth, pathStr) => {
    const hasChildren = Object.keys(subtree).length > 0;

    // Check if any ancestor is collapsed
    const parts = pathStr.split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += (i === 0 ? '' : '/') + parts[i];
      if (collapsed[currentPath]) return; // hidden
    }

    rows.push({ name, depth, hasChildren, path: pathStr, isRoot: depth === 0 });

    if (!collapsed[pathStr]) {
      Object.keys(subtree).sort().forEach(childName => {
        flattenTree(childName, subtree[childName], depth + 1, `${pathStr}/${childName}`);
      });
    }
  };

  if (root) flattenTree(root, tree || {}, 0, root);

  return (
    <div>
      {rows.map(row => (
        <div
          key={row.path}
          className="tree-row"
          style={{ paddingLeft: `${row.depth * 24 + 8}px` }}
          onClick={() => row.hasChildren && toggle(row.path)}
          data-testid={row.isRoot ? `tree-${root}-root` : `tree-${root}-node-${row.name}`}
        >
          <span
            className="tree-toggle"
            data-testid={row.hasChildren ? `tree-${root}-toggle-${row.name}` : undefined}
          >
            {row.hasChildren ? (collapsed[row.path] ? '▶' : '▼') : '·'}
          </span>
          <span className={`tree-node-pill ${row.isRoot ? 'tree-node-root' : ''}`}>
            {row.name}
          </span>
        </div>
      ))}
      {rows.length === 0 && (
        <div style={{ color: 'var(--ink-2)', fontSize: '13px', padding: '8px' }}>
          Empty tree
        </div>
      )}
    </div>
  );
}
