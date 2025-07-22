# Signal
> This app is inspired by the legendary focus of individuals like Steve Jobs and Elon Musk, and the philosophy popularized by Kevin O'Leary ("Mr. Wonderful").
>
> **Signal-to-Noise Ratio: The Core Intent**
>
> - **Signal** = Productive, goal-oriented work that truly moves you forward.
> - **Noise** = Distractions, irrelevant tasks, and anything that doesn't contribute to your core goals.
>
> **Signal** is a tool to help you master this ratio: to focus on what matters, break down big goals into actionable steps, and ensure your daily effort is spent on the highest-impact work—just like the world's most effective people.
>
> **Steve Jobs:**
> - Known for his intense focus and drive, Jobs had a high signal-to-noise ratio—spending 80% of his time on "signal" and only 20% on "noise."
> - He worked 18-hour days, prioritizing the 3–5 most important tasks and eliminating distractions.
>
> **Kevin O'Leary ("Mr. Wonderful"):**
> - Frequently discusses the importance of maximizing your signal-to-noise ratio for entrepreneurial success.
> - "Signal" is what grows your company or achieves your goals; "noise" is everything else.
> - Those who can't filter out noise will struggle to reach their full potential.
>
> **More than just tools:**
> - Signal is not only a set of tools for focus and productivity, but also leverages AI as an extension of your mind.
> - Inspired by the signal-to-noise philosophy, Signal gives you the freedom and creative space to decide what matters most, while AI acts as a supportive partner to help you see blind spots, ask the right questions, and make better decisions.
> - The AI is designed to assist you in clarifying, breaking down, and prioritizing your ideas—never to dictate or override your choices.
> - **Beyond decision making:** Whenever possible, the AI will help you actually achieve your goals—by automating tasks, using AI agents to do the work for you, or advising you on the best AI tools and strategies to accomplish your objectives.

## 🌱 Purpose

Signal is not a traditional task manager. It's a **signal amplifier** — designed to reduce mental noise and align your daily effort with what truly moves you forward. It combines **task decomposition**, **priority selection**, and **focused execution** within a lightweight UI.

---

## 🤖 AI Clarity Partner Philosophy

Signal features an AI agent that acts as a **clarity partner and assistant**—never a boss. The AI's role is to:

- **Ask concise, Socratic questions** to help you clarify your ideas and intentions.
- **Never overwhelm:** The AI is always brief, using yes/no or short-answer questions, and only asks for more detail when truly needed.
- **Never tell you what to do:** Like a psychologist, the AI helps you come to your own realizations through interaction, not by giving orders.
- **Assist, not decide:** The user always has the final say. The AI is there to help you get unstuck, see blind spots, and move forward faster.
- **Context-aware:** The AI remembers your clarified ideas and long-term goals, and uses them to ask better questions and suggest priorities.

### Example AI Flow

1. **Brainstorm:**
   - User enters raw, unfiltered ideas.
   - AI reviews each idea and asks a concise clarifying question ("Is this urgent?", "Is this for work or personal?").
   - User answers; AI summarizes its understanding and asks for confirmation ("Did I get this right?").
   - User verifies or corrects. Verified ideas are stored for future use.

2. **Backlog (AI Refinement & Breakdown):**
   - Each brainstormed idea is reviewed by the AI.
   - The AI checks if the idea is actionable and can be completed within a day (18 hours).
   - If an idea is too large or vague, the AI helps the user break it down into smaller, actionable steps.
   - The user and AI work together to clarify and decompose ideas until each is clear, specific, and doable within the next 18 hours.
   - Only these refined, actionable ideas move forward.

3. **Priority Filtering:**
   - AI can suggest which clarified ideas to focus on, based on your long-term goals and recent activity.
   - User can override or adjust; AI never insists.

4. **Focus Selection:**
   - User selects 3–5 tasks for the next 18 hours.
   - AI can help break down tasks into substeps if asked.

5. **Session:**
   - During execution, AI can offer help if you're stuck ("Need help with this substep?").
   - At the end, AI prompts for a brief reflection.

---

## 🔁 Workflow Logic

1. **Brainstorm:**  
   Start by listing everything you might need or want to do today.
   - All Brainstorms are stored for future reference.
   - Each idea is clarified and verified with the AI agent.

2. **Backlog (Refinement & Breakdown):**
   - The AI and user review each brainstormed idea.
   - Each idea must be actionable and completable within a day (18 hours).
   - If an idea is too big, the AI helps break it down into smaller steps.
   - Only clear, actionable, and user-verified ideas move forward.

3. **Priority Filtering:**  
   From your clarified ideas, select the **most impactful or meaningful tasks** (usually 5–8). The AI can suggest, but you decide.

4. **Top Focus Selection (3–5):**  
   Narrow this list down to **3–5 core tasks** you commit to doing in the next 18 hours. These are your **Focus Tasks**.

5. **Breakdown Each Focus Task:**  
   Each Focus Task can be **decomposed into smaller, actionable steps**. The AI can assist if you want.

6. **Time Window (18h):**  
   Focus Tasks are active for an **18-hour window**. Once expired, the session resets — completed tasks go to history, and the cycle restarts.

---

## 🧠 Philosophy

- **AI as a clarity partner:** The agent helps you think, not just automate.
- **Momentum over completion:** Break inertia by doing small, meaningful steps.
- **Clarity over volume:** Fewer decisions. More movement.
- **Temporal urgency:** The 18h window avoids procrastination and perfection traps.
- **User in control:** You always have the final say; AI is never prescriptive.
- **Actionable tasks:** Every idea must be broken down until it is clear, specific, and doable within a day.

---

## 🚀 Features (MVP)

- [x] Add task list (unfiltered)
- [x] AI agentic verification of Brainstorm ideas
- [x] Select top priorities from the list (with AI suggestions)
- [x] Select 3–5 Focus Tasks
- [x] Break down each Focus Task into subtasks (AI-assisted)
- [x] 18-hour timer per session
- [x] Completed task archive

---

## 📦 Tech Stack

- **Frontend:** Nuxt 3 (Vue) + Tailwind CSS
- **State:** LocalStorage (MVP), Supabase (optional for auth/sync)
- **Hosting:** Vercel or Netlify
- **PWA Support:** Mobile-first, installable

---

## 🧭 Roadmap (Next)

- [ ] Persistent user sessions (auth + cloud storage)
- [ ] Daily reflection prompt
- [ ] Streaks / personal metrics
- [ ] AI agent integration (clarity partner, not boss)
- [ ] Export/import data
- [ ] User settings/preferences
- [ ] **Dashboard for finished/unfinished tasks**
  - Visualize completed and pending tasks
  - Show accomplishments and unlockable achievements to motivate users

---

## 🧩 AI Agent Guide (for Dev Agents)

- Implement a layered task data model:
  - `AllTasks[]` → `Clarified[]` (AI-verified) → `FocusTasks[]` → `Substeps[]`
- Enforce limit: `FocusTasks.length ∈ [focusMin, focusMax]` (user settings)
- Every FocusTask can contain `substeps[]` (AI can assist)
- Trigger 18-hour countdown on initial commit
- Archive expired sessions; do not auto-carry tasks
- AI agent should:
  - Ask concise, context-aware questions (prefer yes/no)
  - Never overwhelm; keep all prompts brief
  - Only ask for more detail if truly needed
  - Always let the user verify/confirm before proceeding
  - **Help break down large ideas into smaller, actionable steps that can be completed within a day**

---

## ✨ License

MIT – Use freely and fork with focus.
