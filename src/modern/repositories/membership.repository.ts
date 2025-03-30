import { Membership } from "../types";
import { IMembershipRepository } from "../types";
import fs from "fs";
import path from "path";

const membershipsFile = path.join(__dirname, "../../data/memberships.json");

export class MembershipRepository implements IMembershipRepository {
  private memberships: Membership[];

  constructor() {
    this.memberships = this.loadMemberships();
  }

  private loadMemberships(): Membership[] {
    try {
      const data = fs.readFileSync(membershipsFile, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading memberships JSON:", error);
      return [];
    }
  }

  async getAll(): Promise<Membership[]> {
    return this.memberships;
  }

  async create(membership: Membership): Promise<Membership> {
    this.memberships.push(membership);
    return membership;
  }

  getNextId(): number {
    return this.memberships.length > 0 ? Math.max(...this.memberships.map(m => m.id)) + 1 : 1;
  }
}
