import { Role, UserType } from '@/enum/user';

type CreditCard = {
  month?: string;
  name?: string;
  number?: string;
  securityCode?: string;
  year?: string;
}

type PersonInfo = {
  country?: string;
  creditCard?: CreditCard;
  passport?: string;
  phoneNumber?: string;
}

type User = {
  id?: string;
  avatar?: string;
  email?: string;
  loginNknAddress?: string;
  personInfo?: PersonInfo;
  role?: Role;
  type?: UserType;
};

export type Account = { token?: string; user?: User };
