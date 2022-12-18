const UserRouter = require('./src/routes/users')
const NotesRouter = require('./src/routes/notes')

const { urlencoded } = require('express');
const express = require('express')

const app = express();

app.listen(3001, () => console.log('Express server is running 🚀'))

app.use(express.json())
app.use(urlencoded({extended: true}))

app.use('/users', UserRouter);
app.use('/notes', NotesRouter);