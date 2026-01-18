## 2024-05-23 - Interactive Elements Semantics
**Learning:** Found critical action buttons (Profile Menu, Notifications) implemented as `div`s with `onClick` or icon-only buttons without labels. This makes them inaccessible to screen readers and keyboard users.
**Action:** Replace `div` triggers with `button` elements, ensure all icon-only buttons have `aria-label`, and add `aria-haspopup`/`aria-expanded` for menus.
