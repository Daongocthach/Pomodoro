import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  isPaused,
  restoreTimerOnLoad
} from "./timer.js";
import { renderSessionList } from "./session.js";

let pomodoro = document.getElementById("pomodoro-timer");
let short = document.getElementById("short-timer");
let long = document.getElementById("long-timer");
let currentTimer = pomodoro;
let todos = [];
let history = [];

const timerWrapper = document.querySelector(".timer-wrapper");
const toggleSessionBtn = document.getElementById("toggle-session");

toggleSessionBtn.addEventListener("click", () => {
  const isFlipped = timerWrapper.classList.toggle("flipped");
  toggleSessionBtn.textContent = isFlipped
    ? "Back to Timer"
    : "Session History";
});

const pauseBtn = document.getElementById("pause");
const buttons = document.querySelectorAll(".button-container .button");


function hideAll() {
  document
    .querySelectorAll(".timer-display")
    .forEach((timer) => (timer.style.display = "none"));
}

buttons.forEach((button) => {
  button.addEventListener("click", function () {
    buttons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");

    hideAll();
    if (this.id === "pomodoro-session") {
      pomodoro.style.display = "block";
      currentTimer = pomodoro;
    } else if (this.id === "short-break") {
      short.style.display = "block";
      currentTimer = short;
    } else if (this.id === "long-break") {
      long.style.display = "block";
      currentTimer = long;
    }
  });
});

document.getElementById("start").addEventListener("click", () => {
  if (currentTimer) {
    if (isPaused) {
      resumeTimer(currentTimer, pauseBtn);
    } else {
      startTimer(currentTimer);
      document.getElementById("timer-message").style.display = "none";
    }
  } else {
    document.getElementById("timer-message").style.display = "block";
  }
});

pauseBtn.addEventListener("click", () => {
  if (!isPaused) {
    pauseTimer(pauseBtn);
  } else {
    resumeTimer(currentTimer, pauseBtn);
  }
});

document.getElementById("stop").addEventListener("click", () => {
  stopTimer(currentTimer);
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const historyList = document.getElementById("history-list");
  const toggleBtn = document.getElementById("toggle-history");
  const clearBtn = document.getElementById("clear-history");
  const wrapper = document.querySelector(".todo-wrapper");

  const titleEl = document.getElementById("timer-title");
  const timerDisplays = document.querySelectorAll(".timer-display");

  const savedTitle = localStorage.getItem("timerTitle");
  if (savedTitle) titleEl.textContent = savedTitle;

  const savedDurations = JSON.parse(
    localStorage.getItem("timerDurations") || "{}"
  );
  timerDisplays.forEach((timer) => {
    const key = timer.dataset.key;
    if (savedDurations[key]) {
      timer.dataset.duration = savedDurations[key];
      timer.textContent = `${savedDurations[key]}:00`;
    }
  });

  titleEl.addEventListener("blur", () => {
    localStorage.setItem("timerTitle", titleEl.textContent.trim());
  });

  timerDisplays.forEach((timer) => {
    timer.addEventListener("blur", () => {
      const text = timer.textContent.trim();
      const key = timer.dataset.key;
      const minutes = parseInt(text.split(":")[0]);

      if (!isNaN(minutes) && minutes >= 0) {
        timer.dataset.duration = minutes;
        timer.textContent = `${minutes}:00`;

        const durations = JSON.parse(
          localStorage.getItem("timerDurations") || "{}"
        );
        durations[key] = minutes;
        localStorage.setItem("timerDurations", JSON.stringify(durations));
      } else {
        alert("Thời gian không hợp lệ!");
        timer.textContent = `${timer.dataset.duration}:00`;
      }
    });
  });

  try {
    const storedTodos = JSON.parse(localStorage.getItem("todos"));
    if (Array.isArray(storedTodos)) todos = storedTodos;

    const storedHistory = JSON.parse(localStorage.getItem("history"));
    if (Array.isArray(storedHistory)) history = storedHistory;
  } catch (e) {
    console.warn("Lỗi khi parse localStorage:", e);
    todos = [];
    history = [];
  }

  restoreTimerOnLoad();
  renderHistory();
  renderSessionList();
  updateEmptyMessage();
  todos.forEach((task) => renderTask(task.text, task.createdAt, false));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const createdAt = new Date().toISOString();
    renderTask(text, createdAt);
    input.value = "";
  });

  function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function renderTask(text, createdAt, save = true) {
    const li = document.createElement("li");

    const actionWrapper = document.createElement("div");
    actionWrapper.style.display = "flex";
    actionWrapper.style.gap = "10px";

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✅";
    doneBtn.classList.add("todo-remove");
    doneBtn.title = "Done";
    doneBtn.style.color = "#4caf50";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "✖";
    cancelBtn.classList.add("todo-remove");
    cancelBtn.title = "Remove";

    doneBtn.addEventListener("click", () => {
      const finishedAt = new Date().toISOString();
      history.unshift({ text, createdAt, finishedAt });
      saveHistory();
      li.remove();
      todos = todos.filter(
        (t) => !(t.text === text && t.createdAt === createdAt)
      );
      saveTodos();
      updateEmptyMessage();
    });

    cancelBtn.addEventListener("click", () => {
      li.remove();
      todos = todos.filter(
        (t) => !(t.text === text && t.createdAt === createdAt)
      );
      saveTodos();
      updateEmptyMessage();
    });

    actionWrapper.appendChild(doneBtn);
    actionWrapper.appendChild(cancelBtn);
    li.innerHTML = `<span>${text}</span>`;
    li.appendChild(actionWrapper);
    list.appendChild(li);

    if (save) {
      todos.push({ text, createdAt });
      saveTodos();
    }

    updateEmptyMessage();
  }

  function saveHistory() {
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = "";
    if (Array.isArray(history)) {
      history.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `✅ ${item.text}<br><small>Start: ${format(
          item.createdAt
        )} | End: ${format(item.finishedAt)}</small>`;
        historyList.appendChild(li);
      });
    }
  }

  function format(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  toggleBtn.addEventListener("click", () => {
    wrapper.classList.toggle("flipped");
    toggleBtn.textContent = wrapper.classList.contains("flipped")
      ? "Back to To Do List"
      : "View History";
  });

  function updateEmptyMessage() {
    const todoList = document.getElementById("todo-list");
    const todoMsg = document.getElementById("empty-message");
    const historyList = document.getElementById("history-list");
    const historyMsg = document.getElementById("empty-history");

    todoMsg.style.display = todoList.children.length === 0 ? "block" : "none";
    historyMsg.style.display =
      historyList.children.length === 0 ? "block" : "none";
  }

  clearBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn xoá toàn bộ lịch sử không?")) {
      history = [];
      localStorage.setItem("history", JSON.stringify(history));
      renderHistory();
      updateEmptyMessage();
    }
  });
});
