import { MembershipService } from "../membership.service";
import { membershipRepositoryMock } from "./mocks/membership.repository.mock";
import { membershipPeriodRepositoryMock } from "./mocks/membership-period.repository.mock";

jest.mock("../../repositories/membership.repository", () => ({
  MembershipRepository: jest.fn().mockImplementation(() => membershipRepositoryMock),
}));

jest.mock("../../repositories/membership-period.repository", () => ({
  MembershipPeriodRepository: jest.fn().mockImplementation(() => membershipPeriodRepositoryMock),
}));

describe("MembershipService", () => {
  let membershipService: MembershipService;

  beforeEach(() => {
    membershipService = new MembershipService(
      membershipRepositoryMock as any,
      membershipPeriodRepositoryMock as any
    );
    jest.clearAllMocks();
  });

  describe("createMembership", () => {
    it("should create a new membership and membership periods with valid data", async () => {
      const validData = {
        name: "New Membership",
        recurringPrice: 75,
        billingInterval: "yearly",
        billingPeriods: 5,
        validFrom: new Date(),
        paymentMethod: null,
      };
      const expectedValidUntil = new Date(validData.validFrom);
      expectedValidUntil.setFullYear(expectedValidUntil.getFullYear() + 5);
      membershipRepositoryMock.getNextId = jest.fn(() => 1001);
      membershipRepositoryMock.create.mockResolvedValue({
        id: 1001,
        ...validData,
        validFrom: new Date(validData.validFrom),
        validUntil: expectedValidUntil,
        userId: 2000,
      });

      membershipPeriodRepositoryMock.create.mockResolvedValue([
        { membershipId: 1001, state: "planned" },
      ]);
      const result = await membershipService.createMembership(validData);
      await expect(membershipRepositoryMock.getNextId).toHaveBeenCalled();
      await expect(membershipRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1001 })
      );
      await expect(membershipPeriodRepositoryMock.createMany).toHaveBeenCalled();

      expect(result.membership).toBeDefined();
      expect(result.membership.name).toBe(validData.name);
      expect(result.membership.validFrom.toISOString()).toBe(validData.validFrom.toISOString());
      expect(result.membership.validUntil.toISOString()).toBe(expectedValidUntil.toISOString());
    });

    it("should throw an error for missing name", async () => {
      const invalidData = {
        recurringPrice: 50,
        billingInterval: "monthly",
        billingPeriods: 6,
        paymentMethod: null,
      } as any;

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("missingMandatoryFields");
    });

    it("should throw an error for negative recurring price", async () => {
      const invalidData = {
        name: "Basic Membership",
        recurringPrice: -10,
        billingInterval: "monthly",
        billingPeriods: 6,
        paymentMethod: "credit card",
      };

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("negativeRecurringPrice");
    });

    it("should throw an error when cash payment exceeds 100", async () => {
      const invalidData = {
        name: "Premium Membership",
        recurringPrice: 150,
        billingInterval: "yearly",
        billingPeriods: 5,
        paymentMethod: "cash",
      };

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("cashPriceBelow100");
    });

    it("should throw an error for monthly billing periods greater than 12", async () => {
      const invalidData = {
        name: "Extended Membership",
        recurringPrice: 50,
        billingInterval: "monthly",
        billingPeriods: 13,
        paymentMethod: "credit card",
      };

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("billingPeriodsMoreThan12Months");
    });

    it("should throw an error for monthly billing periods less than 6", async () => {
      const invalidData = {
        name: "Short Membership",
        recurringPrice: 50,
        billingInterval: "monthly",
        billingPeriods: 5,
        paymentMethod: "credit card",
      };

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("billingPeriodsLessThan6Months");
    });

    it("should throw an error for yearly billing periods greater than 10", async () => {
      const invalidData = {
        name: "Long Membership",
        recurringPrice: 75,
        billingInterval: "yearly",
        billingPeriods: 11,
        paymentMethod: "credit card",
      };

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("billingPeriodsMoreThan10Years");
    });

    it("should throw an error for yearly billing periods less than 3", async () => {
      const invalidData = {
        name: "Too Short Membership",
        recurringPrice: 75,
        billingInterval: "yearly",
        billingPeriods: 2,
        paymentMethod: "credit card",
      };

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("billingPeriodsLessThan3Years");
    });

    it("should throw an error for an invalid billing interval", async () => {
      const invalidData = {
        name: "Invalid Interval Membership",
        recurringPrice: 75,
        billingInterval: "daily",
        billingPeriods: 10,
        paymentMethod: "credit card",
      };

      await expect(membershipService.createMembership(invalidData))
        .rejects.toThrow("invalidBillingPeriods");
    });
  });

  describe("getAllMemberships", () => {
    it("should return all memberships with their periods", async () => {
      membershipRepositoryMock.getAll.mockResolvedValue([
        {
          id: 1,
          uuid: crypto.randomUUID(),
          name: "Test Membership",
          recurringPrice: 100,
          billingInterval: "monthly",
          billingPeriods: 6,
          validFrom: new Date("2025-01-15"),
          validUntil: new Date("2024-07-15"),
          paymentMethod: "paypal",
          state: "active",
          userId: 2000,
        },
      ]);

      membershipPeriodRepositoryMock.getByMembershipId.mockResolvedValue([
        { membershipId: 1, state: "planned" },
      ]);

      const result = await membershipService.getAllMemberships();

      expect(membershipRepositoryMock.getAll).toHaveBeenCalled();
      expect(membershipPeriodRepositoryMock.getByMembershipId).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
