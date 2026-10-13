import { useEffect, useState } from "react";

// Telegram injects window.Telegram.WebApp via the script tag in index.html:
// <script src="https://telegram.org/js/telegram-web-app.js"></script>
const tg = window.Telegram?.WebApp;

export default function App() {
  const [count, setCount] = useState(0);
  const user = tg?.initDataUnsafe?.user;

  useEffect(() => {
    if (!tg) return;
    tg.ready();   // tell Telegram the app has loaded
    tg.expand();  // use the full height of the sheet
  }, []);

  // Show Telegram's native main button once there is something to send
  useEffect(() => {
    if (!tg) return;
    const send = () => tg.sendData(JSON.stringify({ count }));
    tg.MainButton.setText(`Send count (${count})`);
    tg.MainButton.onClick(send);
    count > 0 ? tg.MainButton.show() : tg.MainButton.hide();
    return () => tg.MainButton.offClick(send);
  }, [count]);

  const tap = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    setCount((c) => c + 1);
  };

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>
        {user ? `Hi, ${user.first_name}` : "Hello"}
      </h1>
      {!tg && (
        <p style={styles.hint}>
          Open this app from Telegram to see your profile and native buttons.
        </p>
      )}

      <p style={styles.count}>{count}</p>
      <button style={styles.button} onClick={tap}>
        Tap
      </button>
    </main>
  );
}

// Colors come from Telegram's theme variables so the app matches
// the user's light/dark mode automatically.
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    fontFamily: "system-ui, sans-serif",
    background: "var(--tg-theme-bg-color, #ffffff)",
    color: "var(--tg-theme-text-color, #000000)",
  },
  title: { margin: 0, fontSize: 24 },
  hint: { margin: 0, color: "var(--tg-theme-hint-color, #888)", textAlign: "center" },
  count: { margin: 0, fontSize: 72, fontWeight: 700 },
  button: {
    padding: "12px 40px",
    fontSize: 18,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    background: "var(--tg-theme-button-color, #2481cc)",
    color: "var(--tg-theme-button-text-color, #ffffff)",
  },
};
