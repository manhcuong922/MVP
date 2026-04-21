// Picture frame manufacturing and sales demo data
const TEAM = [
  { id: 'u-linh', name: 'Linh Tran', role: 'Giam doc van hanh', hue: 220 },
  { id: 'u-minh', name: 'Minh Pham', role: 'Truong xuong san xuat', hue: 160 },
  { id: 'u-dao', name: 'Dao Nguyen', role: 'Ky thuat san xuat', hue: 280 },
  { id: 'u-tam', name: 'Tam Ngo', role: 'Thiet ke mau', hue: 100 },
  { id: 'u-khanh', name: 'Khanh Le', role: 'Thu mua vat tu', hue: 340 },
  { id: 'u-an', name: 'An Bui', role: 'Quan ly chat luong', hue: 200 },
  { id: 'u-hieu', name: 'Hieu Vo', role: 'Kho van', hue: 30 },
  { id: 'u-quyen', name: 'Quyen Ha', role: 'Sales Marketing', hue: 10 },
];

const mk = (id, kind, title, subtitle, ownerId, status, children = []) => {
  const owner = ownerId ? TEAM.find((t) => t.id === ownerId) : null;
  return { id, kind, title, subtitle, owner, role: owner?.role, status, updated: 'recent', children };
};

const ROADMAP_DATA = mk(
  'root',
  'workspace',
  'Khung Tranh Anh R',
  'Van hanh san xuat va kinh doanh khung tranh',
  'u-linh',
  'active',
  [
    mk('s1', 'stage', 'Nguon cung vat tu', 'Go, nhom, mica, phu kien dau vao', 'u-khanh', 'shipped', [
      mk('s1-1', 'task', 'Chon nha cung cap go', 'Chot 3 nha cung cap on dinh', 'u-khanh', 'shipped'),
      mk('s1-2', 'task', 'Bao gia nhom va mica', 'Cap nhat gia theo tung quy cach', 'u-linh', 'shipped'),
      mk('s1-3', 'task', 'Kiem tra ton dau ky', 'Doi chieu kho vat tu va muc an toan', null, 'shipped'),
    ]),
    mk('s2', 'stage', 'Thiet ke danh muc mau', 'Kich thuoc, mau sac, bo suu tap', 'u-tam', 'active', [
      mk('s2-1', 'task', 'Danh muc kich thuoc chuan', 'A4, A3, 30x40, 40x60, 50x70', 'u-tam', 'active'),
      mk('s2-2', 'task', 'Mau khung ban chay', 'Go tu nhien, den nham, vang dong', 'u-quyen', 'active'),
      mk('s2-3', 'task', 'Combo khung tranh treo tuong', 'De xuat bo 3 va bo 5 san pham', null, 'planned'),
    ]),
    mk('s3', 'stage', 'San xuat khung', 'Cat, ghep, son phu, lap rap', 'u-minh', 'active', [
      mk('s3-1', 'task', 'Cat thanh khung theo quy cach', 'Toi uu hao hut vat tu', 'u-dao', 'shipped'),
      mk('s3-2', 'task', 'Son phu va say be mat', 'Dam bao mau dong deu theo lo', 'u-minh', 'active'),
      mk('s3-3', 'task', 'Lap rap va dong goi so bo', 'Gan mat mica, day treo, phu kien', 'u-hieu', 'planned'),
    ]),
    mk('s4', 'stage', 'Kiem soat chat luong', 'Do vuong goc, be mat, phu kien', 'u-an', 'planned', [
      mk('s4-1', 'task', 'Checklist QC dau chuyen', 'Kiem tra vuong goc va vet xuoc', 'u-an', 'planned'),
      mk('s4-2', 'task', 'Xu ly loi be mat', 'Phan loai san pham sua duoc va loai bo', null, 'planned'),
      mk('s4-3', 'task', 'Tem lot dat chuan', 'Danh dau theo ca san xuat va ma lo', 'u-an', 'planned'),
    ]),
    mk('s5', 'stage', 'Ban hang va marketing', 'Kenh online, dai ly, don dat hang', 'u-quyen', 'planned', [
      mk('s5-1', 'task', 'Bang gia le va gia si', 'Tach theo chat lieu va kich thuoc', 'u-quyen', 'planned'),
      mk('s5-2', 'task', 'Anh san pham va noi dung gian hang', 'Dang san tren Facebook, Shopee, website', null, 'planned'),
      mk('s5-3', 'task', 'Chuong trinh khuyen mai', 'Combo khai truong va uu dai dai ly', 'u-quyen', 'planned'),
    ]),
    mk('s6', 'stage', 'Giao hang va cham soc khach', 'Dong goi, van chuyen, bao hanh', 'u-hieu', 'planned', [
      mk('s6-1', 'task', 'Quy cach dong goi an toan', 'Bo goc xop, mang co, thung carton 5 lop', 'u-hieu', 'planned'),
      mk('s6-2', 'task', 'Theo doi giao hang', 'Cap nhat trang thai giao theo tung don', 'u-linh', 'planned'),
      mk('s6-3', 'task', 'Xu ly doi tra bao hanh', 'Quy trinh tiep nhan va phan hoi trong 24h', null, 'planned'),
    ]),
  ]
);

window.ROADMAP_DATA = ROADMAP_DATA;
window.TEAM = TEAM;
