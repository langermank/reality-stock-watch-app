export namespace Auth {
  export interface Users {
    instance_id: string;
    id: string;
    aud: string;
    role: string;
    email: string;
    encrypted_password: string;
    email_confirmed_at: string;
    invited_at: string;
  }
}
