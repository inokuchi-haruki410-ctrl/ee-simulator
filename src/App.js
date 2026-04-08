import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import {
  CATEGORIES, COURSES, YEAR2_COURSES, ALL_COURSE_MAP,
  GRAD_REQUIREMENTS, THESIS_CONDITIONS,
} from './data/courses';

// ── 定数 ──────────────────────────────────────────────────────────────────────
const DAYS        = ['月', '火', '水', '木', '金'];
const PERIODS     = ['1限', '2限', '3限', '4限', '5限', '6限'];
const PERIOD_TIMES= ['8:30', '10:25', '13:00', '14:55', '16:50', '18:45'];

const TERMS = [
  { id: 'S1',  label: '3年S1' },
  { id: 'S2',  label: '3年S2' },
  { id: 'A1',  label: '3年A1' },
  { id: 'A2',  label: '3年A2' },
  { id: '4S1', label: '4年S1' },
  { id: '4S2', label: '4年S2' },
];

const YEAR3_COURSES = COURSES.filter(c => ['A1','A2','A1A2'].includes(c.term));
const YEAR4_COURSES = COURSES.filter(c => ['4S1','4S2'].includes(c.term));

function courseFitsTerm(course, term) {
  if (term === 'A1') return course.term === 'A1' || course.term === 'A1A2';
  if (term === 'A2') return course.term === 'A2' || course.term === 'A1A2';
  return course.term === term;
}

const EMPTY_TT = { S1:{}, S2:{}, A1:{}, A2:{}, '4S1':{}, '4S2':{} };

