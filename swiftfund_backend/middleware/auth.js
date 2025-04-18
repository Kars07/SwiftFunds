module.exports.protect = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authorized. Please log in." });
  }
  req.user = { id: req.session.userId }; // Attach user info to the request object
  next();
};