# Quickstart: Estadísticas de matrices

Requiere api-node levantado y un token de api-go (mismo `JWT_SECRET`).

```bash
npm run dev          # o: docker compose up --build -d

TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin123"}' | jq -r .accessToken)

# 1. Estadísticas y diagonalidad → max 4, min 0, sum 11, anyDiagonal true
curl -s -X POST http://localhost:3000/api/v1/statistics -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"matrices":[{"name":"Q","values":[[1,0],[0,1]]},{"name":"R","values":[[2,3],[0,4]]}]}'

# 2. Sin token → 401 UNAUTHORIZED
curl -s -X POST http://localhost:3000/api/v1/statistics -H 'Content-Type: application/json' -d '{"matrices":[{"values":[[1]]}]}'

# 3. Matriz no rectangular → 400 INVALID_MATRIX
curl -s -X POST http://localhost:3000/api/v1/statistics -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"matrices":[{"values":[[1,2],[3]]}]}'
```

Pruebas automatizadas:
```bash
npm run test:unit            # dominio, DTO, config, errores
npm run test:integration     # endpoint, validación y los 8 casos de JWT
```
