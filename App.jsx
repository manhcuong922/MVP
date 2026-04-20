/* Helix — Tree Node Workspace */

const { useState, useEffect, useMemo, useCallback, useRef } = React;



const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "cozy",
  "panel": "right",
  "connector": "guides",
  "layout": "mindmap",
  "showTweaks": false
}/*EDITMODE-END*/;

// Clone data (mutable)
const deepClone = (n) => ({
  ...n,
  children: (n.children || []).map(deepClone),
});

// Build id index
const indexTree = (root) => {
  const map = new Map();
  const parents = new Map();
  const paths = new Map();
  const walk = (n, parent, path) => {
    const p = [...path, n];
    map.set(n.id, n);
    if (parent) parents.set(n.id, parent.id);
    paths.set(n.id, p);
    (n.children || []).forEach(c => walk(c, n, p));
  };
  walk(root, null, []);
  return { map, parents, paths };
};

// Collect ids to expand so the path to a node is visible
const ancestorIds = (nodeId, parents) => {
  const out = [];
  let cur = parents.get(nodeId);
  while (cur) { out.push(cur); cur = parents.get(cur); }
  return out;
};

const kindForChild = (parentKind) => {
  const order = ['workspace', 'quarter', 'initiative', 'epic', 'story', 'story'];
  const idx = order.indexOf(parentKind);
  return order[Math.min(idx + 1, order.length - 1)] || 'story';
};

