export interface IApiResponse<T = unknown> {
    resultCode?:
      | "Ok"
      | "Error"
      | "Fail"
      | "NotFound"
      | "Reject"
      | "Forbidden"
      | "Duplicate"
      | "Unauthorized"
      | "ValidationError"
      | "BadRequest"
      | "WrongCaptcha";
    success?: boolean; // true if API considers it successful
    messages?: string[]; // Optional array of success/error messages
    errorMessage?: string; // Optional single error message
    data?: T; // The actual payload
    payload?: T;
    responseData?: T; // Some APIs may use 'payload' instead
    status?: number;
  }
