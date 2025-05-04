let pomodoro = document.getElementById("pomodoro-timer");
let short = document.getElementById("short-timer");
let long = document.getElementById("long-timer");
let currentTimer = pomodoro;
let myInterval = null;
let isPaused = false;
let pauseTimeRemaining = 0;
let todos = [];
let history = [];
const pauseBtn = document.getElementById("pause");

function hideAll() {
    document.querySelectorAll(".timer-display").forEach(timer => timer.style.display = "none");
}

const buttons = document.querySelectorAll(".button-container .button");

buttons.forEach(button => {
    button.addEventListener("click", function () {
        buttons.forEach(btn => btn.classList.remove("active"));

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


function startTimer(timerDisplay, resume = false) {
    if (myInterval) clearInterval(myInterval);
    let durationInMs;

    if (resume && pauseTimeRemaining) {
        durationInMs = pauseTimeRemaining;
    } else {
        const duration = parseFloat(timerDisplay.getAttribute("data-duration"));
        durationInMs = duration * 60 * 1000;
    }

    const endTimestamp = Date.now() + durationInMs;

    myInterval = setInterval(() => {
        const timeLeft = endTimestamp - Date.now();
        pauseTimeRemaining = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(myInterval);
            new Audio("/assets/audio.mp3").play()
            timerDisplay.textContent = "00:00";
        } else {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    }, 1000);
}

document.getElementById("start").addEventListener("click", () => {
    if (currentTimer) {
        isPaused = false;
        startTimer(currentTimer);
        document.getElementById("timer-message").style.display = "none";
    } else {
        document.getElementById("timer-message").style.display = "block";
    }
});


pauseBtn.addEventListener("click", () => {
    if (myInterval && !isPaused) {
        clearInterval(myInterval);
        isPaused = true;

        pauseBtn.textContent = "Resume";
        pauseBtn.classList.add("paused");
    } else if (isPaused && currentTimer) {
        isPaused = false;
        startTimer(currentTimer, true);

        pauseBtn.textContent = "Pause";
        pauseBtn.classList.remove("paused");
    }
});

document.getElementById("stop").addEventListener("click", () => {
    clearInterval(myInterval);
    isPaused = false;
    pauseTimeRemaining = 0;
    currentTimer.textContent = currentTimer.getAttribute("data-duration") + ":00";
});


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("todo-form");
    const input = document.getElementById("todo-input");
    const list = document.getElementById("todo-list");
    const historyList = document.getElementById("history-list");
    const toggleBtn = document.getElementById("toggle-history");
    const clearBtn = document.getElementById("clear-history");
    const wrapper = document.querySelector(".todo-wrapper");

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

    renderHistory();
    updateEmptyMessage();
    todos.forEach(task => renderTask(task.text, task.createdAt, false));

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
            todos = todos.filter(t => !(t.text === text && t.createdAt === createdAt));
            saveTodos();
            updateEmptyMessage();
        });

        cancelBtn.addEventListener("click", () => {
            li.remove();
            todos = todos.filter(t => !(t.text === text && t.createdAt === createdAt));
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
            history.forEach(item => {
                const li = document.createElement("li");
                li.innerHTML = `✅ ${item.text}<br><small>Start: ${format(item.createdAt)} | End: ${format(item.finishedAt)}</small>`;
                historyList.appendChild(li);
            });
        }
    }

    function format(isoStr) {
        const d = new Date(isoStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    toggleBtn.addEventListener("click", () => {
        wrapper.classList.toggle("flipped");
        toggleBtn.textContent = wrapper.classList.contains("flipped")
            ? "Back to To Do List"
            : "View History";
    });

    clearBtn.addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn xoá toàn bộ lịch sử không?")) {
            history = [];
            localStorage.setItem("history", JSON.stringify(history));
            renderHistory();
            updateEmptyMessage();
        }
    });
});

function updateEmptyMessage() {
    const todoList = document.getElementById("todo-list");
    const todoMsg = document.getElementById("empty-message");
    const historyList = document.getElementById("history-list");
    const historyMsg = document.getElementById("empty-history");

    todoMsg.style.display = todoList.children.length === 0 ? "block" : "none";
    historyMsg.style.display = historyList.children.length === 0 ? "block" : "none";
}
