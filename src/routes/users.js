const express = require('express');
const prisma = require('../database/config')

const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({})
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.post('/', async (req, res) => {
  try {
    const {name, email} = req.body
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
      },
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router