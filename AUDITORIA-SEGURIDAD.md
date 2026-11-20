# Auditoría de Seguridad y Rendimiento — MERN Template

**Fecha:** 2026-11-20 · **Alcance:** `server/` (Express + MongoDB), `client/` (React + Vite) y `deploy/` (nginx/Railway).

**Estado general:** todos los hallazgos encontrados durante la auditoría están corregidos y validados.
`typecheck`, `eslint` y `pnpm audit --prod` (servidor) y `tsc -b` + `eslint` (cliente) terminan en verde.

---

## 1. Seguridad — Glosario completo (20 puntos)

| #   | Punto                         | De qué trata                                           | Cumple | Cómo se aplica                                                                                                                |
| --- | ----------------------------- | ------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 01  | IDOR                          | Acceder a recursos ajenos cambiando un ID en la URL    | ✅     | No hay rutas por ID; `/api/user` opera solo sobre `req.session.userId`                                                        |
| 02  | Broken Access Control         | Falta de autorización en el servidor                   | ✅     | `requiredUserAuth` en todo `/api/user`; no hay rutas admin; el rol nunca se lee del body                                      |
| 03  | TOCTOU                        | Carrera entre comprobar y actuar                       | ✅     | Rotación de token con `findOneAndUpdate` condicional; registro con índice único + E11000; cambio de contraseña revoca primero |
| 04  | SQL/NoSQL Injection           | Entrada que altera la estructura de la consulta        | ✅     | Tipos validados con yup + guard que elimina claves `$`, `.`, `__proto__`, `constructor`, `prototype`                          |
| 05  | Command Injection             | Entrada que ejecuta comandos del sistema               | ✅     | No existe `exec`/`spawn`/`child_process` en el código                                                                         |
| 06  | Path Traversal                | Escapar de una carpeta con `../`                       | ✅     | Sin rutas con rutas de usuario; el estático `uploads` se eliminó                                                              |
| 07  | Prototype Pollution           | Envenenar `Object.prototype` con `__proto__`           | ✅     | Guard que elimina `__proto__`/`constructor`/`prototype`; además no hay deep-merge de input                                    |
| 08  | Mass Assignment               | Escribir campos no permitidos pasando el body completo | ✅     | Los controllers extraen campos concretos; nunca se pasa `req.body` directo al modelo                                          |
| 09  | SSRF                          | Hacer que el servidor consulte URLs internas           | ✅     | El servidor no realiza peticiones salientes                                                                                   |
| 10  | JWT Misconfiguration          | Alg no fijado, sin expiración, sin revocación          | ✅     | HS256 fijado, `iss`/`aud`/`type`, access 15 min, refresh revocable y con rotación                                             |
| 11  | ReDoS                         | Regex con backtracking que congela el event loop       | ✅     | Regex del email en cliente reescrita de forma posicional; `JWT_TOKEN_PATTERN` es lineal                                       |
| 12  | Missing Rate Limiting         | Brute force / credential stuffing                      | ✅     | Global + auth por IP + por cuenta en login + bucket separado para refresh/logout                                              |
| 13  | Weak Password Storage         | Hashes rápidos (md5/sha256) para contraseñas           | ✅     | bcrypt asíncrono con coste 12                                                                                                 |
| 14  | Timing Attack                 | Comparaciones no constantes filtran secretos           | ✅     | Hash dummy anti-enumeración en login; tokens buscados por hash SHA-256 en BD                                                  |
| 15  | CORS & Security Headers       | Orígenes reflejados, cabeceras ausentes                | ✅     | Allowlist explícita, `helmet`, `hpp`, `x-powered-by` off, CSP en API y en el SPA                                              |
| 16  | Supply Chain Risk             | Dependencias maliciosas o vulnerables                  | ✅     | Lockfile, `--frozen-lockfile` en Docker, `pnpm audit` en CI, 0 vulnerabilidades                                               |
| 17  | Blocking the Event Loop       | Trabajo síncrono que bloquea todas las peticiones      | ✅     | Sin `*Sync` en peticiones; bcrypt asíncrono; `readFileSync` solo al arrancar                                                  |
| 18  | N+1 Queries                   | Una consulta por cada fila de una lista                | ✅     | Sin consultas en bucles; pool creado una sola vez                                                                             |
| 19  | Memory Leaks                  | Cachés sin límite, listeners sin eliminar              | ✅     | Sin cachés sin límite; limiters acotados por ventana; colección de tokens con índice TTL                                      |
| 20  | Backpressure & Payload Limits | Cuerpos sin límite, buffers enteros en RAM             | ✅     | Body limitado a 100 kb (JSON y urlencoded) + compresión                                                                       |

