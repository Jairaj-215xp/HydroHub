# HydroHub 🔵⚗️

**The ultimate global hub for hydrogen fuel information, daily news, ideas, and basics.**

HydroHub is a web platform dedicated to accelerating the clean energy transition by making hydrogen fuel knowledge accessible to everyone — from industry professionals and researchers to students and clean energy enthusiasts.

🔗 **Live Repo:** [github.com/Jairaj-215xp/HydroHub](https://github.com/Jairaj-215xp/HydroHub)

---

## ✨ Features

- **Hydrogen Basics** — Clear breakdowns of Green, Blue, and Gray hydrogen production methods.
- **Global Information Hub** — Key stats and metrics on global hydrogen adoption, production, and projects.
- **Daily News & Ideas** — Aggregated, filterable news feed pulling from multiple sources (GDELT, Google News, The Guardian, renewable energy feeds, and more).
- **Academic Research** — Curated shortcuts to major research databases (Google Scholar, arXiv, PubMed, ScienceDirect, IEEE Xplore, ResearchGate, DOAJ, OSTI.gov, SpringerLink).
- **Community Research** — A space for community-submitted hydrogen-related research and content.
- **Hydrobot AI Assistant** — An in-browser chatbot that answers questions about hydrogen fuel, fuel cells, and green energy technology.
- **User Accounts** — Sign up, log in, manage your profile, and verify your account (powered by Firebase Auth).
- **Bookmarks & Drafts** — Save articles/ideas for later and manage draft content.
- **Content Upload** — Upload and contribute hydrogen-related content/research to the platform.
- **Contact & Ask a Doubt** — A contact form for users to reach out with hydrogen-related questions.

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
|-------------------|--------------------------------------|
| Frontend          | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| Backend / Auth    | Firebase (Authentication, likely Firestore/Storage) |
| Data              | JSON-based news feeds (GDELT, Google News, Guardian, renewable energy & space news) |
| Utility Scripts   | Python (`fix.py`) |
| AI Assistant      | Hydrobot chatbot integration |

---

## 📂 Project Structure

```
HydroHub/
├── index.html                  # Landing page (Basics, Hub, News, Research, About, Contact)
├── index.css                   # Landing page styling
├── main-v2.js                  # Core site logic / UI initialization
├── script.js                   # Additional site scripts
├── ui-utils.js                 # Shared UI helper functions
│
├── auth.js                     # Firebase authentication logic
├── firebase-config.js          # Firebase project configuration
├── env.example.js              # Example environment/config variables
│
├── account.html / account.js   # User account management
├── profile-setup.html / .js    # Profile setup flow
├── verify.html / verify.js     # Account verification
│
├── bookmarks.html / bookmarks-v2.js   # Saved content
├── drafts.html / drafts.js            # Draft management
├── upload.html / upload.js            # Content upload
│
├── info.html / info.css / info.js     # SimLab / info section
├── community-research.html            # Community research page
│
├── gdelt.json                  # GDELT news feed data
├── google_news.json            # Google News feed data
├── guardian.json                # Guardian news feed data
├── re_news.json                # Renewable energy news feed data
├── space_news.json             # Space news feed data
├── h2view.json                 # Hydrogen-view data feed
│
├── fix.py                      # Python utility script
├── test_fetch.js               # Fetch/testing script
│
├── hydrogen_car.png            # Asset
├── hydrogen_plant.png          # Asset
└── Default logo.png            # Asset
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- A [Firebase](https://firebase.google.com/) project (for authentication and any backend features)
- (Optional) A local static server to avoid CORS/module-loading issues, e.g. [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or Python's built-in server

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jairaj-215xp/HydroHub.git
   cd HydroHub
   ```

2. **Configure Firebase**
   - Copy `env.example.js` and rename/fill it with your own Firebase project credentials.
   - Update `firebase-config.js` with your Firebase config (API key, project ID, auth domain, etc.).
   - ⚠️ Never commit your real API keys/credentials — keep them out of version control.

3. **Run locally**

   Using Python:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

   Or simply open `index.html` directly in your browser (some features like Firebase Auth and ES module imports may require a local server to work correctly).

---

## 🧩 Key Pages

| Page | Description |
|------|-------------|
| `index.html` | Main landing page — hydrogen basics, global stats, news feed, research links |
| `info.html` | SimLab / additional hydrogen info |
| `community-research.html` | Community-submitted research |
| `account.html` | User account dashboard |
| `profile-setup.html` | New user profile setup |
| `verify.html` | Email/account verification |
| `bookmarks.html` | Saved articles and content |
| `drafts.html` | Draft content management |
| `upload.html` | Upload research/content |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

Created and maintained by **Jairaj Sapkal**.

- Email: [sapkaljairaj215sm@gmail.com](mailto:sapkaljairaj215sm@gmail.com)
- GitHub: [@Jairaj-215xp](https://github.com/Jairaj-215xp)

---

## 📄 License

This project currently has no license specified. Consider adding one (e.g., MIT) if you plan to open it up for contributions or reuse.

---

*HydroHub — Accelerating the Clean Energy Transition, one molecule at a time.* ⚡
