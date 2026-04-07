import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { CATEGORIES, COURSES, GRAD_REQUIREMENTS, THESIS_CONDITIONS } from './data/courses';

// ── 定数 ───────────────────────────────────────────────────────────────────────
const DAYS = ['月', '火', '水', '木', '金'];
const PERIODS = ['1限', '2限', '3限', '4限', '5限', '6限'];
const PERIOD_TIMES = ['8:30', '10:25', '13:00', '14:55', '16:50', '18:45'];

const INITIAL_TODOS = [
  { id: '1', text: 'シラバスを確認する', done: false },
  { id: '2', text: '前期履修登録を完了する', done: false },
  { id: '3', text: '指導教員候補をリストアップする', done: false },
  { id: '4', text: 'GPA を UTAS で確認する', done: false },
];

const COURSE_MAP = Object.fromEntries(COURSES.map(c => [c.id, c]));

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [timetable, setTimetable] = useState(
    () => JSON.parse(localStorage.getItem('ee-timetable') || '{}')
  );
  const [todos, setTodos] = useState(
    () => JSON.parse(localStorage.getItem('ee-todos') || JSON.stringify(INITIAL_TODOS))
  );
  const [sheet, setSheet]         = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch]       = useState('');
  const [todoText, setTodoText]   = useState('');

  useEffect(() => { localStorage.setItem('ee-timetable', JSON.stringify(timetable)); }, [timetable]);
  useEffect(() => { localStorage.setItem('ee-todos',     JSON.stringify(todos));     }, [todos]);

  const enrolledIds = useMemo(() => [...new Set(Object.values(timetable))], [timetable]);

  const credits = useMemo(() => {
    const c = { required: 0, elective_a: 0, elective_b: 0, free: 0 };
    enrolledIds.forEach(id => {
      const course = COURSE_MAP[id];
      if (course) c[course.category] += course.credits;
    });
    c.total = c.required + c.elective_a + c.elective_b + c.free;
    return c;
  }, [enrolledIds]);

  const thesisStatus = useMemo(
    () => THESIS_CONDITIONS.map(cond => ({ ...cond, met: cond.check(enrolledIds) })),
    [enrolledIds]
  );
  const thesisEligible = thesisStatus.every(s => s.met);

  const getCellCourse = (day, period) => COURSE_MAP[timetable[`${day}-${period}`]];

  const addCourse = (courseId) => {
    if (!sheet || sheet.type !== 'add') return;
    setTimetable(prev => ({ ...prev, [`${sheet.day}-${sheet.period}`]: courseId }));
    closeSheet();
  };

  const removeCourse = (day, period) => {
    setTimetable(prev => {
      const next = { ...prev };
      delete next[`${day}-${period}`];
      return next;
    });
    closeSheet();
  };

  const openAddSheet = (day, period) => {
    setSearch('');
    setCatFilter('all');
    setSheet({ type: 'add', day, period });
  };

  const closeSheet = () => {
    setSheet(null);
    setSearch('');
    setCatFilter('all');
  };

  const availableCourses = useMemo(() => {
    const usedIds = new Set(Object.values(timetable));
    return COURSES.filter(c => {
      if (usedIds.has(c.id)) return false;
      if (catFilter !== 'all' && c.category !== catFilter) return false;
      if (search && !c.name.includes(search)) return false;
      return true;
    });
  }, [timetable, catFilter, search]);

  const addTodo = (e) => {
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
          />
        )}
        {tab === 'timetable' && (
          <TimetableView
            getCellCourse={getCellCourse}
            onCellClick={(day, period) => {
              const course = getCellCourse(day, period);
              course
                ? setSheet({ type: 'detail', day, period, course })
                : openAddSheet(day, period);
            }}
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
            {sheet.type === 'add' ? (
              <AddCourseSheet
                day={sheet.day}
                period={sheet.period}
                courses={availableCourses}
                catFilter={catFilter}
                setCatFilter={setCatFilter}
                search={search}
                setSearch={setSearch}
                onAdd={addCourse}
                onClose={closeSheet}
              />
            ) : (
              <CourseDetailSheet
                course={sheet.course}
                day={sheet.day}
                period={sheet.period}
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
function Dashboard({ credits, thesisStatus, thesisEligible, enrolledIds }) {
  return (
    <div className="tab-content">
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

      <Card title="卒論配属条件">
        {thesisStatus.map(cond => (
          <div key={cond.id} className="cond-row">
            <span className={`cond-mark ${cond.met ? 'met' : 'unmet'}`}>
              {cond.met ? '✓' : '✗'}
            </span>
            <span className="cond-label">{cond.label}</span>
          </div>
        ))}
      </Card>

      <Card title="卒業要件">
        {Object.entries(GRAD_REQUIREMENTS).map(([key, req]) => {
          const cur = credits[key] || 0;
          const pct = Math.min(100, (cur / req.min) * 100);
          const met = cur >= req.min;
          const cat = CATEGORIES[key];
          return (
            <div key={key} className="credit-row">
              <div className="credit-row-top">
                <span className="credit-cat" style={{ color: cat.color }}>{req.label}</span>
                <span className={`credit-count ${met ? 'met' : ''}`}>
                  {cur} / {req.min} 単位{met && ' ✓'}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, backgroundColor: met ? cat.color : '#9ca3af' }}
                />
              </div>
            </div>
          );
        })}
        <div className="credit-total-row">
          <span>合計取得単位</span>
          <span className="credit-total-num">{credits.total}<small> 単位</small></span>
        </div>
      </Card>

      {enrolledIds.length > 0 ? (
        <Card title={`履修科目 (${enrolledIds.length} 科目)`}>
          {enrolledIds.map(id => {
            const c = COURSE_MAP[id];
            if (!c) return null;
            const cat = CATEGORIES[c.category];
            return (
              <div key={id} className="enrolled-item">
                <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
                  {cat.label}
                </span>
                <span className="enrolled-name">{c.name}</span>
                <span className="enrolled-credits">{c.credits}単位</span>
              </div>
            );
          })}
        </Card>
      ) : (
        <div className="empty-hint">
          <div className="empty-icon">📅</div>
          <p>「時間割」タブで科目を追加してください</p>
        </div>
      )}
    </div>
  );
}

// ── TimetableView ──────────────────────────────────────────────────────────────
function TimetableView({ getCellCourse, onCellClick }) {
  return (
    <div className="timetable-wrap">
      <div className="timetable-grid">
        <div className="g-corner" />
        {DAYS.map(d => (
          <div key={d} className="g-day-hd">{d}</div>
        ))}
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
      <p className="timetable-hint">空きコマをタップして科目を追加 / 科目をタップで削除</p>
    </div>
  );
}

// ── AddCourseSheet ─────────────────────────────────────────────────────────────
function AddCourseSheet({ day, period, courses, catFilter, setCatFilter, search, setSearch, onAdd }) {
  return (
    <>
      <div className="sheet-header">
        <h2 className="sheet-title">{DAYS[day]}曜 {period + 1}限 に科目を追加</h2>
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
        {[['all', '全て', '#6b7280'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label, v.color])].map(([key, label, color]) => (
          <button
            key={key}
            className={`cat-chip ${catFilter === key ? 'active' : ''}`}
            style={catFilter === key ? { background: color, color: '#fff', borderColor: color } : {}}
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
function CourseDetailSheet({ course, day, period, onRemove, onClose }) {
  const cat = CATEGORIES[course.category];
  return (
    <>
      <div className="sheet-header">
        <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
          {cat.label}
        </span>
        <h2 className="sheet-title" style={{ marginTop: 8 }}>{course.name}</h2>
        <p className="sheet-sub">{DAYS[day]}曜 {period + 1}限 · {course.credits} 単位 · {course.year} 年次</p>
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

// ── Icons ──────────────────────────────────────────────────────────────────────
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
function IconTodo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}
