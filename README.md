# 🛡️ VigilAudit

Hey! 👋 Welcome to **VigilAudit**. I built this tool to make code reviews and security checks way less painful. 

Let's be honest—nobody likes spending hours hunting down security flaws, cleaning up messy code, or writing documentation from scratch. So, I built a pipeline that does all of that automatically using AI. You just drop your code in, and it handles the heavy lifting.

---

## 🚀 What can it do?

- **Security & Vulnerability Scanner:** Catches risky stuff like hardcoded secrets, bad security practices, and injection flaws.
- **Smart Refactoring:** Gives your code a proper quality score and spits out a clean, optimized version.
- **Auto-Documentation:** Generates neat JSDoc and docstrings so you don't have to waste time writing them.

---

## 🛠️ The Tech Stack

Keeping it simple and fast:
- **Backend:** Node.js & Express.js
- **AI Engine:** Google Gemini API (`gemini-2.5-flash`)
- **File Handling:** Multer
- **Frontend:** Clean HTML5, CSS, and Vanilla JavaScript

---

## 💻 How to Run It Locally

Want to test it out on your machine? It takes less than 2 minutes:

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/VigilAudit.git](https://github.com/YOUR_USERNAME/VigilAudit.git)
   cd VigilAudit
Install dependencies:

Bash
npm install
Set up your environment variables:
Create a .env file in the root directory and add your Gemini API key:

Code snippet
PORT=3000
GEMINI_API_KEY=your_actual_api_key_here
Start the server:

Bash
node server.js
Open it up:
Fire up your browser and go to http://localhost:3000 🚀

🤝 Contributing / Feedback
If you have ideas to make this cooler (like adding GitHub Webhooks or multi-file directory scanning), feel free to fork it, open an issue, or pull request!
