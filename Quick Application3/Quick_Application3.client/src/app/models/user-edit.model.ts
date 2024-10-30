// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { User } from './user.model';

export class UserEdit extends User {
  constructor(
    public currentPassword?: string, // For updating an existing user's password
    public newPassword?: string, // For setting a new password
    public confirmPassword?: string, // For confirming the new password
    public password?: string // For sign-up
  ) {
    super();
  }


}
