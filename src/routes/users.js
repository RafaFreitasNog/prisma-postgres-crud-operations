const express = require('express');
const prisma = require('../database/config');
const encryptPassword = require('../middlewares/encrypt');
const authenticateUser = require('../middlewares/autheticate')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isSelf = require('../middlewares/isSelf');
const revalidateUser = require('../middlewares/revalidate');
const jwtSecret = process.env.JWT_SECRET;


//GET ROUTES

//GET all
router.get('/', authenticateUser, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
      }
    })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json(error)
    console.log(error);
  }
})

//revalidate
router.get('/revalidate', revalidateUser, async (req, res) => {
  res.status(200).json(req.reqUser)
})

//GET following
router.get('/following', revalidateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.reqUser.id
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })
    res.status(200).json(user.following)
  } catch (error) {
    res.status(500).json(error)
  }
})

//GET followers
router.get('/followers', revalidateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.reqUser.id
      },
      include: {
        followers: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })
    res.status(200).json(user.followers)
  } catch (error) {
    res.status(500).json(error)
  }
})

//GET by id
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            written_posts: true,
            followers: true,
            following: true
          }
        }
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
router.get('/byemail/:email', authenticateUser, async (req, res) => {
  try {
    const { email } = req.params
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        created_at: true,
        updated_at: true,
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
router.post('/', encryptPassword, async (req, res) => {
  try {
    const {name, username, email, password} = req.body
    try {
      const user = await prisma.user.create({
        data: {
          name: name,
          username: username,
          email: email,
          password: password
        },
      })
      delete user.password
      res.status(201).json(user)
    } catch (error) {
      res.status(400).json({message: "E-mail already in use"})
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

//Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
      include: {
        _count: {
          select: {
            written_posts: true
          }
        }
      }
    })

    if (!user) {
      res.status(400).json({message: 'No user found for this email'})
    } else {
      if (!password) {
        res.status(400).json({message: 'No password provided'})
      } else {        
        const same = await bcrypt.compare(password, user.password)
        if (same) {
          const token = jwt.sign({ id: user.id}, jwtSecret, { expiresIn: '1d' })
          delete user.password
          res.status(200).json({ user, token })
        } else {
          res.status(400).json({message: "Incorrect password"})
        }
      }
    }
  } catch (error) {
    res.status(500).json({message: error})
  }
})

//PUT ROUTES

//Follow 
router.put('/follow/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.update({
      where: {
        id: req.reqUser.id
      },
      data: {
        following: {
          connect: {
            id: id
          }
        }
      }
    })
    delete user.password
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json(error)
  }
})

//Edit info
router.put('/:id', authenticateUser, isSelf, async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, username } = req.body
    try {
      const user = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          email: email,
          username: username
        }
      })
      delete user.password
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
router.delete('/:id', authenticateUser, isSelf, async (req, res) => {
  try {
    const { id } = req.params

    const deleteUserNotes = prisma.notes.deleteMany({
      where: {
        userId: id,
      },
    })
    const deleteUser = prisma.user.delete({
      where: {
        id: id,
      },
    })
    try {
      const transaction = await prisma.$transaction([deleteUserNotes, deleteUser])
      res.status(200).json()
    } catch (error) {
      res.status(400).json({message: "No user found"})
    }

  } catch (error) {
    res.status(500).json(error)
    console.log(error);
  }
})

module.exports = router