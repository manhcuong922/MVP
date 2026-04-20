/* Icons + small visual atoms */

const Icons = {
  Chevron: () => (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 16 16" width={p.size||10} height={p.size||10} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5"/>
      <path d="M10.5 10.5L13 13" strokeLinecap="round"/>
    </svg>
  ),
  Sort: () => (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 5h8M5 8h6M7 11h2" strokeLinecap="round"/>
    </svg>
  ),
  Expand: () => (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 4l2 2 3-3M3 10l2 2 3-3M10 5h3M10 11h3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Collapse: () => (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 4l-2 2M5 12l-2-2M10 5h3M10 11h3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  More: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
      <circle cx="4" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12" cy="8" r="1.2"/>
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M7 9a2.5 2.5 0 003.5 0l2-2a2.5 2.5 0 00-3.5-3.5l-1 1" strokeLinecap="round"/>
      <path d="M9 7a2.5 2.5 0 00-3.5 0l-2 2a2.5 2.5 0 003.5 3.5l1-1" strokeLinecap="round"/>
    </svg>
  ),
  Empty: () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M5 7h4l2 2h8v9H5z" strokeLinejoin="round"/>
    </svg>
  ),
};

/* Kind icons — small glyphs, one per node kind */
const KindIcon = ({ kind }) => {
  const base = { width: 16, height: 16, fill: 'none', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'workspace':
      return (
        <svg viewBox="0 0 16 16" {...base} stroke="#e58f95">
          <rect x="2.5" y="3.5" width="11" height="9" rx="1.5"/>
          <path d="M5.5 6.5h5M5.5 9.5h3"/>
        </svg>
      );
    case 'quarter':
      return (
        <svg viewBox="0 0 16 16" {...base} stroke="#b28df0">
          <circle cx="8" cy="8" r="5"/>
          <path d="M8 8L8 3M8 8l4 2.5"/>
        </svg>
      );
    case 'initiative':
      return (
        <svg viewBox="0 0 16 16" {...base} stroke="#8cb4f0">
          <path d="M3 13l2.5-2.5M5.5 10.5L10 6l3 3-4.5 4.5zM10 6l2-2 1 1-2 2"/>
        </svg>
      );
    case 'epic':
      return (
        <svg viewBox="0 0 16 16" {...base} stroke="#f0c674">
          <path d="M8 2.5l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.7l-3.6 1.9.7-4L2.2 6.8l4-.6z"/>
        </svg>
      );
    case 'story':
      return (
        <svg viewBox="0 0 16 16" {...base} stroke="#8fd18a">
          <rect x="3" y="3" width="10" height="10" rx="1.5"/>
          <path d="M6 8l1.5 1.5L10 7"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" {...base} stroke="#7a8597">
          <circle cx="8" cy="8" r="2"/>
        </svg>
      );
  }
};

/* Avatar — derived from name initial + hue */
const Avatar = ({ owner, size = 18 }) => {
  if (!owner) return null;
  const initials = owner.name.split(' ').map(s => s[0]).slice(0, 2).join('');
  const bg = `oklch(0.78 0.14 ${owner.hue})`;
  return (
    <div
      className="avatar"
      title={owner.name}
      style={{ width: size, height: size, background: bg, fontSize: Math.round(size * 0.5) }}
    >
      {initials}
    </div>
  );
};

const countDescendants = (node) => {
  if (!node.children?.length) return 0;
  return node.children.length + node.children.reduce((acc, c) => acc + countDescendants(c), 0);
};

Object.assign(window, { Icons, KindIcon, Avatar, countDescendants });
