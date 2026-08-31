import { Hono } from "hono";
import JobController from "./controller/jobs_controller/job_controller.js";
const app = new Hono();
app.use(async (c, next) => { c.header("Access-Control-Allow-Origin", "*" ); c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); c.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); if (c.req.method === "OPTIONS") return new Response(null, { status: 204 }); await next(); });
app.get("/", (c) => c.text("Welcome to yocaco backend"));
app.get("/health", (c) => c.json({ status: "ok", service: "yocaco-backend", timestamp: new Date().toISOString() }));
function adapter(c){ const r={status:(s)=>({json:(d)=>c.json(d,s)})}; return r; }
app.get("/api/auth/jobseeker-profile/:id", (c) => c.json({ note: "auth profile" }));
app.post("/api/auth/register", (c) => c.json({ note: "register" }));
app.post("/api/auth/login", (c) => c.json({ note: "login" }));
app.get("/api/jobs/getAllJobs", (c) => JobController.getAllJobs({ body: {}, params: {}, query: c.req.query() }, adapter(c)));
app.get("/api/jobs/get-job-by-employer-id/:id", (c) => JobController.getJobByEmployerId({ params: { id: c.req.param("id") } }, adapter(c)));
app.get("/api/jobs/get-job-suggestions-for-seeker", (c) => JobController.getJobSuggestionsForSeeker({ user: { uid: c.req.header("authorization") || "" } }, adapter(c)));
app.get("/api/jobs/get-job-seekers-for-employer", (c) => JobController.getJobSeekersForEmployer({ user: { uid: c.req.header("authorization") || "" } }, adapter(c)));
export default app;
