import express, {NextFunction, Request, Response} from "express";
import { body, validationResult } from "express-validator";
import { MembershipService } from "../services/membership.service";
import { MembershipRepository } from "../repositories/membership.repository";
import { MembershipPeriodRepository } from "../repositories/membership-period.repository";

const router = express.Router();

// let's instantiate the service with the necessary repositories
const membershipRepository = new MembershipRepository();
const membershipPeriodRepository = new MembershipPeriodRepository();
const membershipService = new MembershipService(membershipRepository, membershipPeriodRepository);

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("missingMandatoryFields"),
    body("recurringPrice").isFloat({ min: 0 }).withMessage("negativeRecurringPrice"),
    body("paymentMethod").optional().isIn(["cash", "credit card", "paypal"]),
    body("billingInterval").isIn(["weekly", "monthly", "yearly"]).withMessage("invalidBillingPeriods"),
    body("billingPeriods").isInt({ min: 1 }).withMessage("invalidBillingPeriods"),
    body("validFrom").optional().isISO8601().toDate(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { membership, membershipPeriods } = await membershipService.createMembership(req.body);
      res.status(201).json({ membership, membershipPeriods });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberships = await membershipService.getAllMemberships();
    res.status(200).json(memberships);
  } catch (error) {
    next(error);
  }
});

export default router;
