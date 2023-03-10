const jwt = require('jsonwebtoken');

const User = require('../models/User');

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  //search for user's session (or user with refresh token) in db by refreshToken
  const foundUser = await User.findOne({ refreshToken }).exec();

  //verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || decoded.userName !== foundUser.userName) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    //create new access token
    const payload = {
      userInfo: {
        userName: foundUser.userName,
        roles: Object.values(foundUser.roles),
      },
    };
    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 60 * 5,
    });
    //CHANGE expiresIn: ON PRODUCTION!!!

    res.json({ accessToken: newAccessToken });
  });
};

module.exports = { handleRefreshToken };
