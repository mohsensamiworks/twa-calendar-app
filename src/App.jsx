import { useEffect, useMemo, useState } from "react";

const KEY = "calendar-events-v1";
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export default function App() {
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(toKey(today));
  const [events, setEvents] = useState(load);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(events));
    } catch {}
  }, [events]);

  // Days of the visible month, padded so the week starts on Monday
  const cells = useMemo(() => {
    const y = view.getFullYear();
    const m = view.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const count = new Date(y, m + 1, 0).getDate();
    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: count }, (_, i) => new Date(y, m, i + 1)),
    ];
  }, [view]);

  const shiftMonth = (n) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));

  const goToday = () => {
    setView(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(toKey(today));
  };

  const addEvent = () => {
    const t = text.trim();
    if (!t) return;
    setEvents((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] || []), { id: Date.now(), text: t }],
    }));
    setText("");
  };

  const removeEvent = (id) =>
    setEvents((prev) => {
      const next = { ...prev, [selected]: (prev[selected] || []).filter((e) => e.id !== id) };
      if (!next[selected].length) delete next[selected];
      return next;
    });

  const dayEvents = events[selected] || [];
  const selectedDate = new Date(selected + "T00:00:00");

  return (
    <div className="app">
      <header className="bar">
        <button aria-label="Previous month" onClick={() => shiftMonth(-1)}>‹</button>
        <h1>{view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h1>
        <button aria-label="Next month" onClick={() => shiftMonth(1)}>›</button>
      </header>

      <div className="grid weekdays">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid days">
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              className={
                "day" +
                (toKey(d) === toKey(today) ? " today" : "") +
                (toKey(d) === selected ? " selected" : "")
              }
              onClick={() => setSelected(toKey(d))}
            >
              {d.getDate()}
              {events[toKey(d)] && <i className="dot" />}
            </button>
          ) : (
            <span key={i} />
          )
        )}
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>
            {selectedDate.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
          <button className="link" onClick={goToday}>Today</button>
        </div>

        {dayEvents.length === 0 && <p className="empty">Nothing planned. Add a note below.</p>}

        <ul>
          {dayEvents.map((e) => (
            <li key={e.id}>
              <span>{e.text}</span>
              <button aria-label={`Delete ${e.text}`} onClick={() => removeEvent(e.id)}>×</button>
            </li>
          ))}
        </ul>

        <div className="add">
          <input
            value={text}
            placeholder="Add event"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEvent()}
          />
          <button onClick={addEvent}>Add</button>
        </div>
      </section>
    </div>
  );
}
