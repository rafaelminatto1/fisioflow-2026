## 2024-05-22 - Interactive Divs vs Buttons
**Learning:** Found a pattern of using `div` with `onClick` for interactive cards (e.g., in `TasksManagerPro`). This breaks keyboard accessibility (no tab focus) and screen reader support (no role).
**Action:** Refactor these to `<button type="button">`. For card-like buttons, add `w-full text-left` to maintain layout and ensure visible focus states (`focus:ring`) are added for keyboard users.
