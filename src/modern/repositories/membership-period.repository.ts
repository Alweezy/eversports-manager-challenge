import { MembershipPeriod } from "../types";
import { IMembershipPeriodRepository } from "../types";
import fs from "fs";
import path from "path";

const periodsFile = path.join(__dirname, "../../data/membership-periods.json");

export class MembershipPeriodRepository implements IMembershipPeriodRepository {
  private membershipPeriods: MembershipPeriod[];

  constructor() {
    this.membershipPeriods = this.loadMembershipPeriods();
  }

  private loadMembershipPeriods(): MembershipPeriod[] {
    try {
      const data = fs.readFileSync(periodsFile, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading membership periods JSON:", error);
      return [];
    }
  }

  async getByMembershipId(membershipId: number): Promise<MembershipPeriod[]> {
    return this.membershipPeriods.filter(p => p.membership === membershipId);
  }

  async createMany(periods: MembershipPeriod[]): Promise<MembershipPeriod[]> {
    this.membershipPeriods.push(...periods);
    return periods;
  }
}
