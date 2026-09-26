# KERN: Design Doc v1 (office hours, autonomous run)

Status: DONE_WITH_CONCERNS. Nothing here was validated with real users yet.

## 1. What already exists (checked Sept 2026)

| Player | What it does | Why it is not KERN |
|---|---|---|
| Forage | Free job simulations designed by big companies (JPMorgan, Accenture, Lululemon) | You must pick the role first. It certifies completion, it does not tell you about *you*. |
| Parker Dewey | Paid micro-internships (5 to 40 hours) for students | Role-based, employer-driven, for people who already know their field. |
| Riipen | Company projects embedded in university courses | Needs a school. Not for people outside one. |
| Contra / Dribbble briefs | Marketplaces of paid briefs | Built for people who already have a craft. |
| CareerExplorer, Holland tests, Google Career Dreamer | Quizzes and AI exploration | You answer questions. You make nothing, so no evidence. |

**Conclusion:** "real tasks from tech companies" already exists. It is the supply, not the idea. If KERN's pitch is "tasks from companies", it loses to Forage and Parker Dewey. Collabs stay, but they are not the differentiator.

## 2. The gap nobody fills

Every platform above starts from a role or a field. None starts from "I don't know what I want" and none treats the person as the thing being discovered.

**Differentiator: missions are designed as experiments on yourself.**
- Each mission is one real task from a real company, but it is also built to test one thing about you: energy in shaping an idea vs polishing it, solo vs paired work, starting from zero vs improving something existing, tolerance for ambiguity.
- Missions are sequenced as **contrast pairs**. Mission 1 is "build from zero", mission 2 is "improve what exists". The pattern across contrasts is the signal.
- The output is not a badge. It is **Your Kern**: a short, evidence-linked hypothesis about how you work ("You gained energy on the open brief and dragged on the polish"), which you can confirm or reject.

Nobody else sequences real work to reveal a person's working style. Forage sequences tasks to teach a job. KERN sequences tasks to teach you about yourself.

## 3. Challenges and how they were answered

1. **"Companies will not post tasks for people who do not know what they want."**
   They do not need to. The company posts a normal small task. KERN wraps it with the probe design, which is KERN's own work. The company gets an output, KERN gets a signal.

2. **"One mission is noise."**
   Agreed. A single mission never produces a conclusion. A Kern needs at least 3 contrasting missions. After one mission the app shows a tentative signal labelled "early", with evidence and a "that feels right / not really" control.

3. **"Cold start: where do the first missions come from?"**
   Three sources, all available now: (a) missions KERN writes itself (the 3 in the MVP page), (b) Punto Due Studio's own client base, meaning the studio is the first company partner, (c) 2 to 3 small tech startups, since big names are already locked up by Forage.

4. **"Why would a tech company pay or bother?"**
   They get fresh outputs and a shortlist by working style ("people who energetically shape ideas"), not by CV or degree. That is a different talent signal from a completion badge. Early on it is free for them; payment comes after the first successful missions.

5. **"AI-generated signals will feel fake."**
   Rule-based signals first, always showing the answers that produced them, always framed as a hypothesis. No diagnosis, no personality types.

6. **"It becomes a social network or a marketplace."**
   Not built. The only social piece is the **sign** (the cairn): after finishing, you leave one short tip for the next person on that mission. It is a tip on the mission page, not a feed.

## 4. Premises (all decided without asking, revisit if wrong)

1. The user is 18 to 28, capable but directionless. **English first**, aimed at the US, Canada, UK and Europe. (Updated: earlier draft assumed Italy and Germany first.)
   - **Wave 1:** English only, everything (missions, signals, copy) written in English.
   - **Wave 2:** French (Canada, where Quebec expects it, plus France), Spanish (US Hispanic market plus Spain), German (founder speaks it; DACH market).
   - **Wave 3:** Italian, Portuguese, others by demand.
   - This order is my reasoning from market size and Canada's French requirement, not from data. Check it against real sign-ups.
   - **Build rule:** no hard-coded strings, all text in a translation file from day one, so adding a language is a file, not a rewrite. Missions and signals are content, so they need translating too, not just the buttons.
   - Partner missions are sourced per market: a US startup's task is not automatically right for Germany.
2. The company collabs are supply. The experiment design is the product.
3. Build stays capped at the MVP v0 vertical slice until the BuilderCult application is submitted.

## 5. The concrete idea

**KERN Trail:** three real missions in about ten days, each from a different partner (studio client, startup, KERN-authored), designed as contrasts. You finish with a shareable **Kern card**: your working-style hypothesis, the evidence behind it, and the one next mission to test it further.

## 6. Approaches considered

- **A. Minimal:** the MVP v0 loop with KERN-written missions only. Fast, but has no partner proof.
- **B. Recommended: KERN Trail with 3 partner-sourced contrast missions.** Same build as A, plus a partner label on each mission and the contrast ordering. Small extra work, big difference in story.
- **C. Marketplace first:** company dashboard, payments, matching. Rejected: it is exactly Contra and Parker Dewey, and it needs users first.

## 7. The assignment (real-world, before more building)

Message 10 small tech companies or startups (start with Punto Due Studio's clients) and ask each for **one 2-hour task** they would happily have a stranger attempt. Goal: **3 yeses.** No app needed for this. If you cannot get 3 yeses, the supply side is weaker than assumed and that changes the plan.

Then run the three missions by hand with 5 people. Watch which signal each one produces.

## 8. Problems found, and how each is resolved

### 8.1 The name: KERN stays (decided by you)
Facts: only kern.it is available as a domain, and other known companies use the name. It is pre-product, so the cost of the risk today is near zero. Decision: keep KERN, and cap the exposure.

- **Domain:** register kern.it now (cheap; .it needs an EU-resident registrant, which fits). Do not build the brand around the domain. Public presence uses the brand plus a descriptor: "KERN: find your direction". Add a `.com` variant only if one turns out to be available and cheap; I could not verify domain availability, so this is unchecked.
- **The mark, not the word, is the asset.** The split-stone logo is ownable independently of the name. If the word ever has to change, the mark and palette carry over.
- **Trademark: no filing yet.** "Kern" is a common German word, so it is a weak, crowded name, and other companies coexisting in other fields is normal. What matters is conflicts in the same fields: software, education, career services.
- **Clearance trigger (do it once, before the first of these):** first paying company, app-store submission, or any marketing spend. Steps: free searches on EUIPO TMview and USPTO for "KERN" in software, education and business-services classes, plus a Canadian check, then one app-store search. If a same-field conflict shows up, rename *before* spending on marketing. A rename today costs almost nothing; after launch it costs a lot.
- **App store title** when the time comes: "KERN: Find Your Direction", so the descriptor carries the search.

### 8.2 Contrast pairs are untested → cheap test before more building
Run it by hand, no app: 5 people, 3 missions over about 10 days (a form plus a shared doc is enough). Measure:
- at least 3 of 5 finish all three missions;
- at least 3 of 5 say "that feels right" to their signal;
- at least 2 of 5 would send it to a friend without being asked.
If it misses two of the three, change the mission design before writing more app code.

### 8.3 Signals from 3 missions may be shallow → design fix
- A signal needs at least **two independent pieces of evidence**: what they did (submitted or abandoned, restarted, used the optional step, time spent) plus what they said (reflection answers). One alone never produces a signal.
- Confidence stays "early" until the contrast pair is complete.
- "Not really" is stored and lowers that signal's weight; it is not ignored.

### 8.4 Still open
- Real-user results for 8.2. Nothing is proven until then.
- Supply of missions: covered by the assignment in section 7.
