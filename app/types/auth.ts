export enum UserRole {
  ADMIN = "ADMIN",
  CASHIER = "CASHIER",
  WAITSTAFF = "WAITSTAFF",
  STUDENT = "STUDENT",
  WORKER = "WORKER",
}

export enum CustomerType {
  STUDENT = "STUDENT",
  CAMPUS_WORKER = "CAMPUS_WORKER",
}

export interface Student {
  reg_number?: string;
  student_type?: string;
}

// Maps backend role strings to frontend UserRole enum
export function mapApiRoleToUserRole(role?: string | null): UserRole {
  const r = String(role || '').toLowerCase();
  switch (r) {
    case 'admin':
    case 'superadmin':
    case 'super-admin':
      return UserRole.ADMIN;
    case 'cashier':
      return UserRole.CASHIER;
    case 'scanner':
    case 'waitstaff':
    case 'waiter':
    case 'staff':
      return UserRole.WAITSTAFF;
    case 'student':
    case 'client': // map legacy 'client' to student
      return UserRole.STUDENT;
    case 'worker':
    case 'campus_worker':
    case 'campus-worker':
      return UserRole.WORKER;
    default:
      return UserRole.STUDENT;
  }
}

// Maps backend customer type strings to frontend CustomerType enum
export function mapApiCustomerType(customerType?: string | null): CustomerType | null {
  const ct = String(customerType || '').toLowerCase();
  switch (ct) {
    case 'student':
      return CustomerType.STUDENT;
    case 'worker':
    case 'campus_worker':
    case 'campus-worker':
      return CustomerType.CAMPUS_WORKER;
    default:
      return null;
  }
}
