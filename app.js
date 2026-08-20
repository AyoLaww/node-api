const express = require('express')
const app = express()
const port = 3000
const swaggerUi = require('swagger-ui-express')
const openapiSpec = require('./openapi.json')

const taskRepo = require('./tasks.repository')

app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))

app.get('/health', (req, res) => {
    res.json({
        "status": "ok",
    })
})

app.get('/tasks', async (req, res) => {
    const tasks = await taskRepo.getAll()
    res.json(tasks)
})


app.get('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id, 10)
    const task = await taskRepo.getById(taskId)
    
    if(!task){
        return res.status(404).json({"error": "Task ID not found"})
    }

    res.json(task)
})

app.post('/tasks', (req, res) => {
    const { title } = req.body

    if(!title){
        return res.status(400).json({"error": "Title is required"})
    }

    const result = insertTask.run(title, 0)
    const newId = result.lastInsertRowid

    const newTask = {
     id: newId,
     title,
     done: false
    }

    res.status(201).json(newTask)

})

app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10)
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId)

    if(!row){
        return res.status(404).json({"error": "Task ID not found"})
    }

    const { title, done } = req.body

    if(!title || typeof title !== 'string' || title.trim() === '' ){
        return res.status(400).json({"error": "Title has to be a string and should not be empty"})
    }

    if(typeof done !== 'boolean'){
        return res.status(400).json({"error": "Has to be a boolean"})
    }

    editRow.run(title, done ? 1 : 0, taskId)

    const updatedRow = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId)
    
    const updatedTask = {
        id: updatedRow.id,
        title: updatedRow.title,
        done: !!updatedRow.done
    }

    res.json(updatedTask)
})

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10)
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId)

    if(!row){
        return res.status(404).json({"error": "Task ID not found"})
    }

    deleteRow.run(taskId)
    res.status(204).send()
})

taskRepo.init()
    .then(() => {
        app.listen(port, () => {
            console.log(`Example app is listening on port: ${port}`)
        })
    })
    .catch (err => {
        console.error("Failed to start:", err)
        process.exit(1)  
    })