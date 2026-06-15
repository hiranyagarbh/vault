// technically redudant since we have our own error handler and Express ver 5 natively catches rejected promises from async route handlers
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export default asyncHandler;