class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong!!",
    errors = [],
    data = null,
    stack = ""
  ) {
    super(message); // Set the message in the parent Error class

    if (
      typeof statusCode !== "number" ||
      statusCode < 400 ||
      statusCode > 599
    ) {
      throw new Error(
        "Invalid status code. It must be a valid HTTP status code."
      );
    }

    this.statusCode = statusCode; // HTTP status code
    this.success = false; // Always false for errors
    this.data = data; // Optional additional data
    this.errors = errors; // Array of detailed error messages or codes
    this.message = message; // Error message

    if (stack) {
      this.stack = stack; // Use the provided stack trace if available
    } else {
      Error.captureStackTrace(this, this.constructor); // Capture stack trace
    }

    Object.freeze(this.success); // Prevent accidental mutation
  }

  toJSON() {
    // Convert the error to a JSON-friendly object
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      errors: this.errors,
      data: this.data,
    };
  }
}

export { ApiError };
