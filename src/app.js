import { Hono } from "hono";
import { cors } from "hono/cors";
import JobController from "./controller/jobs_controller/job_controller.js";
const app = new Hono();
app.use(cors({ origin: "*" }));
app.get("/", (c) => c.text("Welcome to yocaco backend"));
app.get("/health", (c) => c.json({ status: "ok", service: "yocaco-backend", timestamp: new Date().toISOString() }));
