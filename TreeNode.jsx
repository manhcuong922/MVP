/* TreeNode — recursive, with expand/collapse + inline add-child */

const { useState, useRef, useEffect, useMemo, useCallback } = React;

const countDescendants = (node) => {
  if (!node.children?.length) return 0;
  return node.children.length + node.children.reduce((acc, c) => acc + countDescendants(c), 0);
};

const countDirect = (node) => node.children?.length || 0;

const TreeNode = ({
  node,
  depth = 0,
  isLast = false,
  expandedSet,
  onToggle,
  selectedId,
  onSelect,
  onAddChild,
  searchQuery,
  addingTo,
  setAddingTo,
  onCommitAdd,
  parentPath = [],
}) => {
  const children = node.children || [];
  const hasChildren = children.length > 0;
  const isOpen = expandedSet.has(node.id);
  const isSelected = selectedId === node.id;
  const isAddingHere = addingTo === node.id;
  const direct = countDirect(node);

  // Search filter: show if node or any descendant matches
  const matches = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nodeMatch = (n) =>
      n.title.toLowerCase().includes(q) ||
      (n.subtitle || '').toLowerCase().includes(q) ||
      (n.owner?.name || '').toLowerCase().includes(q);
    const any = (n) => nodeMatch(n) || (n.children || []).some(any);
    return any(node);
  }, [searchQuery, node]);

  if (!matches) return null;

  const newPath = [...parentPath, node];

  return (
    <div className={`node ${isLast ? 'last-child' : ''}`} data-node-id={node.id}>
      <div
        className={`node-row ${isSelected ? 'selected' : ''}`}
        data-kind={node.kind}
        onClick={() => onSelect(node.id, newPath)}
        data-screen-label={`node-${node.id}`}
      >
        <div className="indent-guides">
          {Array.from({ length: depth }).map((_, i) => (
            <div key={i} className="indent-guide" />
          ))}
        </div>

        <button
          className={`chev ${hasChildren ? (isOpen ? 'open' : '') : 'leaf'}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          <Icons.Chevron />
        </button>

        <div className="kind-icon"><KindIcon kind={node.kind} /></div>

        <div className="node-label">
          <span className="node-title">{node.title}</span>
          {node.subtitle && <span className="node-subtitle">— {node.subtitle}</span>}
        </div>

        <div className="node-meta">
          {direct > 0 && <div className="count-pill">{direct}</div>}
          <Avatar owner={node.owner} />
          <div className={`status-dot ${node.status || 'planned'}`} title={node.status} />
          <button
            className="row-action"
            onClick={(e) => {
              e.stopPropagation();
              if (!isOpen && hasChildren) onToggle(node.id);
              setAddingTo(node.id);
            }}
            title="Add child node"
          >
            <Icons.Plus size={11} />
          </button>
        </div>
      </div>

      {(isOpen || !hasChildren) && (
        <div className="node-children">
          {isOpen && children.map((child, i) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={i === children.length - 1 && !isAddingHere}
              expandedSet={expandedSet}
              onToggle={onToggle}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              searchQuery={searchQuery}
              addingTo={addingTo}
              setAddingTo={setAddingTo}
              onCommitAdd={onCommitAdd}
              parentPath={newPath}
            />
          ))}

          {isAddingHere && (
            <NewNodeRow
              depth={depth + 1}
              onCommit={(title) => { onCommitAdd(node.id, title); }}
              onCancel={() => setAddingTo(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

const NewNodeRow = ({ depth, onCommit, onCancel }) => {
  const [val, setVal] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="node-row" style={{ background: 'rgba(126, 226, 208, 0.04)' }}>
      <div className="indent-guides">
        {Array.from({ length: depth }).map((_, i) => (
          <div key={i} className="indent-guide" />
        ))}
      </div>
      <div className="chev leaf"><Icons.Chevron /></div>
      <div className="kind-icon" style={{ color: 'var(--accent)' }}>
        <Icons.Plus size={12} />
      </div>
      <input
        ref={ref}
        className="new-input"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="New node title…"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && val.trim()) onCommit(val.trim());
          else if (e.key === 'Escape') onCancel();
        }}
        onBlur={() => { if (val.trim()) onCommit(val.trim()); else onCancel(); }}
      />
    </div>
  );
};

window.TreeNode = TreeNode;
