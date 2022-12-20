const express = require('express');
const prisma = require('../database/config')
const router = express.Router();


//GET ROUTES

//GET all
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({})
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json(error)
  }
})

//GET by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (user) {
      res.status(200).json(user)
    } else {
      res.status(200).json({message: 'No user found for this id'})
    }

  } catch (error) {
    res.status(500).json(error)
    console.log(error);
  }
})

//GET by email
router.get('/byemail/:email', async (req, res) => {
  try {
    const { email } = req.params
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })
    
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(200).json({message: 'No user found for this email'})
    }

} catch (error) {
  res.send(500).json(error)
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
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router