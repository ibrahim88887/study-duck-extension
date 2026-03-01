# Study Duck Extension

> Remind yourself to stay focused and explain your code. Study Smart! 🦆

## Description

I created Study Duck as a solution for students and developers who spend long hours coding. It is common to get stuck on a single bug for hours or lose track of time entirely, leading to mental burnout.

This Chrome Extension is designed to be a productivity companion. It integrates the **Rubber Duck Debugging** method directly into the browser, allowing you to explain your logic to the "Duck" to find solutions faster.

Additionally, Study Duck helps you manage your study sessions using a built-in **Pomodoro Timer** and a **Quick-Task Manager** to keep your goals organized in one place.

> **Note:** This extension was submitted as my final project for Harvard's CS50 course.

---

## Features

| Feature | Description |
|---|---|
| 🐤 **Duck Chat** | Explain your bug to the rubber duck. The duck asks targeted follow-up questions to help you think through the problem. |
| ⏱ **Pomodoro Timer** | Focus / Short Break / Long Break modes with customisable durations. Runs in the background and sends desktop notifications. |
| ✅ **Task Manager** | Add, complete, and delete daily tasks. Persisted across browser sessions via `chrome.storage`. |

---

## Getting Started

### Dependencies

Any Chromium-based browser (e.g., Google Chrome, Microsoft Edge, Arc, Brave).

### Installing the Extension

1. Click the green **Code** button on this repository and choose **Download ZIP**.
2. Unzip the downloaded folder on your computer.
3. Open your browser and navigate to `chrome://extensions/`.
4. Toggle on **Developer Mode** in the top-right corner.
5. Click **Load unpacked** and select the `study-duck-extension` folder you just unzipped.
6. Pin the extension by clicking the puzzle-piece icon in the browser toolbar.

---

## How to Use

### 🐤 Duck Chat

1. Click the Study Duck icon in your toolbar.
2. Open the **Chat** tab.
3. Describe your problem or bug in the text box and press **Send** (or `Enter`).
4. The duck will respond with questions that guide you through rubber-duck debugging.

### ⏱ Focus Timer

1. Open the **Timer** tab.
2. Choose a mode: **Focus**, **Short Break**, or **Long Break**.
3. Press **Start** to begin the countdown.
4. A desktop notification fires when the session ends and the next mode is queued automatically.
5. Adjust durations in the **⚙ Settings** section.

### ✅ Tasks

1. Open the **Tasks** tab.
2. Type a task in the input field and press **Add** (or `Enter`).
3. Click a task (or its checkbox) to mark it as done.
4. Use **Clear done** to remove completed tasks.

---

## Help

Questions or feedback? Reach out: **ib2007a@gmail.com**

---

## Author

Ibrahim Mohamed ([@ib2007a](https://github.com/ib2007a))

---

## Version History

| Version | Notes |
|---|---|
| 1.0 | Initial release — CS50 Final Project submission |

---

## License

This project is licensed under the [MIT License](LICENSE).
