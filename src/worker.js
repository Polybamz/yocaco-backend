import { Hono } from "hono";
import { cors } from "hono/cors";

import { protect, adminOnly } from "./middleware/auth.js";

import JobController from "./controller/jobs_controller/job_controller.js";
import BannerController from "./controller/content_management/banner_controller/banner_controller.js";
import MissionVisionController from "./controller/content_management/mission_ision/mission_ission_controller.js";
import TestimonialController from "./controller/content_management/testiminials_controller/testimonials_controller.js";
import ArtcleController from "./controller/content_management/article_controller/artocle_controler.js";
import NewsletterController from "./controller/newsletter_controller/newsletter_controller.js";
import MessagesController from "./controller/messages_controller/messages_controller.js";
import AdminAuthController from "./controller/auth_constroller/admin_controller.js";
import userAuthController from "./controller/auth_constroller/user_auth_controller.js";
import ContactController from "./controller/contact_controller/contact_controller.js";
import SubscriptionController from "./controller/subscription_controller/subscription_controller.js";
import CloudinaryController from "./controller/coudinary/cloudinay_controller.js";
import PaymentService from "./services/payment/payment_ser.js";
import SubscriptionSer from "./services/subscription_ser/subscription_ser.js";

// ---------------------------------------------------------------------------
// Express-controller adapter
//
// All controllers/middleware in this codebase are written as Express
// `(req, res[, next])` handlers. Rather than fork that logic, we build thin
// req/res shims from the Hono context and hand them to the existing
// controllers unchanged.
// ---------------------------------------------------------------------------

async function parseBody(c) {
  const method = c.req.method;
  if (method === "GET" || method === "HEAD" || method === "DELETE") return {};
  try {
    return await c.req.json();
  } catch {
    return {};
  }
}

// Express controllers in this codebase inconsistently `return res.json(...)`
// vs. just calling `res.json(...)` as a side effect (valid in real Express,
// since it writes straight to the response). `sent` below tracks the last
// Response built via status()/json()/send() so handle() can fall back to it
// when the controller itself doesn't return anything.
function buildRes(c) {
  let statusCode = 200;
  let sent;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      sent = c.json(data === undefined ? null : data, statusCode);
      return sent;
    },
    send(data) {
      sent = typeof data === "string" ? c.text(data, statusCode) : c.json(data ?? null, statusCode);
      return sent;
    },
    get _sent() {
      return sent;
    },
  };
}

// Wrap an Express-style controller method as a Hono handler.
function handle(controllerMethod) {
  return async (c) => {
    const body = await parseBody(c);
    const req = {
      body,
      params: c.req.param(),
      query: Object.fromEntries(new URL(c.req.url).searchParams),
      headers: {
        authorization: c.req.header("authorization") || c.req.header("Authorization") || "",
      },
      user: c.get("user"),
    };
    const res = buildRes(c);
    const result = await controllerMethod(req, res);
    return result instanceof Response ? result : res._sent;
  };
}

// Runs the existing `protect` Express middleware and stores the decoded user
// on the Hono context for downstream handlers.
function authMiddleware() {
  return async (c, next) => {
    const req = {
      headers: {
        authorization: c.req.header("authorization") || c.req.header("Authorization") || "",
      },
    };
    let authorized = false;
    let statusCode = 200;
    let payload = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        payload = data;
        return this;
      },
    };
    await protect(req, res, () => {
      authorized = true;
    });
    if (!authorized) return c.json(payload, statusCode);
    c.set("user", req.user);
    await next();
  };
}

// Runs the existing `adminOnly` Express middleware. Must follow authMiddleware().
function adminMiddleware() {
  return async (c, next) => {
    const req = { user: c.get("user") };
    let authorized = false;
    let statusCode = 200;
    let payload = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        payload = data;
        return this;
      },
    };
    adminOnly(req, res, () => {
      authorized = true;
    });
    if (!authorized) return c.json(payload, statusCode);
    await next();
  };
}

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (c) => c.text("Welcome to yocaco backend"));
app.get("/health", (c) =>
  c.json({ status: "ok", service: "yocaco-backend", timestamp: new Date().toISOString() })
);

