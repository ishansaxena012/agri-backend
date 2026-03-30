import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
  }

  const response = {
    success: false,
    statusCode,
    message,
    errors: err.error || [],
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  };
  console.error(`[Error] ${req.method} ${req.path} >> ${message}`);

  res.status(statusCode).json(response);
};

export default errorMiddleware;