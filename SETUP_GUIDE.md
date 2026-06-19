# StructAI — Complete Setup Guide
## Rajdip এর জন্য — Step by Step

---

## ✅ PART 1: Node.js Install করো

**কী:** Node.js হলো JavaScript run করার software। App চালাতে লাগবে।

1. Browser এ যাও: **https://nodejs.org**
2. বড় সবুজ button "LTS" তে click করো (v20 বা v22)
3. Download হলে open করো → Next → Next → Install
4. Install শেষে **CMD** খুলো (Windows key → "cmd" লিখো → Enter)
5. এটা লিখো:
   ```
   node --version
   ```
   যদি `v20.x.x` বা এরকম দেখায় — সফল! ✅

---

## ✅ PART 2: Groq API Key নাও (সম্পূর্ণ FREE)

**কী:** Groq হলো free AI service। এই key দিয়ে AI কথা বলবে।

1. Browser এ যাও: **https://console.groq.com**
2. "Sign Up" করো (Google দিয়ে করতে পারো — সহজ)
3. Login করার পর বাম দিকে **"API Keys"** click করো
4. **"Create API Key"** button চাপো
5. Name দাও: "structai" → Create
6. Key copy করো — এরকম দেখাবে: `gsk_xxxxxxxxxxxx`
7. Notepad এ paste করে রাখো (পরে লাগবে)

⚠️ **এই key কাউকে দেবে না!**

---

## ✅ PART 3: GitHub Account বানাও

**কী:** GitHub হলো code রাখার জায়গা। Vercel এখান থেকে নেবে।

1. Browser এ যাও: **https://github.com**
2. "Sign up" করো (free)
3. Username দাও (e.g. rajdipeng বা যেকোনো)
4. Email verify করো

---

## ✅ PART 4: Project GitHub এ Upload করো

1. **ZIP file টা extract করো** (structural-ai folder পাবে)

2. **GitHub এ নতুন repository বানাও:**
   - GitHub এ login করো
   - উপরে "+" icon → "New repository"
   - Repository name: `structural-ai`
   - **Public** রাখো
   - "Create repository" চাপো

3. **CMD খুলো** (Windows key → cmd → Enter)

4. Project folder এ যাও:
   ```
   cd Desktop\structural-ai
   ```
   (যদি Desktop এ extract করো)

5. এই commands একে একে দাও:
   ```
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/তোমার_USERNAME/structural-ai.git
   git push -u origin main
   ```
   (তোমার_USERNAME এর জায়গায় তোমার GitHub username দাও)

6. GitHub password চাইলে দাও।

GitHub এ গিয়ে দেখো — সব file দেখাচ্ছে ✅

---

## ✅ PART 5: .env.local File বানাও (API Key দাও)

1. Project folder এ যাও (structural-ai folder)
2. নতুন file বানাও নাম: `.env.local`
   - Notepad খুলো → Save As → filename: `.env.local` → Save as type: "All Files"
3. এই লেখা দাও:
   ```
   VITE_GROQ_KEY=gsk_তোমার_groq_key_এখানে
   VITE_APP_PASSWORD=তোমার_পাসওয়ার্ড
   ```
4. Save করো

⚠️ এই file টা GitHub এ যাবে না (.gitignore এ আছে)

---

## ✅ PART 6: Local এ Test করো

CMD এ project folder এ থেকে:
```
npm install
```
(packages install হবে, একটু সময় লাগবে)

তারপর:
```
npm run dev
```

Browser এ যাও: **http://localhost:5173**

Login করো তোমার password দিয়ে — App দেখাবে! ✅

---

## ✅ PART 7: Vercel এ Deploy করো (Online করো)

**কী:** Vercel এ দিলে যেকোনো জায়গা থেকে, যেকোনো device এ চলবে।

1. Browser এ যাও: **https://vercel.com**
2. "Sign up with GitHub" চাপো
3. GitHub account দিয়ে login করো
4. "Add New Project" → তোমার `structural-ai` repo select করো
5. **Environment Variables** section এ:
   - "Add Variable" চাপো
   - Name: `VITE_GROQ_KEY` → Value: তোমার groq key
   - আবার "Add Variable"
   - Name: `VITE_APP_PASSWORD` → Value: তোমার password
6. **"Deploy"** চাপো!

5-10 মিনিটে হয়ে যাবে।
তোমার URL হবে: `https://structural-ai-xxxxx.vercel.app` ✅

---

## ✅ PART 8: App Use করো

### Drawing Analyze করতে:
- "Analyze Drawing" page এ যাও
- DXF / PDF / Image drag করো বা upload button চাপো
- বাংলায় বা English এ প্রশ্ন করো

### Training Hub:
- "Training Hub" page এ যাও
- তোমার standard drawings, boss এর style, sections add করো
- AI এই data দেখে আরো accurate হবে

### Code switch করতে:
- Sidebar এ ACI 318 / BNBC button চাপো

### ভবিষ্যতে update করতে:
- Code change করো → `git add . && git commit -m "update" && git push`
- Vercel automatically update হবে!

---

## 💡 Quick Reference

| Action | Command |
|--------|---------|
| Local run | `npm run dev` |
| Build | `npm run build` |
| Update GitHub | `git add . && git commit -m "msg" && git push` |

---

## ❓ কোনো সমস্যা হলে

যেকোনো step এ আটকে গেলে Claude কে বলো — screenshot দাও, সাথে সাথে help করবো!

