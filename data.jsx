// Product development process — stages with owner + role
const TEAM = [
  { id: 'u-linh', name: 'Linh Tran', role: 'Product Manager', hue: 220 },
  { id: 'u-minh', name: 'Minh Pham', role: 'Engineering Lead', hue: 160 },
  { id: 'u-dao', name: 'Dao Nguyen', role: 'Senior Engineer', hue: 280 },
  { id: 'u-tam', name: 'Tam Ngo', role: 'Design Lead', hue: 100 },
  { id: 'u-khanh', name: 'Khanh Le', role: 'UX Researcher', hue: 340 },
  { id: 'u-an', name: 'An Bui', role: 'QA Engineer', hue: 200 },
  { id: 'u-hieu', name: 'Hieu Vo', role: 'Product Designer', hue: 30 },
  { id: 'u-quyen', name: 'Quyen Ha', role: 'Marketing Lead', hue: 10 },
];

const mk = (id, kind, title, subtitle, ownerId, status, children = []) => {
  const owner = ownerId ? TEAM.find(t => t.id === ownerId) : null;
  return { id, kind, title, subtitle, owner, role: owner?.role, status, updated: 'recent', children };
};

const ROADMAP_DATA = mk('root', 'workspace', 'Product Launch', 'End-to-end process', 'u-linh', 'active', [
  mk('s1', 'stage', 'Discovery', 'Understand problem & users', 'u-khanh', 'shipped', [
    mk('s1-1', 'task', 'User interviews', '12 sessions, 3 segments', 'u-khanh', 'shipped'),
    mk('s1-2', 'task', 'Market scan', 'Competitive landscape', 'u-linh', 'shipped'),
    mk('s1-3', 'task', 'Problem brief', 'Signed off by leads', null, 'shipped'),
  ]),
  mk('s2', 'stage', 'Define', 'Scope, success metrics, constraints', 'u-linh', 'active', [
    mk('s2-1', 'task', 'PRD v1', 'Goals, non-goals, metrics', 'u-linh', 'active'),
    mk('s2-2', 'task', 'Tech feasibility', 'Arch spike + risks', 'u-minh', 'active'),
    mk('s2-3', 'task', 'Success metrics', 'North-star + guardrails', null, 'planned'),
  ]),
  mk('s3', 'stage', 'Design', 'UX flows, visual, prototype', 'u-tam', 'active', [
    mk('s3-1', 'task', 'Wireframes', 'Low-fi flows', 'u-hieu', 'shipped'),
    mk('s3-2', 'task', 'High-fi mocks', 'Final visual system', 'u-tam', 'active'),
    mk('s3-3', 'task', 'Usability test', '5 users, unmoderated', 'u-khanh', 'planned'),
  ]),
  mk('s4', 'stage', 'Build', 'Implementation sprints', 'u-minh', 'planned', [
    mk('s4-1', 'task', 'Backend API', 'Endpoints + schema', 'u-dao', 'planned'),
    mk('s4-2', 'task', 'Frontend app', 'React + state', null, 'planned'),
    mk('s4-3', 'task', 'Infra & deploy', 'CI/CD + envs', 'u-minh', 'planned'),
  ]),
  mk('s5', 'stage', 'Validate', 'QA, staging, dogfood', 'u-an', 'planned', [
    mk('s5-1', 'task', 'QA test plan', 'Regression + e2e', 'u-an', 'planned'),
    mk('s5-2', 'task', 'Staging bake', '2 weeks internal', null, 'planned'),
    mk('s5-3', 'task', 'Load test', '10x expected peak', 'u-an', 'planned'),
  ]),
  mk('s6', 'stage', 'Launch', 'GTM, announce, monitor', 'u-quyen', 'planned', [
    mk('s6-1', 'task', 'Launch copy', 'Site + email + social', 'u-quyen', 'planned'),
    mk('s6-2', 'task', 'Rollout plan', '10% → 50% → 100%', 'u-linh', 'planned'),
    mk('s6-3', 'task', 'Post-launch review', '2-week retro', null, 'planned'),
  ]),
]);

window.ROADMAP_DATA = ROADMAP_DATA;
window.TEAM = TEAM;
