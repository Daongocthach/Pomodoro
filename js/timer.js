import { saveSession } from "./session.js";

export let currentTimer = null;
export let myInterval = null;
export let isPaused = false;
export let pauseTimeRemaining = 0;

// Lưu trạng thái timer vào localStorage
function persistTimerState(timerDisplay, endTimestamp, isPausedLocal = false) {
  const key = timerDisplay.dataset.key;
  const duration = parseFloat(timerDisplay.getAttribute("data-duration"));

  const state = {
    type: key,
    duration,
    startTime: Date.now(),
    endTimestamp,
    isPaused: isPausedLocal,
    pauseRemaining: pauseTimeRemaining,
  };

  localStorage.setItem("activeTimer", JSON.stringify(state));
}

// Bắt đầu timer mới hoặc resume từ pause
export function startTimer(timerDisplay, resume = false) {
  if (myInterval) clearInterval(myInterval);

  let durationInMs;
  if (resume && pauseTimeRemaining) {
    durationInMs = pauseTimeRemaining;
  } else {
    const duration = parseFloat(timerDisplay.getAttribute("data-duration"));
    durationInMs = duration * 60 * 1000;
  }

  const endTimestamp = Date.now() + durationInMs;
  persistTimerState(timerDisplay, endTimestamp, false);

  myInterval = setInterval(() => {
    const timeLeft = endTimestamp - Date.now();
    pauseTimeRemaining = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(myInterval);
      localStorage.removeItem("activeTimer");

      new Audio("./assets/audio.mp3").play();
      saveSession(timerDisplay.getAttribute("data-duration") + " minutes", timerDisplay.id);
      timerDisplay.textContent = "00:00";
    } else {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  }, 1000);
}

export function pauseTimer(pauseBtn) {
  if (myInterval && !isPaused) {
    clearInterval(myInterval);
    isPaused = true;

    pauseBtn.textContent = "Resume";
    pauseBtn.classList.add("paused");

    const state = JSON.parse(localStorage.getItem("activeTimer"));
    if (state) {
      state.isPaused = true;
      state.pauseRemaining = pauseTimeRemaining;
      localStorage.setItem("activeTimer", JSON.stringify(state));
    }
  }
}

export function resumeTimer(timerDisplay, pauseBtn) {
  if (isPaused && timerDisplay) {
    isPaused = false;
    startTimer(timerDisplay, true);

    pauseBtn.textContent = "Pause";
    pauseBtn.classList.remove("paused");
  }
}

export function stopTimer(timerDisplay) {
  clearInterval(myInterval);
  isPaused = false;
  pauseTimeRemaining = 0;
  timerDisplay.textContent = timerDisplay.getAttribute("data-duration") + ":00";
  localStorage.removeItem("activeTimer");
}

// Gọi hàm này ở file main.js trong DOMContentLoaded để khôi phục nếu có
export function restoreTimerOnLoad() {
  const state = JSON.parse(localStorage.getItem("activeTimer"));
  if (!state) return;

  const { type, duration, endTimestamp, isPaused, pauseRemaining } = state;
  const timerDisplay = document.querySelector(`[data-key="${type}"]`);
  if (!timerDisplay) return;

  currentTimer = timerDisplay;
  const now = Date.now();
  let remaining = isPaused ? pauseRemaining : endTimestamp - now;

  if (remaining <= 0) {
    localStorage.removeItem("activeTimer");
    timerDisplay.textContent = "00:00";
    return;
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (!isPaused) {
    pauseTimeRemaining = remaining;
    startTimer(timerDisplay, true);
  } else {
    pauseTimeRemaining = remaining;
    isPaused = true;
  }

  timerDisplay.style.display = "block";
}