---

## 2. JWT — Revisión de ciclo de vida (skill `jwt-security-review`)

| Área                  | Requisito                                            | Cumple | Implementación                                                                                |
| --------------------- | ---------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| Algoritmo             | Pin de algoritmo, rechazar `alg: none`               | ✅     | `algorithms: ["HS256"]` en `VERIFY_OPTIONS`                                                   |
| Confusión RS256→HS256 | Clave correcta por tipo de algoritmo                 | ✅     | Solo HS256 con secreto compartido; no hay claves públicas                                     |
| `kid`/`jku`/`x5u`     | No confiar en cabeceras para buscar claves           | ✅     | No se usan: la clave es fija por entorno                                                      |
| Fuerza del secreto    | ≥32 bytes de entropía                                | ✅     | Secreto aleatorio de 48 bytes en `.env` (gitignored)                                          |
| Claims                | `exp`, `iss`, `aud`, `type` validados                | ✅     | `jsonwebtoken` valida `exp`/`iss`/`aud`; `type` access/refresh se comprueba a mano            |
| Privilegios           | No confiar en claims del cliente                     | ✅     | El usuario se carga de BD; claims extra se ignoran                                            |
| `sub` estable         | ID de usuario, no email                              | ✅     | `sub` = `userId` (ObjectId)                                                                   |
| Access token          | Vida corta (≤15 min)                                 | ✅     | 15 min por defecto, configurable y validado con regex                                         |
| Refresh token         | Rotación con detección de reuso, almacenado hasheado | ✅     | Rotación atómica, hash SHA-256 en BD, reuso revoca la familia                                 |
| Revocación            | Logout, cambio de contraseña                         | ✅     | `revokeRefreshToken` / `revokeAllForUser`; el cambio de contraseña revoca antes de actualizar |
| Transporte            | httpOnly, no localStorage                            | ✅     | Cookies httpOnly (`access_token`, `refresh_token`); el cliente no usa localStorage            |

---

## 3. Endurecimiento de Express (checklist `AUDIT-SECURITY`)

| #   | Requisito                      | Cumple | Implementación                                                               |
| --- | ------------------------------ | ------ | ---------------------------------------------------------------------------- |
| 1   | Helmet usado                   | ✅     | `helmet({ contentSecurityPolicy: false })` + CSP única vía `helmet-csp`      |
| 2   | CORS restringido               | ✅     | `origin: CORS_ALLOWED_DOMAINS` (allowlist por entorno)                       |
| 3   | Límite de body                 | ✅     | `express.json` y `express.urlencoded` a 100 kb                               |
| 4   | Auth en rutas protegidas       | ✅     | `router.use("/user", requiredUserAuth, ...)`                                 |
| 5   | Rate limit en auth             | ✅     | Login/signup/check-email 30/15 min por IP + 10/15 min por cuenta             |
| 6   | Cookies seguras                | ✅     | httpOnly + `sameSite=lax` + `secure` en producción                           |
| 7   | Sin secretos hardcodeados      | ✅     | Todo en variables de entorno validadas con zod                               |
| 8   | Sin stack traces en prod       | ✅     | Boom + mensaje genérico; `errorDescription` solo en 4xx de producción        |
| 9   | Validación de todo el input    | ✅     | Esquema yup por ruta (body, query, params)                                   |
| 10  | Sin concatenación en consultas | ✅     | Solo queries tipadas de Mongoose; guard anti-NoSQL                           |
| +   | CSRF                           | ✅     | `CSRF_ORIGIN_GUARD`: escrituras con `Origin` fuera de allowlist → 403        |
| +   | Manejo de errores              | ✅     | `wrapServerErrors` registrado después de las rutas (Express 5), siempre JSON |
| +   | Request ID                     | ✅     | `X-Request-Id` aceptado/generado y devuelto para correlación                 |
| +   | Logs sin secretos              | ✅     | Pino con redacción de `authorization`, `cookie`, `set-cookie` y contraseñas  |

