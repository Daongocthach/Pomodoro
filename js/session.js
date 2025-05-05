export function renderSessionList() {
  const sessionList = document.getElementById("session-list");
  const sessions = JSON.parse(localStorage.getItem("pomodoroSessions") || "[]");

  sessionList.innerHTML = "";

  if (sessions.length === 0) {
    document.getElementById("empty-session-history").style.display = "block";
    return;
  }

  document.getElementById("empty-session-history").style.display = "none";

  sessions.forEach((session) => {
    const li = document.createElement("li");
    li.innerHTML = `✅ ${session.label}<br><small>Duration: ${session.duration} | ${session.timestamp}</small>`;
    sessionList.appendChild(li);
  });
}

export function saveSession(duration, label) {
  const sessions = JSON.parse(localStorage.getItem("pomodoroSessions") || "[]");
  const newSession = {
    id: Date.now(),
    label,
    duration,
    timestamp: new Date().toLocaleString(),
  };
  sessions.unshift(newSession);
  localStorage.setItem("pomodoroSessions", JSON.stringify(sessions));
  renderSessionList();
}
