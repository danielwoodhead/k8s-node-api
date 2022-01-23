export interface ValidationError {
  message: "Validation failed";
  details: { [name: string]: unknown };
}
