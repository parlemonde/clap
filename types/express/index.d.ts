declare namespace Express {
  interface Request {
    currentLocale: string;
    locales?: { [key: string]: string };
    user?: import("../../server/entities/user").User;
    getCsrfToken(): string;
    csrfToken: string;
    isCsrfValid: boolean;
  }
  interface Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendJSON: (object: any) => void;
  }
}