export interface Membership {
  id: number;
  uuid: string;
  name: string;
  userId: number;
  recurringPrice: number;
  validFrom: Date;
  validUntil: Date;
  state: string;
  paymentMethod: string | null;
  billingInterval: string;
  billingPeriods: number;
}

export interface CreateMembershipResponse extends Membership {
  id: number;
  uuid: string;
}


export interface CreateMembershipDto {
  name: string;
  recurringPrice: number;
  validFrom?: string | Date;
  paymentMethod: string | null;
  billingInterval: string;
  billingPeriods: number;
}
