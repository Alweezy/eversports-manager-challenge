import { MembershipPeriod } from "./membership-period";

export interface IMembershipPeriodRepository {
  getByMembershipId(membershipId: number): Promise<MembershipPeriod[]>;
  createMany(periods: MembershipPeriod[]): Promise<MembershipPeriod[]>;
}
