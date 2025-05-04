export let currentTimer = null;
export let myInterval = null;
export let isPaused = false;
export let pauseTimeRemaining = 0;

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

    myInterval = setInterval(() => {
        const timeLeft = endTimestamp - Date.now();
        pauseTimeRemaining = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(myInterval);
            new Audio("/assets/audio.mp3").play();
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
}
