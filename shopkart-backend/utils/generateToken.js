const jwt = require('jsonwebtoken');

const generateToken = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });
};

module.exports = generateToken;