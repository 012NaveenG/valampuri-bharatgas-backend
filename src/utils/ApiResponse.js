class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 400; // More explicit success range
    this.timestamp = new Date().toISOString(); // Add a timestamp for debugging and logging
  }
}

export { ApiResponse };
