/* Mindmap — horizontal L→R tree with draggable nodes, owner picker */

const { useState: mmUseState, useMemo: mmUseMemo, useRef: mmUseRef, useEffect: mmUseEffect } = React;

const branchHue = (rootIdx, depth) => {
  const hues = [10, 38, 130, 215, 280, 340];
  return hues[(rootIdx + depth) % hues.length];
};

function layoutMindmap(root, expanded, cx, cy, overrides) {
  const nodes = [];
  const edges = [];
  const COL_X = [0, 340, 660, 960, 1240, 1480];
  const ROW_H = 110;

  const visibleLeafCount = (n) => {
    if (!expanded.has(n.id) || !n.children?.length) return 1;
    return n.children.reduce((s, c) => s + visibleLeafCount(c), 0);
  };

  const totalLeaves = visibleLeafCount(root);
  const totalH = totalLeaves * ROW_H;
  const topY = cy - totalH / 2;

  const place = (n, yStart, yEnd, depth, parentPos, rootBranchIdx) => {
    const midY = (yStart + yEnd) / 2;
    let x = cx - 400 + (COL_X[Math.min(depth, COL_X.length - 1)]);
    let y = midY;

    const ov = overrides[n.id];
    if (ov) { x = ov.x; y = ov.y; }

    const pos = { x, y };
    const hue = depth === 0 ? null : branchHue(rootBranchIdx, depth - 1);
    nodes.push({ node: n, x, y, depth, hue, rootBranchIdx });
    if (parentPos) edges.push({ from: parentPos, to: pos, depth, hue, rootBranchIdx });

    if (expanded.has(n.id) && n.children?.length) {
      const total = n.children.reduce((s, c) => s + visibleLeafCount(c), 0);
      let cursor = yStart;
      n.children.forEach((child, i) => {
        const share = visibleLeafCount(child) / total;
        const childSpan = (yEnd - yStart) * share;
        const nextBranchIdx = depth === 0 ? i : rootBranchIdx;
        place(child, cursor, cursor + childSpan, depth + 1, pos, nextBranchIdx);
        cursor += childSpan;
      });
    }
  };

  place(root, topY, topY + totalH, 0, null, 0);
  return { nodes, edges };
}

// Owner picker popup
const OwnerPicker = ({ onPick, onClose, style }) => {
  const team = window.TEAM || [];
  return (
    <div className="mm-picker" style={style} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div className="mm-picker-head">Assign owner</div>
      {team.map(p => (
        <button key={p.id} className="mm-picker-row" onClick={() => onPick(p)}>
          <div className="avatar" style={{ background: `oklch(0.78 0.14 ${p.hue})`, width: 22, height: 22, fontSize: 10 }}>
            {p.name.split(' ').map(s => s[0]).slice(0,2).join('')}
          </div>
          <div className="mm-picker-info">
            <div className="mm-picker-name">{p.name}</div>
            <div className="mm-picker-role">{p.role}</div>
          </div>
        </button>
      ))}
      <button className="mm-picker-close" onClick={onClose}>Cancel</button>
    </div>
  );
};

