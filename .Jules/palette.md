## 2024-05-22 - Accessibility Gaps in Next.js Components
**Learning:** Common pattern of using 'div' with 'onClick' for interactive elements (like profile dropdowns) completely breaks keyboard accessibility.
**Action:** Always check interactive 'div's and refactor to 'button' elements, adding 'text-left' class if needed to preserve layout.