// ---- /api/auth & /api/user — shared user-auth router ----
// (auth_route.js is mounted at both prefixes in the Express app too.)
const userAuth = new Hono();
userAuth.post("/register", handle(userAuthController.createUser));
userAuth.post("/login", handle(userAuthController.loginUser));
userAuth.post("/logout", handle(userAuthController.logoutUser));
userAuth.get("/all-users", authMiddleware(), handle(userAuthController.getAllUsers));
userAuth.get("/jobseeker-profile/:id", authMiddleware(), handle(userAuthController.getJobseekerProfile));
userAuth.delete("/delete-user/:uid", authMiddleware(), handle(userAuthController.deleteAcount));
userAuth.get("/experience-distribution", authMiddleware(), handle(userAuthController.getExperienceDistribution));
userAuth.post(
  "/create-jobseeker-profile/:id",
  authMiddleware(),
  handle(userAuthController.createOrUpdateJobseekerProfile)
);
userAuth.get("/get-user-by-id/:id", authMiddleware(), async (c) => {
  try {
    const { id } = c.req.param();
    const user = await userAuthController.getUserById(id);
    return c.json({ success: true, user });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 400);
  }
});
app.route("/api/auth", userAuth);
app.route("/api/user", userAuth);

// ---- /api/admin ----
const adminRoutes = new Hono();
adminRoutes.post("/login", handle(AdminAuthController.login));
adminRoutes.post(
  "/createAdmin",
  authMiddleware(),
  adminMiddleware(),
  handle(AdminAuthController.createAdminUser)
);
adminRoutes.get(
  "/getAllAdminUsers",
  authMiddleware(),
  adminMiddleware(),
  handle(AdminAuthController.getAllAdminUsers)
);
adminRoutes.get("/getAdminUserById/:id", authMiddleware(), adminMiddleware(), async (c) => {
  const adminId = c.req.param("id");
  const user = await AdminAuthController.getAdminUserById(adminId);
  return c.json(user, 200);
});
app.route("/api/admin", adminRoutes);

// ---- /api/jobs ----
const jobs = new Hono();
jobs.get("/getAllJobs", handle(JobController.getAllJobs));
jobs.get("/get-job-by-employer-id/:id", authMiddleware(), handle(JobController.getJobByEmployerId));
jobs.get("/get-job-by-status/:status", handle(JobController.getJobsByStatus));
jobs.get(
  "/get-employer-job-analytics/:id",
  authMiddleware(),
  handle(JobController.getJobAnalytics)
);
jobs.get(
  "/get-job-suggestions-for-seeker",
  authMiddleware(),
  handle(JobController.getJobSuggestionsForSeeker)
);
jobs.get(
  "/get-job-seekers-for-employer",
  authMiddleware(),
  handle(JobController.getJobSeekersForEmployer)
);
jobs.post("/createJob", authMiddleware(), handle(JobController.createJob));
jobs.delete("/deleteJobById/:jobId", authMiddleware(), handle(JobController.deleteJobById));
jobs.put("/updateJobStatus/:id", authMiddleware(), handle(JobController.updateJobStatus));
jobs.put("/updateJob/:id", authMiddleware(), handle(JobController.updateJob));
app.route("/api/jobs", jobs);

// ---- /api/article ----
const article = new Hono();
article.get("/get-all-articles", handle(ArtcleController.getAllArticles));
article.get("/get-article-by-id/:id", handle(ArtcleController.getArticleById));
article.get("/get-articles-by-status/:status", handle(ArtcleController.getArticlesByStatus));
article.get("/get-articles-by-type/:type", handle(ArtcleController.getArticlesByType));
article.post("/create-article", authMiddleware(), handle(ArtcleController.createArticle));
article.put("/update-article/:id", authMiddleware(), handle(ArtcleController.updateArticle));
article.delete("/delete-article/:id", authMiddleware(), handle(ArtcleController.deleteArticle));
article.put(
  "/update-article-status/:id",
  authMiddleware(),
  handle(ArtcleController.updateArticleStatus)
);
app.route("/api/article", article);

// ---- /api/testimonials ----
const testimonials = new Hono();
testimonials.get("/get-testimonials", handle(TestimonialController.getTestimonials));
testimonials.post(
  "/create-testimonials",
  authMiddleware(),
  handle(TestimonialController.addTestimonial)
);
testimonials.delete(
  "/delete-testimonials/:id",
  authMiddleware(),
  handle(TestimonialController.deleteTestimonials)
);
testimonials.put(
  "/update-testimonials/:id",
  authMiddleware(),
  handle(TestimonialController.updateTestimonials)
);
app.route("/api/testimonials", testimonials);

// ---- /api/banner ----
const banner = new Hono();
banner.get("/get-active-banner", handle(BannerController.getActiveBanners));
banner.get("/get-banners", handle(BannerController.getAllBanners));
banner.get("/get-banner-by-id/:id", handle(BannerController.getBannerById));
banner.post("/add-banner", authMiddleware(), handle(BannerController.createBanner));
banner.put("/update-banner/:id", authMiddleware(), handle(BannerController.updateBanner));
banner.delete("/delete-banner/:id", authMiddleware(), handle(BannerController.deleteBanner));
app.route("/api/banner", banner);

