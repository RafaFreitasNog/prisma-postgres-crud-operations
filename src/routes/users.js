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
      include: {
        written_posts: true,
      },
    })

    if (user) {
      res.status(200).json(user)
    } else {
      res.status(200).json({message: 'No user found with this id'})
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

//POST ROUTES

//Register
router.post('/', async (req, res) => {
  try {
    const {name, email} = req.body
    try {
      const user = await prisma.user.create({
        data: {
          name: name,
          email: email,
        },
      })
      res.status(201).json(user)
    } catch (error) {
      res.status(400).json({message: "E-mail already in use"})
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

//PUT ROUTES

//Edit user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email } = req.body
    try {
      const user = await prisma.user.update({
        where: {
          id: parseInt(id)
        },
        data: {
          name: name,
          email: email,
        }
      })
      res.status(200).json(user)
    } catch (error) {
      res.status(400).json({message: "E-mail already in use"})
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

//DELETE ROUTES

//Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const deleteUserNotes = prisma.notes.deleteMany({
      where: {
        userId: parseInt(id),
      },
    })
    const deleteUser = prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    })
    const transaction = await prisma.$transaction([deleteUserNotes, deleteUser])

    res.status(200).json(transaction)

  } catch (error) {
    res.status(500).json(error)
    console.log(error);
  }
})

module.exports = router