---

## 4. Base de datos — Conexión, índices y atomicidad

### Conexión (skill `mongodb-connection`)

| Parámetro                  | Local (dev) | Producción | Justificación                                                      |
| -------------------------- | ----------- | ---------- | ------------------------------------------------------------------ |
| `maxPoolSize`              | 10          | 20         | Baja concurrencia local; arranque conservador en prod, monitorizar |
| `minPoolSize`              | 0           | 5          | Sin ociosas en dev; precalentadas para picos en prod               |
| `maxIdleTimeMS`            | 30 s        | 5 min      | Liberar rápido en local; reutilizar en servidor estable            |
| `connectTimeoutMS`         | 5 s         | 10 s       | Falla rápida local; mayor latencia hacia cluster remoto            |
| `socketTimeoutMS`          | 30 s        | 30 s       | OLTP corto: nada debe colgarse más de 30 s                         |
| `serverSelectionTimeoutMS` | 5 s         | 5 s        | Failover ágil del replica set                                      |
| `compressors`              | —           | `zlib`     | Compresión de red para latencias altas (>50 ms)                    |

- Cliente único reutilizado en toda la app; pool creado una sola vez.
- Reintentos de conexión secuenciales con backoff (4 intentos, sin solapamiento).
- Cierre ordenado: dejar de aceptar conexiones → terminar peticiones en curso → cerrar Mongo, con timer de fuerza de 10 s.
- `/health` hace **ping real** a Mongo (no solo `readyState`).

### Índices

| Colección       | Índice                    | Cubre                                                          |
| --------------- | ------------------------- | -------------------------------------------------------------- |
| `users`         | `email` (único)           | Login, disponibilidad de email, registro (E11000 → 409)        |
| `refreshtokens` | `tokenHash` (único)       | Rotación y revocación por token                                |
| `refreshtokens` | `{user: 1, revokedAt: 1}` | Revocación de familia / todas las sesiones (prefijo izquierdo) |
| `refreshtokens` | `{expiresAt: 1}` (TTL)    | Limpieza automática; la colección nunca crece sin límite       |

Sin COLLSCAN: todos los filtros de la app caen en un índice.

### Atomicidad (skill `mongodb-query-optimizer` / TOCTOU)

| Operación                 | Estrategia                                                                       | Estado                    |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| Rotación de refresh token | `findOneAndUpdate({ tokenHash, revokedAt: null }, ...)` — solo una petición gana | ✅ Atómica                |
| Registro de usuario       | Índice único de email + manejo de E11000                                         | ✅ Sin ventana explotable |
| Cambio de contraseña      | Revoca todas las sesiones **antes** de actualizar (fail-safe sin transacción)    | ✅ Seguro ante crash      |
| Revocación de familia     | `updateMany` atómico e idempotente                                               | ✅                        |
| Disponibilidad de email   | `exists()` (se detiene en el primer documento)                                   | ✅ Optimizado             |

Nota: Mongo local es standalone, por lo que no hay transacciones multi-documento; el código está diseñado para ser correcto sin ellas.

---

