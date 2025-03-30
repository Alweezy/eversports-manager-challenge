import { MembershipRepository } from "../repositories/membership.repository";
import { MembershipPeriodRepository } from "../repositories/membership-period.repository";
import { CreateMembershipDto, CreateMembershipResponse, Membership, MembershipPeriod } from "../types";
import { MembershipValidator } from "../utils/validators/membership.validator";

export class MembershipService {
  private membershipRepository: MembershipRepository;
  private membershipPeriodRepository: MembershipPeriodRepository;

  constructor(membershipRepository: MembershipRepository, membershipPeriodRepository: MembershipPeriodRepository) {
    this.membershipRepository = membershipRepository;
    this.membershipPeriodRepository = membershipPeriodRepository;
  }

  async createMembership(data: CreateMembershipDto): Promise<{ membership: CreateMembershipResponse; membershipPeriods: MembershipPeriod[] }> {
    MembershipValidator.validateMembershipData(data);

    try {
      const userId = 2000;
      const validFrom = new Date(data.validFrom || new Date());
      const validUntil = new Date(validFrom);

      switch (data.billingInterval) {
        case "monthly":
          validUntil.setMonth(validFrom.getMonth() + data.billingPeriods);
          break;
        case "yearly":
          validUntil.setFullYear(validFrom.getFullYear() + data.billingPeriods);
          break;
        case "weekly":
          validUntil.setDate(validFrom.getDate() + data.billingPeriods * 7);
          break;
      }

      let state: "pending" | "active" | "expired" = "active";
      const now = new Date();

      if (validFrom > now) {
        state = "pending";
      } else if (validUntil < now) {
        state = "expired";
      }

      // moved from uuid to crypto.randomUUID 👉 see README.md
      const newMembership: CreateMembershipResponse = {
        id: this.membershipRepository.getNextId(),
        uuid: crypto.randomUUID(),
        name: data.name,
        userId: userId,
        recurringPrice: data.recurringPrice,
        validFrom,
        validUntil,
        state,
        paymentMethod: data.paymentMethod,
        billingInterval: data.billingInterval,
        billingPeriods: data.billingPeriods,
      };

      await this.membershipRepository.create(newMembership);

      const newMembershipPeriods: MembershipPeriod[] = [];
      // let periodStart = validFrom;

      let periodStart = new Date(validFrom);

      for (let i = 0; i < data.billingPeriods; i++) {
        const periodStartCopy = new Date(periodStart);
        const periodEnd = new Date(periodStartCopy);

        switch (data.billingInterval) {
          case "monthly":
            periodEnd.setMonth(periodStartCopy.getMonth() + 1);
            break;
          case "yearly":
            periodEnd.setFullYear(periodStartCopy.getFullYear() + 1);
            break;
          case "weekly":
            periodEnd.setDate(periodStartCopy.getDate() + 7);
            break;
        }

        const period: MembershipPeriod = {
          membership: newMembership.id,
          start: periodStartCopy,
          end: periodEnd,
          state: 'planned',
        };

        newMembershipPeriods.push(period);
        periodStart = new Date(periodEnd);
      }

      await this.membershipPeriodRepository.createMany(newMembershipPeriods);

      return { membership: newMembership, membershipPeriods: newMembershipPeriods };
    } catch (error) {
      console.error("Error creating membership:", error);
      throw error;
    }
  }

  async getAllMemberships(): Promise<{ membership: CreateMembershipResponse; periods: MembershipPeriod[] }[]> {
    const memberships = await this.membershipRepository.getAll();

    return Promise.all(memberships.map(async (membership) => {
      const periods = await this.membershipPeriodRepository.getByMembershipId(membership.id);

      return {
        membership,
        periods: periods.map(p => ({
          start: new Date(p.start),
          end: new Date(p.end),
          membership: p.membership,
          state: p.state,
        })),
      };
    }));
  }
}