const MindmapView = ({
  data, expanded, onToggle, selectedId, onSelect, onAssignOwner,
}) => {
  const containerRef = mmUseRef(null);
  const [view, setView] = mmUseState({ zoom: 0.65, tx: 0, ty: 0 });
  const [pan, setPan] = mmUseState(null);
  const [positions, setPositions] = mmUseState({}); // id -> {x,y} overrides
  const [nodeDrag, setNodeDrag] = mmUseState(null); // {id, startX, startY, origX, origY, moved}
  const [pickerFor, setPickerFor] = mmUseState(null); // node id

  const CANVAS = 2400;
  const CX = CANVAS / 2, CY = CANVAS / 2;

  const { nodes, edges } = mmUseMemo(
    () => layoutMindmap(data, expanded, CX, CY, positions),
    [data, expanded, positions]
  );

  mmUseEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const z = 0.65;
    setView({ zoom: z, tx: r.width / 2 - CX * z, ty: r.height / 2 - CY * z });
  }, []);

  const onMouseDown = (e) => {
    if (e.target.closest('.mm-node') || e.target.closest('.mm-picker')) return;
    setPan({ x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty });
    setPickerFor(null);
  };
  const onMouseMove = (e) => {
    if (nodeDrag) {
      const dx = (e.clientX - nodeDrag.startX) / view.zoom;
      const dy = (e.clientY - nodeDrag.startY) / view.zoom;
      setPositions(prev => ({
        ...prev,
        [nodeDrag.id]: { x: nodeDrag.origX + dx, y: nodeDrag.origY + dy },
      }));
      if (!nodeDrag.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        setNodeDrag(d => ({ ...d, moved: true }));
      }
      return;
    }
    if (pan) {
      setView(v => ({ ...v, tx: pan.tx + (e.clientX - pan.x), ty: pan.ty + (e.clientY - pan.y) }));
    }
  };
  const onMouseUp = () => {
    setPan(null);
    setNodeDrag(null);
  };

  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setView(v => {
      const newZoom = Math.max(0.25, Math.min(1.6, v.zoom * factor));
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const nx = mx - (mx - v.tx) * (newZoom / v.zoom);
      const ny = my - (my - v.ty) * (newZoom / v.zoom);
      return { zoom: newZoom, tx: nx, ty: ny };
    });
  };

  const edgePath = (e) => {
    const { from, to } = e;
    const dx = to.x - from.x;
    const c1x = from.x + dx * 0.55;
    const c1y = from.y;
    const c2x = to.x - dx * 0.55;
    const c2y = to.y;
    return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
  };

  const resetView = () => {
    const el = containerRef.current;
    const r = el.getBoundingClientRect();
    const z = 0.65;
    setView({ zoom: z, tx: r.width / 2 - CX * z, ty: r.height / 2 - CY * z });
  };

  const clearPositions = () => setPositions({});

  const startNodeDrag = (e, n, x, y) => {
    e.stopPropagation();
    setNodeDrag({ id: n.id, startX: e.clientX, startY: e.clientY, origX: x, origY: y, moved: false });
  };

  return (
    <div className="mm-wrap"
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      style={{ cursor: pan ? 'grabbing' : (nodeDrag ? 'grabbing' : 'grab') }}
    >
      <div
        className="mm-canvas"
        style={{
          width: CANVAS, height: CANVAS,
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <svg width={CANVAS} height={CANVAS} className="mm-svg">
          <defs>
            {Array.from({ length: 6 }).map((_, i) => (
              <linearGradient id={`grad-${i}`} key={i} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={`oklch(0.72 0.16 ${[10,38,130,215,280,340][i]})`} stopOpacity="0.3" />
                <stop offset="100%" stopColor={`oklch(0.72 0.16 ${[10,38,130,215,280,340][i]})`} stopOpacity="1" />
              </linearGradient>
            ))}
          </defs>
          {edges.map((e, i) => {
            const colorIdx = e.rootBranchIdx % 6;
            const w = Math.max(1.2, 8 - e.depth * 1.6);
            return (
              <path
                key={i}
                d={edgePath(e)}
                fill="none"
                stroke={`url(#grad-${colorIdx})`}
                strokeWidth={w}
                strokeLinecap="round"
                opacity={0.9}
              />
            );
          })}
        </svg>

        {nodes.map(({ node, x, y, depth, hue, rootBranchIdx }) => {
          const isRoot = depth === 0;
          const isSel = selectedId === node.id;
          const hasChildren = node.children?.length > 0;
          const isOpen = expanded.has(node.id);
          const bg = isRoot ? '#171b20'
            : hue != null ? `oklch(0.72 0.16 ${hue})` : '#2a3038';
          const fg = isRoot ? '#e6edf3' : '#0d0d0d';
          const hasOwner = !!node.owner;

          return (
            <div
              key={node.id}
              className={`mm-node ${isSel ? 'sel' : ''} ${isRoot ? 'root' : ''} ${!hasOwner && !isRoot ? 'no-owner' : ''}`}
              data-done={!isRoot ? (node.status === 'shipped' ? 'true' : 'false') : undefined}
              style={{
                left: x, top: y,
                background: bg,
                color: fg,
                borderColor: isSel ? '#7ee2d0' : 'transparent',
              }}
              onMouseDown={(e) => startNodeDrag(e, node, x, y)}
              onClick={(e) => {
                e.stopPropagation();
                if (nodeDrag?.moved) return;
                onSelect(node.id);
              }}
              onDoubleClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
            >
              {!isRoot && node.status && (
                <div className={`mm-status-badge mm-status-${node.status}`}>
                  {node.status === 'shipped' ? '✓ Done' :
                   node.status === 'active' ? '◐ In progress' :
                   node.status === 'at-risk' ? '! At risk' :
                   '○ Not done'}
                </div>
              )}
              <div className="mm-node-inner">
                <div className="mm-title">{node.title}</div>
                {node.subtitle && !isRoot && (
                  <div className="mm-sub" style={{ color: isRoot ? '#b8c0cc' : 'rgba(0,0,0,0.6)' }}>
                    {node.subtitle}
                  </div>
                )}
                {!isRoot && (
                  <div className="mm-owner">
                    {hasOwner ? (
                      <>
                        <div className="avatar" style={{ background: `oklch(0.78 0.14 ${node.owner.hue})`, width: 20, height: 20, fontSize: 9, color: '#0b0d10' }}>
                          {node.owner.name.split(' ').map(s => s[0]).slice(0,2).join('')}
                        </div>
                        <div className="mm-owner-info">
                          <div className="mm-owner-name">{node.owner.name}</div>
                          <div className="mm-owner-role">{node.role || 'Contributor'}</div>
                        </div>
                      </>
                    ) : (
                      <button
                        className="mm-assign"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setPickerFor(node.id); }}
                      >
                        + Assign owner
                      </button>
                    )}
                  </div>
                )}
              </div>
              {hasChildren && (
                <button
                  className="mm-toggle"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                  title={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? '−' : node.children.length}
                </button>
              )}

              {pickerFor === node.id && (
                <OwnerPicker
                  style={{ left: '100%', top: 0, marginLeft: 10 }}
                  onPick={(p) => { onAssignOwner(node.id, p); setPickerFor(null); }}
                  onClose={() => setPickerFor(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mm-controls">
        <button className="mm-btn" onClick={() => setView(v => ({ ...v, zoom: Math.min(1.6, v.zoom * 1.15) }))}>+</button>
        <button className="mm-btn" onClick={() => setView(v => ({ ...v, zoom: Math.max(0.25, v.zoom * 0.87) }))}>−</button>
        <button className="mm-btn" onClick={resetView} title="Reset view">⤢</button>
        <div className="mm-zoom">{Math.round(view.zoom * 100)}%</div>
        <div style={{ width: 1, height: 20, background: '#232a33', margin: '0 4px' }}></div>
        <button className="mm-btn" onClick={clearPositions} title="Reset node positions" style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}>Auto-arrange</button>
      </div>
      <div className="mm-hint">drag node to move · drag canvas to pan · scroll to zoom · click node to select</div>

      <ProgressFooter data={data} />
    </div>
  );
};

// Walks full tree (excluding root) and tallies status
const walkStats = (root) => {
  let done = 0, active = 0, notDone = 0, atRisk = 0, total = 0;
  const walk = (n, isRoot) => {
    if (!isRoot) {
      total += 1;
      if (n.status === 'shipped') done += 1;
      else if (n.status === 'active') active += 1;
      else if (n.status === 'at-risk') atRisk += 1;
      else notDone += 1;
    }
    (n.children || []).forEach(c => walk(c, false));
  };
  walk(root, true);
  return { done, active, notDone, atRisk, total };
};

const ProgressFooter = ({ data }) => {
  const { done, active, notDone, atRisk, total } = walkStats(data);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mm-progress">
      <div className="mm-progress-head">
        <div className="mm-progress-title">Tiến độ quy trình</div>
        <div className="mm-progress-pct">{pct}%</div>
      </div>
      <div className="mm-progress-bar">
        <div className="mm-progress-seg shipped" style={{ width: `${(done/total)*100}%` }} />
        <div className="mm-progress-seg active" style={{ width: `${(active/total)*100}%` }} />
        <div className="mm-progress-seg at-risk" style={{ width: `${(atRisk/total)*100}%` }} />
        <div className="mm-progress-seg planned" style={{ width: `${(notDone/total)*100}%` }} />
      </div>
      <div className="mm-progress-stats">
        <div className="mm-stat"><span className="dot shipped"/><b>{done}</b> hoàn thành</div>
        <div className="mm-stat"><span className="dot active"/><b>{active}</b> đang làm</div>
        {atRisk > 0 && <div className="mm-stat"><span className="dot at-risk"/><b>{atRisk}</b> rủi ro</div>}
        <div className="mm-stat"><span className="dot planned"/><b>{notDone}</b> chưa làm</div>
        <div className="mm-stat muted">/ <b>{total}</b> tổng cộng</div>
      </div>
    </div>
  );
};

window.MindmapView = MindmapView;
