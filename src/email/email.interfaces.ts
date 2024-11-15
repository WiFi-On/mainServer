export interface emailOutput {
  name: string;
  address: string;
  phone: string;
  id: string;
  comment: string;
  date?: Date;
  email?: string;
}
export interface parsEmail {
  id: number;
  date: Date;
  from: string;
  subject: string;
  body: string;
}
export interface imapConfigI {
  imap: {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
    authTimeout: number;
  };
}
