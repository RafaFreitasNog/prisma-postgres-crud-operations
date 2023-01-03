const e = require('express');
const express = require('express')
const prisma = require('../database/config')
const router = express.Router();

//GET ROUTES

//GET all
router.get('/', async (req, res) => {
  try {
    const notes = await prisma.notes.findMany({})
    res.status(200).json(notes)
  } catch (error) {
    res.status(500).json(error)
  }
})

//GET by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const note = await prisma.notes.findUnique({
      where: {
        id: parseInt(id),
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, body } = req.body
    const note = await prisma.notes.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title: title,
        body: body,
      },
    })
    res.status(201).json(note)
  } catch (error) {
    res.status(500).json(error)
  }
})

// DELETE ROUTES

//Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    try {
      const note = await prisma.notes.delete({
        where: {
          id: parseInt(id),
        },
      })
      res.status(200).json(note)
    } catch (error) {
      res.status(400).json({message: "Record does not exist"})
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router