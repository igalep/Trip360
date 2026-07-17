# Product Guidelines

This document details the UI/UX design tokens, prose style, and mobile interaction behaviors for the Trip Budget Tracker App.

## 1. Tone and Copywriting Style
- **Style**: Playful & Friendly.
- **Rules**:
  - Incorporate warm travel themes and encouraging prompts.
  - Examples: "Bon Voyage! Let's log your first flight.", "Petrol logged. Drive safely!", "Uh oh, you've hit your budget ceiling. Let's rein it in!"
  - Keep labels descriptive yet inviting.

## 2. Interaction Design
- **Theme**: Always Dark mode. Sleek, premium midnight color tokens for battery saving and consistent high-fidelity appearance.
- **Mobile Touch Interactions**:
  - **Haptics**: Support subtle vibrations on action successes (e.g., adding an expense, creating a trip).
  - **Pull-to-Refresh**: Pulling down on the dashboard triggers a fresh remote database synchronization.
  - **Swipe-to-Action**: Swiping an expense row to the left reveals a deletion action button.

## 3. Form Validation & Feedback
- **Inline Validation**: Ensure inputs are validated in real-time. Field borders change to red (#FAD2CF / #FCE8E6) with clear helper text positioned directly below the failed input field.
- **No placeholders**: Always display full inputs or generated mock visual states.
