# Palette's Journal

This journal documents critical UX and accessibility learnings from the development process.

## 2025-05-23 - [Interactive Elements: Div vs Button]
**Learning:** Using `div` with `onClick` for interactive elements (like dropdown triggers) is an accessibility anti-pattern because it lacks keyboard focusability and semantic meaning. Screen readers cannot announce it as a button, and keyboard users cannot navigate to it using `Tab` or activate it using `Enter`/`Space`.
**Action:** Always use `<button type="button">` for interactive elements that trigger actions or menus. Reset default button styles if necessary to match the design, and ensure `aria-label`, `aria-expanded`, and `aria-haspopup` are used for dropdowns.
