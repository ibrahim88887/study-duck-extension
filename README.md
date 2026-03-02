# Study Duck Extension
#### Video Demo: https://youtu.be/mqRXL7bKNmk
#### Description:

Study Duck is a comprehensive productivity tool built as a Chrome Extension, specifically designed to help students and software engineers maintain focus and overcome coding obstacles. The project was born out of a personal need to balance long study sessions at Kafrelsheikh University with the mental clarity required for complex problem-solving.

The extension is built on the philosophy of "Rubber Duck Debugging," a well-known method where programmers explain their code line-by-line to an inanimate object to find bugs. Study Duck digitizes this experience, providing a dedicated interface where users can "chat" with a virtual duck to clarify their logic.

Beyond debugging, Study Duck addresses the modern challenge of digital distractions. It features a robust website blocker that intercepts requests to known social media platforms like Instagram and TikTok, ensuring that the user remains within their workflow. This is complemented by a customized Pomodoro Timer, which encourages scientifically-backed study intervals (25 minutes of work followed by a 5-minute break), and a built-in To-Do list that saves tasks locally using the Chrome Storage API.

### Technical Implementation & File Structure:

I chose to develop this as a Chrome Extension using a mix of Frontend and Browser APIs to ensure it is lightweight and highly accessible. Here is a breakdown of the core components:

- **manifest.json**: This is the heart of the extension. It defines the permissions needed for "declarativeNetRequest" (to block sites) and "storage" (to save user tasks and timer settings). It also sets up the action popup and background scripts.
- **popup.html & popup.js**: These files handle the main user interface. I used vanilla JavaScript to manage the DOM manipulation for the timer and the task manager, ensuring fast performance without the need for heavy frameworks.
- **style.css**: A custom stylesheet designed with a "Simple & Cloudy" aesthetic (reflecting my personal preference for pleasant atmospheres) to make the study environment feel calm and inviting.
- **background.js**: This script runs in the background to handle the blocking logic and ensures that the focus mode persists even if the popup is closed.
- **images/**: Contains custom-designed icons and the "Study Duck" character assets in various sizes (16, 48, 128) as required by Chrome's standards.

### Design Choices:
During development, I faced a choice between a web app and an extension. I decided on an extension because it integrates directly into the student's environment—the browser. I implemented the Chrome Storage API instead of a traditional database to keep the extension functional offline, making it a reliable tool regardless of internet connectivity.

## Getting Started

### Dependencies
- Any Chromium-based browser (e.g., Google Chrome, Microsoft Edge, Brave).

### Installing the extension
1. Click on the green **"Code"** button on this repository.
2. Click on **"Download ZIP"**.
3. Unzip the downloaded folder on your computer.
4. Open your browser and go to `chrome://extensions/`.
5. Toggle on **"Developer Mode"** in the top right corner.
6. Click on **"Load unpacked"**.
7. Select the `study-duck-extension` folder.
8. Pin the extension by clicking on the puzzle icon on the right-top of your browser.

## How to Use
- **The Duck Chat:** Click the icon and start typing your problem to the duck to clear your mind.
- **Focus Timer:** Set your study interval and start the countdown to stay on track.
- **To-Do List:** Add your tasks for the day and check them off as you complete them.

## Author
**Ibrahim Mohamed** - Computer Engineering Student at Kafrelsheikh University.
📧 ib2007a@gmail.com
