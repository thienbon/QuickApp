import { PermissionValues } from './permission.model';

export interface SignupResponse {
  id_token: string; // Token for the new user
  access_token: string; // Access token for authenticated requests
  expires_in: number; // Expiration time for the access token
  refresh_token?: string; // Optional refresh token, if applicable
  token_type: string; // Type of the token (usually "Bearer")
  scope: string; // Scopes granted to the access token
  user: IdToken; // User details decoded from the id_token
}
export interface IdToken {
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
  iss: string; // Issuer of the token
  aud: string | string[]; // Audience of the token
  sub: string; // Subject (user ID)
  role: string | string[]; // User roles
  permission: PermissionValues | PermissionValues[]; // User permissions
  name: string; // User's name
  email: string; // User's email
  phone_number: string; // User's phone number
  fullname: string; // User's full name
  jobtitle: string; // User's job title
  configuration: string; // Additional configuration, if needed
}
