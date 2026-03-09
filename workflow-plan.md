# Updated Engagement Flow Plan

## Phase 1: The Spin and Winner
*   **Step 1:** The user clicks the wheel. The wheel spins (with ticks/whooshes) and lands on a topic (e.g., *EXITO*).
*   **Step 2:** The standard Winner Modal pops up dramatically: `"¡Ha salido EXITO!"`.
*   *(Note: This part remains exactly as we built it before, ensuring the core mechanic works perfectly.)*

## Phase 2: The "Candidates Table" (The Anticipation Build)
*   **Step 3:** Instead of just flashing the single phrase on screen immediately, we fade into a new screen: **The Monthly Dashboard/Candidates Table**.
*   This table shows *all 4 slots* for the winning topic (*EXITO*) for the current month.
*   **Visually:**
    *   Slot 1: Used (maybe checkmarked or slightly dimmed)
    *   Slot 2: The current slot, highlighted, preparing to reveal.
    *   Slot 3 & 4: **Heavily blurred** (with maybe a glowing Question Mark icon over them), teasing the audience.

## Phase 3: The Reveal (The Climax)
*   **Step 4:** The new phrase (Slot 2) bursts out of the table and expands to the top of the screen in our cool, word-by-word kinetic typography style.
*   The audience reads the phrase.

## Phase 4: Scarcity & FOMO 
*   **Step 5:** After the phrase is read, focus drops back down to the candidates table.
*   We update the counter: `[2/4 Reveladas este mes]`.
*   **The Scarcity Highlight:** If this was the *last* phrase of the month for this topic (4/4), the screen goes red/alert mode. The topic gets a massive 🔒 padlocked stamp over it. The text shakes: `"¡TEMA AGOTADO ESTE MES!"`. This creates immense panic/scarcity.

## Phase 5: The Call to Action (The Hook)
*   **Step 6:** A bold CTA fades in at the bottom:
    *   *If 4/4 reached:* "¡Sígueme para desbloquear nuevas frases en [Nombre del Próximo Mes]!"
    *   *If 2/4 reached:* "Solo quedan [X] días y 2 frases más de EXITO. ¡Sígueme para no perdértelas!"

## Technical Requirements for Implementation:
1.  **Backend Update (`/api/phrases`):** Needs to calculate usage *only* for the current calendar month.
2.  **Frontend Logic (`page.tsx` & `Wheel.tsx`):** The wheel must filter out any topic that has hit 4 uses in the current month before rendering.
3.  **UI Redesign (`PhraseScreen.tsx`):** Needs to be completely overhauled to support this multi-stage animation (Table > Reveal > Scarcity > CTA) instead of just showing one phrase.
