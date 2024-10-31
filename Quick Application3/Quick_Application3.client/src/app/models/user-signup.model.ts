export interface Signup {
  id: string;
  userName: string;
  fullName: string;
  jobTitle: string;
  newPassword: string;
  roles: string[];
  email?: string;
  firstName?: string;
  lastName?: string;
}
