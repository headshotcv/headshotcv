import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import jobsRouter from "./jobs.js";
import paymentsRouter from "./payments.js";
import aiRouter from "./ai.js";
import feedbackRouter from "./feedback.js";
import cvRouter from "./cv.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(paymentsRouter);
router.use(aiRouter);
router.use(feedbackRouter);
router.use(cvRouter);
router.use(adminRouter);

export default router;
