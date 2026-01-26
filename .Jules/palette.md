## 2026-01-26 - Profile Trigger Accessibility
**Learning:** Found a critical accessibility anti-pattern: using a `div` with `onClick` for the user profile menu. This excludes keyboard users and screen readers from accessing user settings and logout.
**Action:** Always refactor interactive `div`s to `<button type="button">` with appropriate ARIA labels and keyboard support, ensuring visual consistency is maintained.
