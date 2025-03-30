import { Membership } from "./membership";

export interface IMembershipRepository {
  getAll(): Promise<Membership[]>;
  create(membership: Membership): Promise<Membership>;
}
