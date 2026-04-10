# CLAUDE.md — ee-simulator

東大工学部 **環境エネルギー工学コース（E&E コース）** の履修シミュレーター。
スマホ対応のモバイル Web アプリ。

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| リポジトリ | https://github.com/inokuchi-haruki410-ctrl/ee-simulator |
| 本番 URL | https://ee-simulator.vercel.app/ |
| デプロイ | Vercel（`main` へ push → 自動デプロイ） |

### 主な機能

- **ダッシュボード** — 卒論配属条件チェック・卒業要件進捗バー・取得単位サマリー
- **時間割** — 学期タブ（3年S1/S2/A1/A2・4年S1/S2）× 5日×6限グリッド。空きコマタップ→ボトムシートで科目追加
- **過去の履修** — 2年次以前・3年A1A2・4年科目を取得済みトグルで管理。他学部科目を自由入力
- **ToDo** — 履修タスク管理

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フレームワーク | Create React App（React 19） |
| 言語 | JavaScript（JSX） |
| スタイル | Plain CSS（CSS カスタムプロパティ） |
| 状態管理 | React Hooks（useState / useEffect / useMemo） |
| 永続化 | localStorage |
| ホスティング | Vercel |

外部ライブラリは **ゼロ**（React 本体のみ）。

---

## ファイル構成

```
ee-simulator/
├── public/
│   └── index.html          # タイトル・メタタグ（lang="ja"）
└── src/
    ├── data/
    │   └── courses.js      # 全科目データ・卒業要件・配属条件
    ├── App.js              # 全コンポーネント（単一ファイル構成）
    ├── App.css             # モバイル UI スタイル
    ├── index.css           # body リセット・日本語フォント指定
    └── index.js            # エントリポイント
```

---

## データ構造（`src/data/courses.js`）

### `CATEGORIES`
科目区分の定義（ラベル・カラー・背景色・枠色）。

```js
{
  required: { label: '必修◎',    color, bg, border },
  limited:  { label: '限定選択○', color, bg, border },
  standard: { label: '標準選択※', color, bg, border },
  free:     { label: '自由選択',  color, bg, border },
}
```

### `YEAR2_COURSES`
2年次以前の科目（過去の履修画面のみ。時間割には表示されない）。

```js
{ id, name, credits, category, year: 2 }
```

### `COURSES`
3・4年次科目（時間割 + 過去の履修画面で使用）。

```js
{
  id,
  name,
  credits,          // 単位数（小数可: 2.5 など）
  category,         // 'required' | 'limited' | 'standard' | 'free'
  term,             // 'A1' | 'A2' | 'A1A2' | '4S1' | '4S2'
  slot,             // { day: 0-4(月~金), period: 0-5(1~6限) } | null
}
```

- `term: 'A1A2'` の科目は A1・A2 両方のタブで選択候補に表示される
- `slot: null` の科目（卒業研究等）は時間割グリッドに追加不可

### `ALL_COURSES` / `ALL_COURSE_MAP`
YEAR2_COURSES + COURSES のマージ済みリスト・ID→科目のマップ。

### `GRAD_REQUIREMENTS`（配列）
```js
[
  { key: 'required', label: '必修◎',    min: 20 },
  { key: 'limited',  label: '限定選択○', min: 40 },
  { key: 'total',    label: '合計',      min: 90 },
]
```

### `THESIS_CONDITIONS`
```js
[
  { id, label, check: (enrolledIds, credits) => boolean }
]
```
現在の条件：
1. 合計単位 ≥ 50
2. 動機付けプロジェクト・基礎プロジェクトA・応用プロジェクトA を全取得

---

## 状態管理（`src/App.js`）

| state | localStorage キー | 型 | 説明 |
|-------|------------------|----|------|
| `timetable` | `ee-tt` | `{ S1:{}, S2:{}, A1:{}, A2:{}, '4S1':{}, '4S2':{} }` | 学期→`"day-period"`→courseId |
| `completed` | `ee-completed-v2` | `string[]` | 過去の履修として取得済みの courseId 一覧 |
| `customCourses` | `ee-custom` | `{id, name, credits, category}[]` | 手動入力した他学部科目 |
| `todos` | `ee-todos` | `{id, text, done}[]` | ToDo リスト |

### 派生値（useMemo）
- `ttEnrolledIds` — 時間割に登録済みの courseId の Set
- `enrolledIds` — `ttEnrolledIds` + `completed` の和集合（重複排除）
- `credits` — カテゴリ別単位数 + `customCourses` 加算 + `total`
- `thesisStatus` — 各配属条件の充足状況
- `availableCourses` — 現学期の未登録科目（学期データがない場合は全科目）

---

## 卒業要件・配属条件の変更方法

`src/data/courses.js` の末尾を編集するだけ。

```js
// 卒業要件の最低単位を変更
export const GRAD_REQUIREMENTS = [
  { key: 'required', label: '必修◎',    min: 20 },  // ← ここを変更
  { key: 'limited',  label: '限定選択○', min: 40 },
  { key: 'total',    label: '合計',      min: 90 },
];

// 配属条件を追加
export const THESIS_CONDITIONS = [
  ...
  {
    id: 'new_cond',
    label: '新しい条件',
    check: (ids, credits) => /* boolean */,
  },
];
```

---

## よく使うコマンド

```bash
# 作業ディレクトリ
cd /Users/kakachiken/Documents/CLAUDE/履修/ee-simulator

# 開発サーバー起動（http://localhost:3000）
export PATH="/usr/local/bin:$PATH"
npm start

# 本番ビルド（build/ フォルダに出力）
npm run build

# GitHub へ push（PAT 認証）
git add src/App.js src/App.css src/data/courses.js
git commit -m "コミットメッセージ"
git remote set-url origin https://inokuchi-haruki410-ctrl:<PAT>@github.com/inokuchi-haruki410-ctrl/ee-simulator.git
git push
git remote set-url origin https://github.com/inokuchi-haruki410-ctrl/ee-simulator.git
```

> **注意:** PAT（Personal Access Token）は使用後に GitHub で Revoke してください。

---

## UI 設計方針

- **モバイルファースト**（max-width: 430px）
- `env(safe-area-inset-*)` で iPhone のノッチ・ホームバー対応
- 外部 CSS ライブラリなし。CSS カスタムプロパティで一元管理
- ボトムシートは `animation: slideUp` でスライドイン
- 全データを localStorage に保存（オフライン動作可）

---

## 学期と科目の対応

| タブ | 表示される科目 |
|------|---------------|
| 3年S1 / S2 | 科目データなし → 全科目が追加候補 |
| 3年A1 | `term: 'A1'` + `term: 'A1A2'` |
| 3年A2 | `term: 'A2'` + `term: 'A1A2'` |
| 4年S1 | `term: '4S1'` |
| 4年S2 | `term: '4S2'` |
