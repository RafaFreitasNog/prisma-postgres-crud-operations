const express = require('express')
const prisma = require('../database/config')
const router = express.Router();
const authenticateUser = require('../middlewares/autheticate')

//GET ROUTES

//GET all
router.get('/', authenticateUser, async (req, res) => {
  try {
    const notes = await prisma.notes.findMany({})
    res.status(200).json(notes)
  } catch (error) {
    res.status(500).json(error)
  }
})

//GET by author
router.get('/by/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const notes = await prisma.notes.findMany({
      where: {
        userId: id,
      },
    })
    res.status(200).json(notes)
  } catch (error) {
    res.status(500).json(error)
    console.log(error);
  }
})

//GET by id
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const note = await prisma.notes.findUnique({
      where: {
        id: id,
      },
      include: {
        author: true,
      },
    })
    if (!note) {
      res.status(400).json({message: "No notes found for this id"})
    } else {
      res.status(200).json(note)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

//POST ROUTES

//Post new note
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title, body, userId } = req.body
    const note = await prisma.notes.create({
      data: {
        title: title,
        body: body,
        userId: userId
      }
    })
    res.status(201).json(note)
  } catch (error) {
    res.status(500).json(error)
  }
})

//PUT ROUTES

//Edit note
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const { title, body } = req.body
    const note = await prisma.notes.findUnique({
      where: {
        id: id
      }
    })
    if (!note) {
      res.status(400).json({message: 'Record does not exist'})
    } else {

      const checkIfOwner = isOwner(req.reqUser.id, note.userId)
      if (checkIfOwner) {        
        const updatedNote = await prisma.notes.update({
          where: {
            id: id,
          },
          data: {
            title: title,
            body: body,
          },
        })
        res.status(200).json(updatedNote)
      } else {
        res.status(401).json({message: 'You dont have permission to edit this record'})
      }

    }
  } catch (error) {
    res.status(500).json(error)
  }
})

// DELETE ROUTES

//Delete note
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const note = await prisma.notes.findUnique({
      where: {
        id: id
      }
    })
    if (!note) {
      res.status(400).json({message: 'Record does not exist'})
    } else {

      const checkIfOwner = isOwner(req.reqUser.id, note.userId)
      if (checkIfOwner) {        
        const deletedNote = await prisma.notes.delete({
          where: {
            id: id,
          },
        })
        res.status(200).json(deletedNote)
      } else {
        res.status(401).json({message: 'You dont have permission to edit this record'})
      }

    }
  } catch (error) {
    res.status(500).json(error)
  }
})

function isOwner(reqUserId, noteUserId) {
  if (reqUserId == noteUserId) {
    return true
  } else {
    return false
  }
}

module.exports = router