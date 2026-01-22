## 2025-10-27 - Fixing Interactive Divs
**Learning:** Found usage of `div` with `onClick` for profile menu triggers, which is inaccessible.
**Action:** Replace with `<button className="text-left bg-transparent border-none p-0 ...">` to maintain visual layout while restoring keyboard accessibility.