const App = () => {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [showTweaks, setShowTweaks] = useState(false);
  const [data, setData] = useState(() => deepClone(window.ROADMAP_DATA));
  const [selectedId, setSelectedId] = useState('s3');
  const [expanded, setExpanded] = useState(() => new Set(['root', 's1', 's2', 's3', 's4', 's5', 's6']));
  const [query, setQuery] = useState('');
  const [addingTo, setAddingTo] = useState(null);
  const searchRef = useRef(null);

  const index = useMemo(() => indexTree(data), [data]);
  const selectedNode = selectedId ? index.map.get(selectedId) : null;
  const selectedPath = selectedId ? index.paths.get(selectedId) || [] : [];

  // If searching, auto-expand any branches containing matches
  useEffect(() => {
    if (!query) return;
    const q = query.toLowerCase();
    const toExpand = new Set(expanded);
    const walk = (n, ancestors) => {
      const match = n.title.toLowerCase().includes(q) ||
        (n.subtitle||'').toLowerCase().includes(q) ||
        (n.owner?.name||'').toLowerCase().includes(q);
      if (match) ancestors.forEach(a => toExpand.add(a));
      (n.children||[]).forEach(c => walk(c, [...ancestors, n.id]));
    };
    walk(data, []);
    setExpanded(toExpand);
  }, [query]);

  const handleToggle = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
    // make sure the path to it is open
    setExpanded(prev => {
      const next = new Set(prev);
      ancestorIds(id, index.parents).forEach(a => next.add(a));
      return next;
    });
  }, [index]);

  const handleAddChild = useCallback((parentId) => {
    setExpanded(prev => new Set(prev).add(parentId));
    setAddingTo(parentId);
  }, []);

  const handleCommitAdd = useCallback((parentId, title) => {
    setData(prev => {
      const clone = deepClone(prev);
      const idx = indexTree(clone);
      const parent = idx.map.get(parentId);
      if (parent) {
        const newId = `${parentId}-new-${Date.now().toString(36).slice(-4)}`;
        const newNode = {
          id: newId,
          kind: kindForChild(parent.kind),
          title,
          subtitle: '',
          owner: { name: 'You', hue: 180 },
          status: 'planned',
          updated: 'just now',
          children: [],
        };
        parent.children = parent.children || [];
        parent.children.push(newNode);
        // select the new node shortly after
        setTimeout(() => setSelectedId(newId), 0);
      }
      return clone;
    });
    setAddingTo(null);
  }, []);

  const handleAssignOwner = useCallback((nodeId, person) => {
    setData(prev => {
      const clone = deepClone(prev);
      const idx = indexTree(clone);
      const n = idx.map.get(nodeId);
      if (n) {
        n.owner = { id: person.id, name: person.name, hue: person.hue };
        n.role = person.role;
      }
      return clone;
    });
  }, []);

  const expandAll = () => {
    const all = new Set();
    const walk = (n) => { all.add(n.id); (n.children||[]).forEach(walk); };
    walk(data);
    setExpanded(all);
  };
  const collapseAll = () => setExpanded(new Set(['root']));

  // Keyboard: / to focus search
  useEffect(() => {
    const h = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Tweak protocol
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setShowTweaks(true);
      if (e.data?.type === '__deactivate_edit_mode') setShowTweaks(false);
    };
    window.addEventListener('message', handler);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}
    return () => window.removeEventListener('message', handler);
  }, []);

  const setTweak = (k, v) => {
    setTweaks(prev => {
      const next = { ...prev, [k]: v };
      try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*'); } catch(_) {}
      return next;
    });
  };

  const mainClass = `main ${tweaks.panel === 'left' ? 'panel-left' : ''} ${tweaks.panel === 'hidden' ? 'panel-hidden' : ''}`;

  return (
    <div className="app" data-density={tweaks.density} data-connector={tweaks.connector}>
      {/* Title bar */}
      <div className="titlebar">
        <div className="title-dots"><i/><i/><i/></div>
        <div className="title-breadcrumb">
          helix<span className="slash">/</span>workspaces<span className="slash">/</span>
          <span className="here">helix-2026.tree</span>
        </div>
        <div className="title-right">
          <div className="chip">⌘K  Command</div>
          <div className="chip" style={{ color: 'var(--accent)', borderColor: 'var(--accent-dim)' }}>● Live</div>
        </div>
      </div>

      {/* Main split */}
      <div className={mainClass}>
        {tweaks.panel === 'left' && selectedNode && (
          <>
            <DetailPanel
              node={selectedNode}
              path={selectedPath}
              onPickChild={handleSelect}
              onAddChild={handleAddChild}
              onClose={() => setTweak('panel', 'hidden')}
            />
            <div className="divider" />
          </>
        )}

        <div className="tree-pane">
          {tweaks.layout === 'mindmap' ? (
            <MindmapView
              data={data}
              expanded={expanded}
              onToggle={handleToggle}
              selectedId={selectedId}
              onSelect={handleSelect}
              onAddChild={handleAddChild}
              onAssignOwner={handleAssignOwner}
            />
          ) : (<>
          <div className="tree-toolbar">
            <div className="search">
              <Icons.Search />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter nodes by title, subtitle, owner…"
              />
              {!query && <span className="kbd">/</span>}
              {query && (
                <button className="icon-btn" style={{ width: 18, height: 18 }} onClick={() => setQuery('')}>×</button>
              )}
            </div>
            <button className="icon-btn" onClick={expandAll} title="Expand all"><Icons.Expand /></button>
            <button className="icon-btn" onClick={collapseAll} title="Collapse all"><Icons.Collapse /></button>
            <button className="icon-btn primary" onClick={() => handleAddChild(selectedId || 'root')} title="Add child to selection">
              <Icons.Plus size={12} />
            </button>
          </div>

          <div className="tree-scroll">
            <TreeNode
              node={data}
              depth={0}
              isLast={true}
              expandedSet={expanded}
              onToggle={handleToggle}
              selectedId={selectedId}
              onSelect={handleSelect}
              onAddChild={handleAddChild}
              searchQuery={query}
              addingTo={addingTo}
              setAddingTo={setAddingTo}
              onCommitAdd={handleCommitAdd}
              parentPath={[]}
            />
          </div>
          </>)}
        </div>

        {tweaks.panel === 'right' && (
          <>
            <div className="divider" />
            <DetailPanel
              node={selectedNode}
              path={selectedPath}
              onPickChild={handleSelect}
              onAddChild={handleAddChild}
              onClose={() => setTweak('panel', 'hidden')}
            />
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="statusbar">
        <span><span className="dot"/>Synced · <span className="accent">4 collaborators</span></span>
        <span>· {countDescendants(data) + 1} nodes</span>
        <span>· depth 5</span>
        <div className="right">
          <span>UTF-8</span>
          <span>v2.6.0</span>
          <span>helix · main</span>
        </div>
      </div>

      {/* Tweaks */}
      {showTweaks && (
        <div className="tweaks-panel">
          <h3>Tweaks</h3>

          <div className="tweak-row">
            <label>Layout</label>
            <div className="seg-ctrl">
              {['tree','mindmap'].map(v => (
                <button key={v} className={tweaks.layout===v?'active':''} onClick={() => setTweak('layout', v)}>{v}</button>
              ))}
            </div>
          </div>

          <div className="tweak-row">
            <label>Density</label>
            <div className="seg-ctrl">
              {['compact','cozy','roomy'].map(v => (
                <button key={v} className={tweaks.density===v?'active':''} onClick={() => setTweak('density', v)}>{v}</button>
              ))}
            </div>
          </div>

          <div className="tweak-row">
            <label>Detail panel</label>
            <div className="seg-ctrl">
              {['left','right','hidden'].map(v => (
                <button key={v} className={tweaks.panel===v?'active':''} onClick={() => setTweak('panel', v)}>{v}</button>
              ))}
            </div>
          </div>

          <div className="tweak-row">
            <label>Connectors</label>
            <div className="seg-ctrl">
              {['none','guides','rails','elbows'].map(v => (
                <button key={v} className={tweaks.connector===v?'active':''} onClick={() => setTweak('connector', v)}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
