import { Hono } from "hono";
const app = new Hono();
app.get("/", (c) => c.text("Welcome to yocaco backend"));
app.get("/health", (c) => c.json({ status: "ok", service: "yocaco-backend", timestamp: new Date().toISOString() }));
export default app;
