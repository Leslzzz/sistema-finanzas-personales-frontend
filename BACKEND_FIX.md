# Fix requerido en el Backend

## Problema

El frontend ahora envía el token JWT en el header HTTP:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Pero el backend solo tiene configurado `CustomCookieJWTAuthentication`, que únicamente
lee tokens desde cookies. Por eso rechaza todas las peticiones del frontend con:

```json
{ "detail": "Authentication credentials were not provided." }
```

---

## Solución: 1 cambio en `settings.py`

Busca esta sección en `settings.py`:

```python
# ANTES (solo acepta cookies)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'cuentas.authentication.CustomCookieJWTAuthentication',
    )
}
```

Reemplázala por esto:

```python
# DESPUÉS (acepta Bearer header Y cookies)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'cuentas.authentication.CustomCookieJWTAuthentication',
    )
}
```

Eso es todo. Solo se agrega `JWTAuthentication` antes del custom.
Django intentará autenticar primero con el header `Authorization: Bearer`,
y si no viene, fallback a la cookie. No se rompe nada existente.

---

## Verificación rápida después del deploy

Probar desde la terminal (o Postman) que el registro funciona:

```bash
curl -X POST https://sistema-finanzas-personales.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@test.com", "password": "test123"}'
```

Respuesta esperada `201`:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "name": "Test",
        "email": "test@test.com"
    }
}
```

Probar login:
```bash
curl -X POST https://sistema-finanzas-personales.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "test123"}'
```

Probar endpoint protegido con el token obtenido:
```bash
curl https://sistema-finanzas-personales.up.railway.app/auth/me \
  -H "Authorization: Bearer <token_aqui>"
```

Respuesta esperada `200`:
```json
{
    "id": 1,
    "name": "Test",
    "email": "test@test.com",
    "onboardingCompleted": false
}
```

---

## Checklist para el backend

- [ ] Agregar `JWTAuthentication` en `DEFAULT_AUTHENTICATION_CLASSES` (ver arriba)
- [ ] Confirmar que `POST /auth/register` devuelve `{ "token": "...", "user": { "id", "name", "email" } }`
- [ ] Confirmar que `POST /auth/login` devuelve `{ "token": "...", "user": { "id", "name", "email" } }`
- [ ] Confirmar que `GET /auth/me` devuelve `{ "id", "name", "email", "onboardingCompleted" }`
- [ ] Confirmar que `GET /transactions/summary` devuelve `{ "ingresos", "gastos", "balance" }`
- [ ] Confirmar que `GET /transactions/categories` devuelve `[{ "label", "value", "color" }]`
- [ ] Confirmar que `POST /onboarding` acepta `{ "monthlyIncome", "categories": [{ "label", "budgetLimit" }] }`
- [ ] Hacer redeploy en Railway