## 5. Los 10 hábitos

| #   | Hábito                   | Cumple | Notas                                                              |
| --- | ------------------------ | ------ | ------------------------------------------------------------------ |
| 1   | Nunca commitear secretos | ✅     | `.env` y `certs/` en `.gitignore`; secreto JWT aleatorio de 48 B   |
| 2   | No filtrar stack traces  | ✅     | Boom; mensaje genérico + `requestId` en producción                 |
| 3   | Validar en la frontera   | ✅     | Esquema yup por ruta (body, query, params)                         |
| 4   | Errores de proceso       | ✅     | `uncaughtException` → log fatal + exit; `unhandledRejection` → log |
| 5   | Graceful shutdown        | ✅     | SIGINT/SIGTERM → servidor → Mongo, con timer de fuerza             |
| 6   | HTTPS y HSTS             | ✅     | TLS soportado local y en Railway; HSTS vía helmet en prod          |
| 7   | Caché deliberada         | ◐      | Parcial: sin ETag/Redis (opcional a futuro)                        |
| 8   | Usar todos los cores     | ◐      | Un proceso por diseño; escalado horizontal por réplicas (nginx)    |
| 9   | Logs JSON estructurados  | ✅     | Pino con `requestId` y redacción de secretos                       |
| 10  | Node LTS                 | ✅     | `node:22-alpine`, engines `>=22.12`                                |

---

## 6. Frontend (cliente)

| Punto                                | Cumple | Implementación                                                             |
| ------------------------------------ | ------ | -------------------------------------------------------------------------- |
| Tokens en httpOnly, sin localStorage | ✅     | Axios con `withCredentials`; los tokens nunca tocan JS                     |
| Serialización del refresh            | ✅     | Web Locks (`mern-template:session-refresh`) entre pestañas                 |
| Sincronización de sesión             | ✅     | `BroadcastChannel` (`mern-template:session`)                               |
| Cierre de sesión por robo/expiración | ✅     | Interceptor 401 → refresh → logout + navegación a `/login`                 |
| Bandera de sesión                    | ✅     | Cookie `session_present` (sin secretos) evita llamadas innecesarias        |
| Sin XSS por render                   | ✅     | Sin `dangerouslySetInnerHTML`/`innerHTML`; React escapa la salida          |
| ReDoS en validación de email         | ✅     | Comprobación posicional sin backtracking                                   |
| Rate limit en check-email            | ✅     | `retry: 1` + `staleTime: 30 s`                                             |
| DevTools fuera de producción         | ✅     | `import.meta.env.DEV` elimina la rama del bundle                           |
| Cabeceras del SPA                    | ✅     | CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy` en la plantilla nginx |
| Build verde                          | ✅     | `tsc -b` y `eslint` sin errores                                            |

---

## 7. Estado de validación

| Comando                           | Resultado             |
| --------------------------------- | --------------------- |
| `pnpm typecheck` (server)         | ✅ Sin errores        |
| `npx eslint src --quiet` (server) | ✅ Sin errores        |
| `pnpm audit --prod` (server)      | ✅ 0 vulnerabilidades |
| `npx tsc -b` (client)             | ✅ Sin errores        |
| `npx eslint src --quiet` (client) | ✅ Sin errores        |

---

## 8. Pendientes operativos (no son defectos)

1. **Origen de producción en `CORS_ALLOWED_DOMAINS`**: el guard CSRF exige que el dominio real del frontend esté en la lista (p. ej. `https://tuapp.up.railway.app`).
2. **Limiters en memoria**: asumen un solo proceso; con réplicas se debilitaría el rate limit por IP (la revocación de sesiones sigue siendo correcta porque vive en BD).
3. **Caché HTTP/ETag y Redis**: opcionales si el tráfico crece.
4. **Mongo standalone**: si se pasa a replica set, se pueden añadir transacciones multi-documento (hoy el código es fail-safe sin ellas).
