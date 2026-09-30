---
paths:
  - "tests/**/*.js"
  - "**/*.test.js"
---

# Pruebas en api-node
- Unitarias de services en `tests/unit/`; endpoints en `tests/integration/` con `supertest` sobre `src/app.js` (sin `listen`).
- Comparar flotantes con `toBeCloseTo`, nunca con `toBe`.
- Un `describe` por función o endpoint; los nombres de `it` describen el comportamiento en español.
- Los tokens JWT de prueba se firman en un helper con un secreto de prueba; nunca con el `.env` real.
