/* Right-hand detail panel for a selected node */

const DetailPanel = ({ node, path, onPickChild, onAddChild, onClose }) => {
  if (!node) {
    return (
      <div className="detail">
        <div className="detail-empty">
          <div className="big"><Icons.Empty /></div>
          <div>Select a node to inspect</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
            ↑↓ navigate   ·   → expand   ·   ⏎ select
          </div>
        </div>
      </div>
    );
  }

  const direct = node.children?.length || 0;
  const totalDesc = countDescendants(node);
  const shippedCount = (function count(n){
    let c = 0; if (n.status === 'shipped') c = 1;
    (n.children || []).forEach(ch => c += count(ch));
    return c;
  })(node);
  const allCount = (function count(n){
    let c = 1;
    (n.children || []).forEach(ch => c += count(ch));
    return c;
  })(node);
  const pct = Math.round((shippedCount / Math.max(allCount, 1)) * 100);

  const kindLabel = {
    workspace: 'Workspace', quarter: 'Quarter', initiative: 'Initiative',
    epic: 'Epic', story: 'Story',
  }[node.kind] || node.kind;

  return (
    <div className="detail">
      <div className="detail-header">
        <div className="detail-path">
          {path.slice(0, -1).map((p, i) => (
            <React.Fragment key={p.id}>
              <span className="seg">{p.title.split('·')[0].trim()}</span>
              <span className="sep">/</span>
            </React.Fragment>
          ))}
          <span className="seg here" style={{ color: 'var(--fg-0)' }}>{node.title}</span>
        </div>

        <div className="detail-kind-badge" data-k={node.kind}>
          <KindIcon kind={node.kind} />
          <span>{kindLabel}</span>
        </div>

        <h2 className="detail-title">{node.title}</h2>
        {node.subtitle && <p className="detail-subtitle">{node.subtitle}</p>}

        <div className="detail-actions">
          <button className="btn primary" onClick={() => onAddChild(node.id)}>
            <Icons.Plus size={11} /> Add child
          </button>
          <button className="btn"><Icons.Link /> Copy link</button>
          <button className="btn" style={{ marginLeft: 'auto' }} onClick={onClose}>
            <Icons.More />
          </button>
        </div>
      </div>

      <div className="detail-body">
        <dl className="field-grid">
          <dt>Owner</dt>
          <dd>
            {node.owner && <>
              <Avatar owner={node.owner} size={20} />
              <span>{node.owner.name}</span>
            </>}
            {!node.owner && <span style={{ color: 'var(--fg-3)' }}>—</span>}
          </dd>

          <dt>Status</dt>
          <dd>
            <span className="status">
              <span className={`status-dot ${node.status || 'planned'}`} />
              <span style={{ textTransform: 'capitalize' }}>{(node.status || 'planned').replace('-', ' ')}</span>
            </span>
          </dd>

          <dt>Updated</dt>
          <dd style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-1)' }}>
            {node.updated}
          </dd>

          <dt>Path</dt>
          <dd style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg-2)' }}>
            /{path.map(p => p.id).join('/')}
          </dd>

          {direct > 0 && <>
            <dt>Rollup</dt>
            <dd style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0, width: '100%' }}>
              <div className="progress-wrap">
                <div className="bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="progress-nums">
                <span>{shippedCount} of {allCount} shipped</span>
                <span>{pct}%</span>
              </div>
            </dd>
          </>}
        </dl>

        {direct > 0 && <>
          <div className="section-title">Children · {direct}</div>
          <div className="children-list">
            {node.children.map(c => {
              const cDirect = c.children?.length || 0;
              return (
                <div key={c.id} className="child-link" onClick={() => onPickChild(c.id)}>
                  <KindIcon kind={c.kind} />
                  <span>{c.title}</span>
                  <span className={`status-dot ${c.status || 'planned'}`} />
                  <Avatar owner={c.owner} size={16} />
                  {cDirect > 0 && <div className="count-pill">{cDirect}</div>}
                </div>
              );
            })}
          </div>
        </>}

        {direct === 0 && (
          <>
            <div className="section-title">Descendants</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
              Leaf node · no children yet. Use <span style={{ color: 'var(--accent)' }}>Add child</span> to expand.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

window.DetailPanel = DetailPanel;
