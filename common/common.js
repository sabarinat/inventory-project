
const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

module.exports = { sendResponse };
