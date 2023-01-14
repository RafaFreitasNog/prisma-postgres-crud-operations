const jwt = require('jsonwebtoken');
const prisma = require('../database/config');
const jwtSecret = process.env.JWT_SECRET;

const authenticateUser = async (req, res, next) => {
  const token = req.headers['authtoken']

  if (!token) {
    res.status(401).json({message: 'Unauthorized: no token provided'})
  } else {
    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        res.status(401).json({message: 'Unauthorized: invalid token'})
      } else {
        const findUser = await prisma.user.findUnique({
          where: {
            id: decoded.id,
          },
        })
        delete findUser.password;
        req.reqUser = findUser
        next()
      }
    })
  }
}

module.exports = authenticateUser