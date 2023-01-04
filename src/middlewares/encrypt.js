const bcrypt = require('bcrypt')

const encryptPassword = async (req, res, next) => {
  const hash = await bcrypt.hash(req.body.password, 10)
  req.body.password = hash
  next()
}

module.exports = encryptPassword