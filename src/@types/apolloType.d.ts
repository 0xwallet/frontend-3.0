export type Session = {
  token: string;
  // User: TodoUser;
  User: IUser;
};
// 目前实现的 response
export type IUser = {
  id: string;
  username: string;
  wallets: Array<{ tags: string[] }>;
};

export type TodoUser = {
  avatar: string;
  bio: string;
  channels: [Channel];
  driveSetting: DriveUserSetting;
  email: string;
  emails: [Email];
  id: string;
  lastLoginAt: string;
  messageNknAddress: string;
  organizationInvitations: [OrganizationInvitation];
  organizations: [Organization];
  personalInfo: PersonalInfo;
  role: Role;
  setting: Setting;
  type: UserType;
  username: string;
  wallets: [Wallet];
};

export type Channel = {
  id: string;
  name: string;
  organization: Organization;
  type: Visible;
  users: [TodoUser];
};

export type Visible = "PUBLIC" | "PRIVATE";

export type DriveUserSetting = {
  availableSpace: string;
  totalSpace: string;
  usedSpace: string;
};

export type Email = {
  address: string;
  status: EmailStatus;
  tag: EmailTag;
  user: TodoUser;
};

export type EmailStatus = "INACTIVATED" | "ACTIVATED";

export type EmailTag = "DEFAULT_EMAIL";

export type Organization = {
  channels: [Channel];
  id: string;
  info: OrganizationInfo;
  kanbanColumns: [KanbanColumn];
  name: string;
  users: [TodoUser];
};

export type OrganizationInfo = {
  country: string;
};

export type OrganizationInvitation = {
  id: string;
  message: string;
  organization: Organization;
  status: InvitationStatus;
  user: TodoUser;
};

export type InvitationStatus = "WAITING" | "AGREED" | "REJECTED" | "DELETED";

export type PersonalInfo = {
  country: string;
  creditCard: CreditCard;
  passport: string;
  phoneNumber: string;
};

export type CreditCard = {
  month: string;
  name: string;
  number: string;
  securityCode: string;
  year: string;
};

export type Role = "ADMIN" | "MEMBER" | "OWNER";

export type Setting = {
  currency: Currency;
  insertedAt: string;
  updatedAt: string;
  user: TodoUser;
};

export type Currency = "CNY" | "USD";

export type KanbanColumn = {
  id: string;
  items: [KanbanItem];
  name: string;
  organization: Organization;
  position: number;
};

export type UserType = "ISSUER" | "BASIC";

export type Wallet = {
  description: string;
  id: string;
  info: WalletInfo;
  tags: [WalletTag];
  type: WalletType;
  user: TodoUser;
};

export type WalletInfo = {
  identifier: string;
  publicKey: string;
};

export type WalletTag = "LOGIN" | "MESSAGE";

export type WalletType = "BSV" | "NKN";

export type KanbanItem = {
  column: KanbanColumn;
  id: string;
  info: KanbanItemInfo;
  insertedAt: string;
  organization: Organization;
  position: number;
  updatedAt: string;
};

export type KanbanItemInfo = "Share" | "Task";
