import { CreateMembershipDto} from "../../types";

export class MembershipValidator {
  static validateMembershipData(data: CreateMembershipDto) {
    if (!data.name || data.recurringPrice === undefined) {
      throw new Error("missingMandatoryFields");
    }
    if (data.recurringPrice < 0) {
      throw new Error("negativeRecurringPrice");
    }
    if (data.recurringPrice > 100 && data.paymentMethod === "cash") {
      throw new Error("cashPriceBelow100");
    }
    if (data.billingInterval === "monthly") {
      if (data.billingPeriods > 12) {
        throw new Error("billingPeriodsMoreThan12Months");
      }
      if (data.billingPeriods < 6) {
        throw new Error("billingPeriodsLessThan6Months");
      }
    } else if (data.billingInterval === "yearly") {
      if (data.billingPeriods > 10) {
        throw new Error("billingPeriodsMoreThan10Years");
      }
      if (data.billingPeriods < 3) {
        throw new Error("billingPeriodsLessThan3Years");
      }
      // TODO: Do we need to make some validations for weekly memberships?
    } else {
      throw new Error("invalidBillingPeriods");
    }
  }
}