// ---- /api/mvc ----
const mvc = new Hono();
mvc.get("/get-mvc", handle(MissionVisionController.getMissionVisionCoreValues));
mvc.post("/create-mvc", authMiddleware(), handle(MissionVisionController.createAll));
mvc.put("/update-mision", authMiddleware(), handle(MissionVisionController.updateMission));
mvc.put("/update-vision", authMiddleware(), handle(MissionVisionController.updateVision));
mvc.put("/update-core-values", authMiddleware(), handle(MissionVisionController.updateCoreValues));
app.route("/api/mvc", mvc);

// ---- /api/cloudinary ----
const cloudinaryRoutes = new Hono();
cloudinaryRoutes.delete(
  "/delete-image/:public_id",
  authMiddleware(),
  handle(CloudinaryController.deleteImage)
);
app.route("/api/cloudinary", cloudinaryRoutes);

// ---- /api/subscription ----
const subscription = new Hono();
subscription.get("/subscription", handle(SubscriptionController.getAllSubscriptions));
subscription.get(
  "/emloyer-subscription/:employerId",
  handle(SubscriptionController.getSubscriptionByEmployerId)
);
subscription.post("/subscribe", authMiddleware(), handle(SubscriptionController.createSubscription));
subscription.delete(
  "/delete-subscription/:id",
  authMiddleware(),
  handle(SubscriptionController.deleteSubscription)
);
subscription.put(
  "/subscription/:userId/:status",
  authMiddleware(),
  handle(SubscriptionController.updateUserSubscription)
);
subscription.put(
  "/subscription-ss/:userID",
  authMiddleware(),
  handle(SubscriptionController.updateSubscription)
);
app.route("/api/subscription", subscription);

// ---- /api/newsletter ----
const newsletter = new Hono();
newsletter.post("/subscribe", handle(NewsletterController.subscribe));
newsletter.get(
  "/subscribers",
  authMiddleware(),
  adminMiddleware(),
  handle(NewsletterController.getSubscribers)
);
newsletter.post("/remove", authMiddleware(), adminMiddleware(), handle(NewsletterController.remove));
app.route("/api/newsletter", newsletter);

// ---- /api/messages ----
const messages = new Hono();
messages.post(
  "/conversations",
  authMiddleware(),
  adminMiddleware(),
  handle(MessagesController.createConversation)
);
messages.get(
  "/conversations",
  authMiddleware(),
  adminMiddleware(),
  handle(MessagesController.getConversations)
);
messages.get(
  "/conversations/:id/messages",
  authMiddleware(),
  adminMiddleware(),
  handle(MessagesController.getMessages)
);
messages.post(
  "/conversations/:id/messages",
  authMiddleware(),
  adminMiddleware(),
  handle(MessagesController.sendMessage)
);
app.route("/api/messages", messages);

// ---- /api/contact ----
const contact = new Hono();
contact.post("/send", handle(ContactController.createMessage));
contact.get("/messages", authMiddleware(), adminMiddleware(), handle(ContactController.getMessages));
contact.put(
  "/messages/:id/read",
  authMiddleware(),
  adminMiddleware(),
  handle(ContactController.markMessage)
);
contact.delete(
  "/messages/:id",
  authMiddleware(),
  adminMiddleware(),
  handle(ContactController.deleteMessage)
);
app.route("/api/contact", contact);

// ---- /api/payment ----
const paymentService = new PaymentService();
const payment = new Hono();
payment.post("/initiate-payment", authMiddleware(), async (c) => {
  const { type, paymentData, meta, subsData } = await parseBody(c);
  const enrichedMeta = {
    ...(meta || {}),
    employerId: (subsData && subsData.employerId) || (meta && meta.employerId),
  };
  try {
    const response = await paymentService.initiatePayment(type, paymentData, enrichedMeta);
    await SubscriptionSer.createSubscription(subsData);
    return c.json({ message: "Payment initiated successfully", response }, 200);
  } catch (error) {
    return c.json({ message: "Payment initiation failed", error: error.message }, 500);
  }
});
payment.post("/webhook/flutterwave", async (c) => {
  const body = await parseBody(c);
  const req = {
    headers: { "verif-hash": c.req.header("verif-hash") || "" },
    body,
  };
  let statusCode = 200;
  let result = { type: "json", data: null };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    send(data) {
      result = { type: "text", data };
      return this;
    },
    json(data) {
      result = { type: "json", data };
      return this;
    },
  };
  await paymentService.handleWebhook(req, res);
  return result.type === "text" ? c.text(result.data, statusCode) : c.json(result.data, statusCode);
});
app.route("/api/payment", payment);

export default app;
