# State and theme gate

Measured the real renderer at 360×640 CSS pixels across 22 states in four themes: 88 observations, no horizontal overflow, action bars at most 88px and task areas at least 416px. Required 320/360/720 screenshots include light, dark, high-contrast dark and high-contrast light.

- [Measurements](states.json)
- [Screenshot metadata](screenshots.json)
- [Screenshot matrix](matrix.jpg)
- [Executed full suite](tests.txt)

Errors scroll with the task. Blocked-action captions remain accessible in full and visually occupy up to two lines. Both high-contrast fallbacks pass the same token contrast floors as light and dark. Custom native editor themes, screen-reader speech and projector legibility remain unverified.
