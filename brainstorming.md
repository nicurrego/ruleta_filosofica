# Engagement Flow Brainstorming

## Current Idea: Monthly Reset of 3 Phrases per Topic

*   **Concept:** Each month, only 3 phrases are available per topic.
*   **Mechanic:**
    *   The backend (or local state) tracks how many times a topic has been selected in the *current month*.
    *   If a topic is selected 3 times, it's "depleted" for that month and removed from the wheel.
    *   At the start of a new month, the wheel resets with all topics, and 3 *new* unused phrases are queued up for each topic.
*   **UI/UX:**
    *   **Winner Screen (or Phrase Screen):** Show a countdown: "Only X days left this month!"
    *   Maybe show a tracker: "DINERO: 2/3 revealed this month."

## Why this works for Engagement (The Psychology)
1.  **Scarcity:** Limiting something to "only 3 times a month" makes each reveal feel more valuable. It's a limited-time event.
2.  **Urgency:** The "days left" countdown creates FOMO (Fear Of Missing Out). Users need to check in *now* before the month ends.
3.  **Anticipation (The "Hook"):** If a user loves the "DINERO" topic but it's removed on the 15th, they *have* to follow you and wait until the 1st of next month to see more DINERO content.
4.  **Consistency:** It creates a natural, recurring content cycle (a "Season" format). Every month is a new season of phrases.

## Potential Challenges / Edge Cases to Design For
*   **What if I spin 24 times in the first 10 days?** (8 topics * 3 phrases = 24 max spins per month).
    *   If you post exactly 1 video a day, you'll run out of content on day 24.
    *   **Solution A:** That's fine! You only post 24 times a month.
    *   **Solution B:** We need slightly more phrases per month, OR fewer topics, OR we need a fallback mechanism if the wheel gets entirely empty before the month ends.
*   **Visualizing the "Depletion":** Seeing a topic disappear from the wheel is cool, but we need to make sure the users *know* why it disappeared.

## Alternative / Enhancement Ideas
*   **The "Unlock" Mechanic (Goal-based):** Instead of just monthly limits, what if a topic is locked *until* a video hits a certain number of likes? (Harder to track automatically, but good for verbal CTA).
*   **The "Streak" Mechanic:** "Comment your favorite topic to influence tomorrow's spin!"

Let's discuss the 24-day math problem first!
