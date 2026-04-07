// ── カテゴリ定義 ─────────────────────────────────────────────────────────────
export const CATEGORIES = {
  required: { label: '必修◎',    color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  limited:  { label: '限定選択○', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  standard: { label: '標準選択※', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  free:     { label: '自由選択',  color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
};

// ── 2年次以前の科目（過去の履修画面のみ） ─────────────────────────────────
export const YEAR2_COURSES = [
  { id: 'y2_01', name: '動機付けプロジェクト',         credits: 2.5, category: 'required', year: 2 },
  { id: 'y2_02', name: '数理手法I',                   credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_03', name: '力学演習1A',                  credits: 1,   category: 'limited',  year: 2 },
  { id: 'y2_04', name: '力学演習2A',                  credits: 1,   category: 'limited',  year: 2 },
  { id: 'y2_05', name: '環境・エネルギー概論',         credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_06', name: '環境・エネルギー材料科学概論', credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_07', name: '地球科学',                    credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_08', name: '安全学基礎',                  credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_09', name: '材料力学1',                   credits: 1,   category: 'limited',  year: 2 },
  { id: 'y2_10', name: '材料力学2',                   credits: 1,   category: 'limited',  year: 2 },
  { id: 'y2_11', name: '流体力学1',                   credits: 1,   category: 'limited',  year: 2 },
  { id: 'y2_12', name: '流体力学2',                   credits: 1,   category: 'limited',  year: 2 },
  { id: 'y2_13', name: 'プログラミング基礎',           credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_14', name: 'システム創成学基礎',           credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_15', name: '社会システム工学基礎',         credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_16', name: '知識と知能',                  credits: 2,   category: 'limited',  year: 2 },
  { id: 'y2_17', name: '社会システムと産業',           credits: 2,   category: 'standard', year: 2 },
];

// ── 3年・4年の科目（時間割 + 過去の履修画面） ─────────────────────────────
// term: 'A1' | 'A2' | 'A1A2' | '4S1' | '4S2'
// slot: { day: 0-4(月~金), period: 0-5(1~6限) }  null = 通年/スロットなし
export const COURSES = [
  // ── 3年A1 限定選択○ ───────────────────────────────────────────────────────
  { id: 'a1_ef1',  name: '環境・エネルギー流体力学１',    credits: 1,   category: 'limited',  term: 'A1',   slot: { day:0, period:2 } },
  { id: 'a1_fex1', name: '流体力学演習A１',              credits: 1,   category: 'limited',  term: 'A1',   slot: { day:3, period:3 } },
  { id: 'a1_ec1',  name: '環境・エネルギーの化学１',      credits: 1,   category: 'limited',  term: 'A1',   slot: { day:1, period:2 } },
  { id: 'a1_ma3',  name: '数理演習３A',                  credits: 1,   category: 'limited',  term: 'A1',   slot: { day:4, period:4 } },
  { id: 'a1_envs', name: '環境システム論',                credits: 2,   category: 'limited',  term: 'A1',   slot: { day:1, period:3 } },
  // ── 3年A1A2 限定選択○ / 必修◎ ─────────────────────────────────────────
  { id: 'a12_em',  name: '電磁エネルギー基礎',           credits: 4,   category: 'limited',  term: 'A1A2', slot: { day:4, period:2 } },
  { id: 'a12_apj', name: '応用プロジェクトA',            credits: 2.5, category: 'required', term: 'A1A2', slot: { day:2, period:2 } },
  // ── 3年A2 限定選択○ ───────────────────────────────────────────────────────
  { id: 'a2_ef2',  name: '環境・エネルギー流体力学２',    credits: 1,   category: 'limited',  term: 'A2',   slot: { day:0, period:2 } },
  { id: 'a2_fex2', name: '流体力学演習A２',              credits: 1,   category: 'limited',  term: 'A2',   slot: { day:3, period:3 } },
  { id: 'a2_ec2',  name: '環境・エネルギーの化学２',      credits: 1,   category: 'limited',  term: 'A2',   slot: { day:1, period:2 } },
  { id: 'a2_fer',  name: '流体エネルギー資源の形成と開発',credits: 2,   category: 'limited',  term: 'A2',   slot: { day:1, period:3 } },
  // ── 3年A1A2 標準選択※ ──────────────────────────────────────────────────
  { id: 'a12_art', name: '人工物工学',                   credits: 2,   category: 'standard', term: 'A1A2', slot: { day:0, period:0 } },
  { id: 'a12_gps', name: '地球惑星システム工学',         credits: 2,   category: 'standard', term: 'A1A2', slot: { day:1, period:1 } },
  { id: 'a12_oce', name: '海洋開発工学',                 credits: 2,   category: 'standard', term: 'A1A2', slot: { day:3, period:2 } },
  { id: 'a12_fin', name: '近未来金融システムの創成',      credits: 2,   category: 'standard', term: 'A1A2', slot: { day:1, period:5 } },
  // ── 3年A1 標準選択※ ───────────────────────────────────────────────────────
  { id: 'a1_fus',  name: '核融合の科学',                 credits: 1,   category: 'standard', term: 'A1',   slot: { day:1, period:1 } },
  { id: 'a1_fem',  name: '有限要素法と構造解析',         credits: 1,   category: 'standard', term: 'A1',   slot: { day:3, period:1 } },
  { id: 'a1_heat', name: '伝熱・熱力学 Heat Transfer',   credits: 2,   category: 'standard', term: 'A1',   slot: { day:1, period:4 } },
  // ── 3年A2 標準選択※ ───────────────────────────────────────────────────────
  { id: 'a2_envh', name: '環境調和論',                   credits: 2,   category: 'standard', term: 'A2',   slot: { day:1, period:3 } },
  { id: 'a2_geo',  name: '地圏開発工学概論',             credits: 1,   category: 'standard', term: 'A2',   slot: { day:1, period:2 } },
  { id: 'a2_min',  name: 'マイニングエンジニアリング',    credits: 1,   category: 'standard', term: 'A2',   slot: { day:4, period:4 } },
  { id: 'a2_pro',  name: 'プロセシングエンジニアリング',  credits: 2,   category: 'standard', term: 'A2',   slot: { day:1, period:3 } },
  { id: 'a2_erp',  name: 'エネルギー・資源政策論',        credits: 1,   category: 'standard', term: 'A2',   slot: { day:0, period:4 } },
  // ── 4年S1 限定選択○ ───────────────────────────────────────────────────────
  { id: '4s1_ees', name: 'エネルギー・環境経済システム',  credits: 2,   category: 'limited',  term: '4S1',  slot: { day:1, period:1 } },
  { id: '4s1_aw',  name: 'アカデミック・ライティング',    credits: 1,   category: 'limited',  term: '4S1',  slot: { day:2, period:2 } },
  // ── 4年S1 標準選択※ ───────────────────────────────────────────────────────
  { id: '4s1_nre', name: 'Nuclear Reactor Engineering',  credits: 2,   category: 'standard', term: '4S1',  slot: { day:0, period:3 } },
  { id: '4s1_eba', name: 'エネルギービーム応用工学',      credits: 2,   category: 'standard', term: '4S1',  slot: { day:2, period:3 } },
  { id: '4s1_sub', name: '海中工学',                     credits: 2,   category: 'standard', term: '4S1',  slot: { day:3, period:1 } },
  { id: '4s1_ec1', name: '経済工学I',                    credits: 2,   category: 'standard', term: '4S1',  slot: { day:0, period:4 } },
  { id: '4s1_mth', name: '数理手法VII',                  credits: 2,   category: 'standard', term: '4S1',  slot: { day:2, period:4 } },
  // ── 4年S1 必修◎ ───────────────────────────────────────────────────────────
  { id: '4s1_lpj', name: '領域プロジェクト1A',           credits: 2.5, category: 'required', term: '4S1',  slot: { day:1, period:2 } },
  // ── 4年S2 標準選択※ ───────────────────────────────────────────────────────
  { id: '4s2_adv', name: 'Advanced Environment & Energy',credits: 2,   category: 'standard', term: '4S2',  slot: { day:0, period:2 } },
  { id: '4s2_ap',  name: 'アカデミック・プレゼンテーション', credits: 1, category: 'standard', term: '4S2', slot: { day:2, period:2 } },
  { id: '4s2_ec2', name: '経済工学II',                   credits: 2,   category: 'standard', term: '4S2',  slot: { day:0, period:0 } },
  { id: '4s2_ncs', name: '次世代サイバーインフラ論',      credits: 2,   category: 'standard', term: '4S2',  slot: { day:3, period:1 } },
  // ── 4年S2 必修◎ ───────────────────────────────────────────────────────────
  { id: '4s2_res', name: '環境・エネルギー卒業研究',      credits: 10,  category: 'required', term: '4S2',  slot: null },
];

// 全科目マップ（ID → course）
export const ALL_COURSES  = [...YEAR2_COURSES, ...COURSES];
export const ALL_COURSE_MAP = Object.fromEntries(ALL_COURSES.map(c => [c.id, c]));

// ── 卒業要件 ─────────────────────────────────────────────────────────────────
export const GRAD_REQUIREMENTS = {
  required: { label: '必修◎',    min: 18 },
  limited:  { label: '限定選択○', min: 14 },
  standard: { label: '標準選択※', min: 6  },
};

// ── 卒論配属条件 ─────────────────────────────────────────────────────────────
export const THESIS_CONDITIONS = [
  {
    id: 'motiv',
    label: '動機付けプロジェクトを取得',
    check: (ids) => ids.includes('y2_01'),
  },
  {
    id: 'appj',
    label: '応用プロジェクトAを取得',
    check: (ids) => ids.includes('a12_apj'),
  },
  {
    id: 'limited12',
    label: '限定選択○を 12 単位以上取得',
    check: (ids, credits) => (credits?.limited || 0) >= 12,
  },
];
