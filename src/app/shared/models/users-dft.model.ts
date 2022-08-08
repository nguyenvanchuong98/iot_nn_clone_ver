import { BaseData } from "./base-data";
import { CustomerId } from "./id/customer-id";
import { TenantId } from "./id/tenant-id";
import { UserId } from "./id/user-id";
import { Role } from "./role.model";

export interface UsersDft {
  urlAvatar?: any;
  tenantId?: TenantId;
  userId?: string;
  // customerId?: CustomerId;
  customerId?: string;
  firstName: string;
  email: string;
  password: string;
  roleEntity?: Role[];
  roleId?: string[];
  active: boolean;
  createdTime?: number;
  responseCode?: number;
  responseMessage?: string;
  // Bổ sung
  username: string;
  emailLogin: string;
  phone: string;
  authority?: string;
  accountType: string;
  name: string;
  note: string;
}

export interface AdditionalInfo {
  description: string;
  defaultDashboardId?: string;
  defaultDashboardFullscreen?: boolean;
  lastLoginTs?: number;
  failedLoginAttempts?: number;
  userPasswordHistory?: any;
  userCredentialsEnabled?: boolean;
  lang?: string;
}
