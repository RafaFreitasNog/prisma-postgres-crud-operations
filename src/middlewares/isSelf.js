const isSelf = async (req, res, next) => {
  const { id } = req.params
  const reqId = req.reqUser.id
  if (id == reqId) {
    next()
  } else {
    res.status(401).json({message: "You don't have this permission"})
  }
}

module.exports = isSelf