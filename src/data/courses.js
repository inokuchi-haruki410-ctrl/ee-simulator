export const CATEGORIES = {
  required:   { label: '必修',      color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  elective_a: { label: '選択必修A', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  elective_b: { label: '選択必修B', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  free:       { label: '自由選択',  color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
};

export const COURSES = [
  // ── 必修 (合計 29 単位) ───────────────────────────────────────────
  { id: 'em1',    name: '電磁気学第一',           credits: 2, category: 'required',   year: 3 },
  { id: 'em2',    name: '電磁気学第二',           credits: 2, category: 'required',   year: 3 },
  { id: 'ec1',    name: '電気回路論',             credits: 2, category: 'required',   year: 3 },
  { id: 'el1',    name: '電子回路論',             credits: 2, category: 'required',   year: 3 },
  { id: 'qm1',    name: '量子力学第一',           credits: 2, category: 'required',   year: 3 },
  { id: 'sp1',    name: '信号処理',               credits: 2, category: 'required',   year: 3 },
  { id: 'ex1',    name: '電気電子実験第一',       credits: 3, category: 'required',   year: 3 },
  { id: 'ex2',    name: '電気電子実験第二',       credits: 3, category: 'required',   year: 3 },
  { id: 'ex3',    name: '電気電子実験第三',       credits: 3, category: 'required',   year: 4 },
  { id: 'thesis', name: '卒業論文',               credits: 8, category: 'required',   year: 4 },

  // ── 選択必修A ────────────────────────────────────────────────────
  { id: 'qm2',    name: '量子力学第二',           credits: 2, category: 'elective_a', year: 3 },
  { id: 'ss1',    name: '固体電子工学',           credits: 2, category: 'elective_a', year: 3 },
  { id: 'sd1',    name: '半導体デバイス工学',     credits: 2, category: 'elective_a', year: 3 },
  { id: 'oe1',    name: '光エレクトロニクス',     credits: 2, category: 'elective_a', year: 3 },
  { id: 'mw1',    name: '超高周波回路',           credits: 2, category: 'elective_a', year: 4 },
  { id: 'it1',    name: '情報理論',               credits: 2, category: 'elective_a', year: 3 },
  { id: 'sc1',    name: 'システム制御',           credits: 2, category: 'elective_a', year: 3 },
  { id: 'ew1',    name: '電磁波工学',             credits: 2, category: 'elective_a', year: 4 },
  { id: 'ne1',    name: 'ナノエレクトロニクス',   credits: 2, category: 'elective_a', year: 4 },
  { id: 'pe1',    name: 'プラズマ工学',           credits: 2, category: 'elective_a', year: 4 },

  // ── 選択必修B ────────────────────────────────────────────────────
  { id: 'pa1',    name: 'プログラミング応用',     credits: 2, category: 'elective_b', year: 3 },
  { id: 'me1',    name: '電子計測工学',           credits: 2, category: 'elective_b', year: 3 },
  { id: 'ps1',    name: '電力システム工学',       credits: 2, category: 'elective_b', year: 3 },
  { id: 'pw1',    name: 'パワーエレクトロニクス', credits: 2, category: 'elective_b', year: 3 },
  { id: 'co1',    name: '通信工学',               credits: 2, category: 'elective_b', year: 3 },
  { id: 'cd1',    name: '制御システム設計',       credits: 2, category: 'elective_b', year: 4 },

  // ── 自由選択 ─────────────────────────────────────────────────────
  { id: 'ma1',    name: '数理工学',               credits: 2, category: 'free', year: 3 },
  { id: 'ca1',    name: 'コンピュータアーキテクチャ', credits: 2, category: 'free', year: 3 },
  { id: 'ro1',    name: 'ロボット工学',           credits: 2, category: 'free', year: 4 },
  { id: 'ip1',    name: '画像処理工学',           credits: 2, category: 'free', year: 4 },
  { id: 'ml1',    name: '機械学習基礎',           credits: 2, category: 'free', year: 4 },
  { id: 'be1',    name: 'バイオエレクトロニクス', credits: 2, category: 'free', year: 4 },
  { id: 'ee2',    name: '環境エネルギー工学',     credits: 2, category: 'free', year: 4 },
  { id: 'am1',    name: '先端材料工学',           credits: 2, category: 'free', year: 3 },
];

// 卒業要件（各カテゴリの最低単位数）
export const GRAD_REQUIREMENTS = {
  required:   { label: '必修',      min: 29 },
  elective_a: { label: '選択必修A', min: 8  },
  elective_b: { label: '選択必修B', min: 6  },
  free:       { label: '自由選択',  min: 10 },
};

// 卒論配属条件
export const THESIS_CONDITIONS = [
  {
    id: 'exp12',
    label: '電気電子実験第一・第二を取得',
    check: (ids) => ['ex1', 'ex2'].every(id => ids.includes(id)),
  },
  {
    id: 'core_req',
    label: '必修コア6科目（電磁気・電気回路・電子回路・量子・信号処理）を取得',
    check: (ids) => ['em1', 'em2', 'ec1', 'el1', 'qm1', 'sp1'].every(id => ids.includes(id)),
  },
  {
    id: 'elect_a4',
    label: '選択必修A を 4 単位以上取得',
    check: (ids) => {
      const sum = COURSES
        .filter(c => c.category === 'elective_a' && ids.includes(c.id))
        .reduce((s, c) => s + c.credits, 0);
      return sum >= 4;
    },
  },
];
