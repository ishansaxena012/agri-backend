import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.errors.map((err) => err.message);
    throw new ApiError(400, "Validation Failed", errorMessages);
  }
  req.validatedBody = result.data;
  next();
};

export default validate;