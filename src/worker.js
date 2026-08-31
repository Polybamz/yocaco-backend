import { Hono } from "hono";
const app = new Hono();
app.get("/", (c) => c.text("Welcome to yocaco backend"));
app.get("/health", (c) => c.json({ status: "ok", service: "yocaco-backend", timestamp: new Date().toISOString() }));
export default app;
app.get("/api/auth/jobseeker-profile/:id", (c) => c.json({ note: "wired - controller needs adapter" }));
app.post("/api/auth/register", (c) => c.json({ note: "register endpoint wired" }));
app.post("/api/auth/login", (c) => c.json({ note: "login endpoint wired" }));
