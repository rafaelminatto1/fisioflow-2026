## 2024-05-22 - Interactive Cards: Button vs Div
**Learning:** In this codebase, interactive cards (like task templates) were implemented as `div`s with `onClick`, which excludes keyboard users.
**Action:** Refactor such cards to `<button type="button">` with `w-full` and `text-left` to maintain layout while gaining native focus, keyboard support, and accessibility.