const INITIAL_TODOS = [
  { id: '1', text: 'シラバスを確認する',           done: false },
  { id: '2', text: '3年A1の履修登録を完了する',    done: false },
  { id: '3', text: '指導教員候補をリストアップする', done: false },
];

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,       setTab]       = useState('dashboard');
  const [timetable, setTimetable] = useState(
    () => JSON.parse(localStorage.getItem('ee-tt') || JSON.stringify(EMPTY_TT))
  );
  const [activeTerm,    setActiveTerm]    = useState('A1');
  const [completed,     setCompleted]     = useState(
    () => JSON.parse(localStorage.getItem('ee-completed-v2') || '[]')
  );
  const [customCourses, setCustomCourses] = useState(
    () => JSON.parse(localStorage.getItem('ee-custom') || '[]')
  );
  const [todos,    setTodos]    = useState(
    () => JSON.parse(localStorage.getItem('ee-todos') || JSON.stringify(INITIAL_TODOS))
  );
  const [sheet,     setSheet]     = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [search,    setSearch]    = useState('');
  const [todoText,  setTodoText]  = useState('');

  useEffect(() => { localStorage.setItem('ee-tt',           JSON.stringify(timetable));     }, [timetable]);
  useEffect(() => { localStorage.setItem('ee-completed-v2', JSON.stringify(completed));     }, [completed]);
  useEffect(() => { localStorage.setItem('ee-custom',       JSON.stringify(customCourses)); }, [customCourses]);
  useEffect(() => { localStorage.setItem('ee-todos',        JSON.stringify(todos));         }, [todos]);

  // 時間割に登録済みの ID セット
  const ttEnrolledIds = useMemo(
    () => new Set(Object.values(timetable).flatMap(sem => Object.values(sem))),
    [timetable]
  );

  // 全履修 ID（時間割 + completed）
  const enrolledIds = useMemo(
    () => [...new Set([...ttEnrolledIds, ...completed])],
    [ttEnrolledIds, completed]
  );

  // カテゴリ別単位数
  const credits = useMemo(() => {
    const c = { required: 0, limited: 0, standard: 0, free: 0 };
    enrolledIds.forEach(id => {
      const course = ALL_COURSE_MAP[id];
      if (course) c[course.category] = (c[course.category] || 0) + course.credits;
    });
    customCourses.forEach(cc => {
      c[cc.category] = (c[cc.category] || 0) + (parseFloat(cc.credits) || 0);
    });
    c.total = c.required + c.limited + c.standard + c.free;
    return c;
  }, [enrolledIds, customCourses]);

  // 卒論配属条件
  const thesisStatus   = useMemo(
    () => THESIS_CONDITIONS.map(cond => ({ ...cond, met: cond.check(enrolledIds, credits) })),
    [enrolledIds, credits]
  );
  const thesisEligible = thesisStatus.every(s => s.met);

  // 時間割セル取得
  const getCellCourse = (day, period) =>
    ALL_COURSE_MAP[timetable[activeTerm]?.[`${day}-${period}`]];

  // 科目追加
  const addCourse = (courseId) => {
    if (!sheet || sheet.type !== 'add') return;
    setTimetable(prev => ({
      ...prev,
      [activeTerm]: { ...prev[activeTerm], [`${sheet.day}-${sheet.period}`]: courseId },
    }));
    closeSheet();
  };

  // 科目削除
  const removeCourse = (day, period) => {
    setTimetable(prev => {
      const next = { ...prev, [activeTerm]: { ...prev[activeTerm] } };
      delete next[activeTerm][`${day}-${period}`];
      return next;
    });
    closeSheet();
  };

  const openAddSheet = (day, period) => {
    setSearch('');
    setCatFilter('all');
    setSheet({ type: 'add', day, period, term: activeTerm });
  };

  const closeSheet = () => {
    setSheet(null);
    setSearch('');
    setCatFilter('all');
  };

  // 追加可能科目（未登録 × 検索フィルタ。学期フィルタは参考表示のみ）
  const availableCourses = useMemo(() => {
    if (!sheet || sheet.type !== 'add') return [];
    const termCourses = COURSES.filter(c => c.slot && courseFitsTerm(c, sheet.term));
    // 現学期に対応する科目がなければ全科目を候補にする
    const pool = termCourses.length > 0 ? termCourses : COURSES.filter(c => c.slot);
    return pool.filter(c => {
      if (ttEnrolledIds.has(c.id)) return false;
      if (catFilter !== 'all' && c.category !== catFilter) return false;
      if (search && !c.name.includes(search)) return false;
      return true;
    });
  }, [sheet, ttEnrolledIds, catFilter, search]);

  // 履修済みトグル
  const toggleCompleted = (id) =>
    setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // カスタム科目
  const addCustom    = (course) => setCustomCourses(prev => [...prev, course]);
  const removeCustom = (id)     => setCustomCourses(prev => prev.filter(c => c.id !== id));

  // ToDo
  const addTodo    = (e) => {
    e.preventDefault();
    const text = todoText.trim();
    if (!text) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), text, done: false }]);
    setTodoText('');
  };
  const toggleTodo = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id) => setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-logo">⚡</span>
        <h1 className="app-title">
          {tab === 'dashboard' && 'ダッシュボード'}
          {tab === 'timetable' && '時間割'}
          {tab === 'history'   && '過去の履修'}
          {tab === 'todo'      && 'ToDo'}
        </h1>
      </header>

      <main className="app-main">
        {tab === 'dashboard' && (
          <Dashboard
            credits={credits}
            thesisStatus={thesisStatus}
            thesisEligible={thesisEligible}
            enrolledIds={enrolledIds}
            ttEnrolledIds={ttEnrolledIds}
            customCourses={customCourses}
          />
        )}
        {tab === 'timetable' && (
          <TimetableView
            activeTerm={activeTerm}
            setActiveTerm={setActiveTerm}
            getCellCourse={getCellCourse}
            onCellClick={(day, period) => {
              const course = getCellCourse(day, period);
              course
                ? setSheet({ type: 'detail', day, period, course })
                : openAddSheet(day, period);
            }}
          />
        )}
        {tab === 'history' && (
          <HistoryView
            completed={completed}
            ttEnrolledIds={ttEnrolledIds}
            onToggle={toggleCompleted}
            customCourses={customCourses}
            onAddCustom={addCustom}
            onRemoveCustom={removeCustom}
          />
        )}
        {tab === 'todo' && (
          <TodoView
            todos={todos}
            todoText={todoText}
            setTodoText={setTodoText}
            addTodo={addTodo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} />

      {sheet && (
        <div className="sheet-backdrop" onClick={closeSheet}>
          <div className="sheet-container" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            {sheet.type === 'add' && (
              <AddCourseSheet
                day={sheet.day}
                period={sheet.period}
                term={sheet.term}
                courses={availableCourses}
                catFilter={catFilter}
                setCatFilter={setCatFilter}
                search={search}
                setSearch={setSearch}
                onAdd={addCourse}
                onClose={closeSheet}
              />
            )}
            {sheet.type === 'detail' && (
              <CourseDetailSheet
                course={sheet.course}
                day={sheet.day}
                period={sheet.period}
                term={activeTerm}
                onRemove={() => removeCourse(sheet.day, sheet.period)}
                onClose={closeSheet}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function Dashboard({ credits, thesisStatus, thesisEligible, enrolledIds, ttEnrolledIds, customCourses }) {
  return (
    <div className="tab-content">
      {/* 卒論配属バナー */}
      <div className={`thesis-banner ${thesisEligible ? 'eligible' : 'not-eligible'}`}>
        <div className={`thesis-icon-circle ${thesisEligible ? 'ok' : 'ng'}`}>
          {thesisEligible ? '✓' : '!'}
        </div>
        <div>
          <div className="thesis-title">卒論配属</div>
          <div className="thesis-sub">
            {thesisEligible ? '条件をすべて満たしています' : '未達成の条件があります'}
          </div>
        </div>
      </div>

      {/* 卒論配属条件 */}
      <Card title="卒論配属条件">
        {thesisStatus.map(cond => (
          <div key={cond.id} className="cond-row">
            <span className={`cond-mark ${cond.met ? 'met' : 'unmet'}`}>{cond.met ? '✓' : '✗'}</span>
            <span className="cond-label">{cond.label}</span>
          </div>
        ))}
      </Card>

      {/* 卒業要件 */}
      <Card title="卒業要件">
        {GRAD_REQUIREMENTS.map(req => {
          const cur   = credits[req.key] || 0;
          const pct   = Math.min(100, (cur / req.min) * 100);
          const met   = cur >= req.min;
          const color = CATEGORIES[req.key]?.color || '#2563eb';
          return (
            <div key={req.key} className="credit-row">
              <div className="credit-row-top">
                <span className="credit-cat" style={{ color }}>{req.label}</span>
                <span className={`credit-count ${met ? 'met' : ''}`}>
                  {cur % 1 === 0 ? cur : cur.toFixed(1)} / {req.min} 単位{met && ' ✓'}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"
                  style={{ width: `${pct}%`, backgroundColor: met ? color : '#9ca3af' }} />
              </div>
            </div>
          );
        })}
      </Card>

      {/* 履修科目一覧 */}
      {(enrolledIds.length > 0 || customCourses.length > 0) ? (
        <Card title={`取得済み・登録科目 (${enrolledIds.length + customCourses.length} 科目)`}>
          {enrolledIds.map(id => {
            const c   = ALL_COURSE_MAP[id];
            if (!c) return null;
            const cat = CATEGORIES[c.category];
            return (
              <div key={id} className="enrolled-item">
                <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
                  {cat.label}
                </span>
                <span className="enrolled-name">{c.name}</span>
                {!ttEnrolledIds.has(id) && <span className="completed-tag">履修済</span>}
                <span className="enrolled-credits">{c.credits}単位</span>
              </div>
            );
          })}
          {customCourses.map(cc => {
            const cat = CATEGORIES[cc.category] || CATEGORIES.free;
            return (
              <div key={cc.id} className="enrolled-item">
                <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
                  {cat.label}
                </span>
                <span className="enrolled-name">{cc.name}</span>
                <span className="other-tag">他学部</span>
                <span className="enrolled-credits">{cc.credits}単位</span>
              </div>
            );
          })}
        </Card>
      ) : (
        <div className="empty-hint">
          <div className="empty-icon">📅</div>
          <p>「時間割」や「過去の履修」タブで科目を追加してください</p>
        </div>
      )}
    </div>
  );
}

// ── TimetableView ──────────────────────────────────────────────────────────────
function TimetableView({ activeTerm, setActiveTerm, getCellCourse, onCellClick }) {
  return (
    <div>
      {/* 学期タブ */}
      <div className="term-tabs">
        {TERMS.map(t => (
          <button
            key={t.id}
            className={`term-tab ${activeTerm === t.id ? 'active' : ''}`}
            onClick={() => setActiveTerm(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="timetable-wrap">
        <div className="timetable-grid">
          <div className="g-corner" />
          {DAYS.map(d => <div key={d} className="g-day-hd">{d}</div>)}
          {PERIODS.map((_, pi) => (
            <React.Fragment key={pi}>
              <div className="g-period-hd">
                <span className="period-num">{pi + 1}</span>
                <span className="period-time">{PERIOD_TIMES[pi]}</span>
              </div>
              {DAYS.map((_, di) => {
                const course = getCellCourse(di, pi);
                const cat    = course ? CATEGORIES[course.category] : null;
                return (
                  <div
                    key={di}
                    className={`g-cell ${course ? 'filled' : 'empty'}`}
                    style={cat ? { background: cat.bg, borderColor: cat.border } : {}}
                    onClick={() => onCellClick(di, pi)}
                  >
                    {course
                      ? <span className="cell-name" style={{ color: cat.color }}>{course.name}</span>
                      : <span className="cell-plus">＋</span>
                    }
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <p className="timetable-hint">空きコマをタップして科目を追加 / 科目タップで削除</p>
      </div>
    </div>
  );
}

// ── HistoryView ────────────────────────────────────────────────────────────────
function HistoryView({ completed, ttEnrolledIds, onToggle, customCourses, onAddCustom, onRemoveCustom }) {
  const [yearSection,  setYearSection]  = useState('y2');
  const [customForm,   setCustomForm]   = useState({ name: '', credits: '2', category: 'limited' });

  const courseListToShow = yearSection === 'y2' ? YEAR2_COURSES
    : yearSection === 'y3' ? YEAR3_COURSES
    : YEAR4_COURSES;

  const handleAddCustom = (e) => {
    e.preventDefault();
    const name = customForm.name.trim();
    if (!name) return;
    onAddCustom({
      id:       `custom-${Date.now()}`,
      name,
      credits:  parseFloat(customForm.credits) || 0,
      category: customForm.category,
    });
    setCustomForm({ name: '', credits: '2', category: 'limited' });
  };

  return (
    <div className="tab-content">
      {/* 過去の履修済み科目 */}
      <Card title="過去の履修済み科目">
        <div className="year-tabs">
          {[['y2','2年次以前'], ['y3','3年A1A2'], ['y4','4年']].map(([id, label]) => (
            <button
              key={id}
              className={`year-tab ${yearSection === id ? 'active' : ''}`}
              onClick={() => setYearSection(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="past-list">
          {courseListToShow.map(c => {
            const cat    = CATEGORIES[c.category];
            const onTT   = ttEnrolledIds.has(c.id);
            const isDone = completed.includes(c.id);
            return (
              <div key={c.id} className="past-item">
                <div className="past-item-left">
                  <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
                    {cat.label}
                  </span>
                  <span className="past-item-name">{c.name}</span>
                  <span className="past-item-cr">{c.credits}単位</span>
                </div>
                <div className="past-item-right">
                  {onTT ? (
                    <span className="on-tt-tag">時間割</span>
                  ) : (
                    <button
                      className={`comp-toggle ${isDone ? 'done' : ''}`}
                      onClick={() => onToggle(c.id)}
                    >
                      {isDone ? '✓ 取得済' : '未取得'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 他学部・その他科目 */}
      <Card title="他学部・その他科目を追加">
        <form className="custom-form" onSubmit={handleAddCustom}>
          <input
            className="custom-name-input"
            type="text"
            placeholder="科目名を入力..."
            value={customForm.name}
            onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
          />
          <div className="custom-row">
            <input
              className="custom-credits-input"
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={customForm.credits}
              onChange={e => setCustomForm(f => ({ ...f, credits: e.target.value }))}
            />
            <span className="custom-unit">単位</span>
            <select
              className="custom-select"
              value={customForm.category}
              onChange={e => setCustomForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="limited">限定選択○</option>
              <option value="standard">標準選択※</option>
              <option value="free">自由選択</option>
            </select>
            <button type="submit" className="custom-add-btn">追加</button>
          </div>
        </form>

        {customCourses.length > 0 ? (
          <div className="custom-list">
            {customCourses.map(cc => {
              const cat = CATEGORIES[cc.category] || CATEGORIES.free;
              return (
                <div key={cc.id} className="custom-item">
                  <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
                    {cat.label}
                  </span>
                  <span className="custom-item-name">{cc.name}</span>
                  <span className="custom-item-cr">{cc.credits}単位</span>
                  <button className="custom-del-btn" onClick={() => onRemoveCustom(cc.id)}>×</button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="custom-empty">他学部や自由選択の科目を手動で追加できます</p>
        )}
      </Card>
    </div>
  );
}

// ── AddCourseSheet ─────────────────────────────────────────────────────────────
function AddCourseSheet({ day, period, term, courses, catFilter, setCatFilter, search, setSearch, onAdd }) {
  const termLabel = TERMS.find(t => t.id === term)?.label || term;
  return (
    <>
      <div className="sheet-header">
        <h2 className="sheet-title">{DAYS[day]}曜 {period + 1}限 に科目を追加</h2>
        <p className="sheet-sub">{termLabel}</p>
      </div>

      <div className="sheet-search-wrap">
        <input
          className="sheet-search"
          type="search"
          placeholder="科目名で検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className="cat-chips">
        {[['all','全て','#6b7280'], ...Object.entries(CATEGORIES).map(([k,v]) => [k,v.label,v.color])].map(([key,label,color]) => (
          <button
            key={key}
            className={`cat-chip ${catFilter === key ? 'active' : ''}`}
            style={catFilter === key ? { background: color, color:'#fff', borderColor: color } : {}}
            onClick={() => setCatFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="sheet-list">
        {courses.length === 0 ? (
          <div className="sheet-empty">追加できる科目がありません</div>
        ) : (
          courses.map(c => {
            const cat = CATEGORIES[c.category];
            return (
              <button key={c.id} className="sheet-course-btn" onClick={() => onAdd(c.id)}>
                <div className="sheet-course-left">
                  <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
                    {cat.label}
                  </span>
                  <span className="sheet-course-name">{c.name}</span>
                </div>
                <span className="sheet-course-cr">{c.credits}単位</span>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

// ── CourseDetailSheet ──────────────────────────────────────────────────────────
function CourseDetailSheet({ course, day, period, term, onRemove, onClose }) {
  const cat       = CATEGORIES[course.category];
  const termLabel = TERMS.find(t => t.id === term)?.label || term;
  return (
    <>
      <div className="sheet-header">
        <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
          {cat.label}
        </span>
        <h2 className="sheet-title" style={{ marginTop: 8 }}>{course.name}</h2>
        <p className="sheet-sub">{DAYS[day]}曜 {period + 1}限 · {course.credits}単位 · {termLabel}</p>
      </div>
      <div className="sheet-actions">
        <button className="btn-danger" onClick={onRemove}>時間割から削除</button>
        <button className="btn-ghost"  onClick={onClose}>キャンセル</button>
      </div>
    </>
  );
}

// ── TodoView ───────────────────────────────────────────────────────────────────
function TodoView({ todos, todoText, setTodoText, addTodo, toggleTodo, deleteTodo }) {
  const pending = todos.filter(t => !t.done);
  const done    = todos.filter(t =>  t.done);
  return (
    <div className="tab-content">
      <form className="todo-form" onSubmit={addTodo}>
        <input
          className="todo-input"
          type="text"
          placeholder="新しいタスクを追加..."
          value={todoText}
          onChange={e => setTodoText(e.target.value)}
        />
        <button type="submit" className="todo-add-btn">追加</button>
      </form>
      {pending.length > 0 && (
        <section className="todo-section">
          <h3 className="todo-sec-title">未完了 ({pending.length})</h3>
          {pending.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />)}
        </section>
      )}
      {done.length > 0 && (
        <section className="todo-section">
          <h3 className="todo-sec-title">完了 ({done.length})</h3>
          {done.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />)}
        </section>
      )}
      {todos.length === 0 && (
        <div className="empty-hint">
          <div className="empty-icon">✅</div>
          <p>タスクはありません</p>
        </div>
      )}
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`todo-item ${todo.done ? 'done' : ''}`}>
      <button className="todo-check-btn" onClick={() => onToggle(todo.id)} aria-label="完了切替">
        <div className={`check-circle ${todo.done ? 'checked' : ''}`}>
          {todo.done && <span className="check-mark">✓</span>}
        </div>
      </button>
      <span className="todo-text">{todo.text}</span>
      <button className="todo-del-btn" onClick={() => onDelete(todo.id)} aria-label="削除">×</button>
    </div>
  );
}

// ── BottomNav ──────────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }) {
  return (
    <nav className="bottom-nav">
      {[
        { id: 'dashboard', label: 'ダッシュボード', icon: <IconDashboard /> },
        { id: 'timetable', label: '時間割',         icon: <IconCalendar />  },
        { id: 'history',   label: '過去の履修',      icon: <IconHistory />   },
        { id: 'todo',      label: 'ToDo',           icon: <IconTodo />      },
      ].map(({ id, label, icon }) => (
        <button key={id} className={`nav-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h2 className="card-title">{title}</h2>}
      {children}
    </div>
  );
}

// ── SVG アイコン ────────────────────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.89 3 3.01 3.9 3.01 5L3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    </svg>
  );
}
function IconHistory() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7a6.99 6.99 0 0 1-4.89-1.99L6.7 18.42A8.96 8.96 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  );
}
function IconTodo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}
