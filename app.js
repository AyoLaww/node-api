const express = require('express')
const app = express()
const port = 3000
const swaggerUi = require('swagger-ui-express')
const openapiSpec = require('./openapi.json')


app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))

const tasks = [
    {"id": 1, "title": "Task one", "done": false},
    {"id": 2, "title": "Task two", "done": false},
    {"id": 3, "title": "Task three", "done": false}
]

app.get('/', (req, res) => {
    res.json({
        "name": "Task API",
        "version": "1.0",
        "endpoints": ["/tasks"]
    })
})


app.get('/health', (req, res) => {
    res.json({
        "status": "ok",
    })
})

app.get('/tasks', (req, res) => {
    res.json(tasks)
})

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10)
    const task = tasks.find(t => t.id === taskId)
    
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

    const newTask = {
     id: tasks.length + 1,
     title,
     done: false
    }

    tasks.push(newTask)
    res.status(201).json(newTask)

})

app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10)
    const task = tasks.find(t => t.id === taskId)

    if(!task){
        return res.status(404).json({"error": "Task ID not found"})
    }

    const { title, done } = req.body

    if(!title || typeof title !== 'string' || title.trim() === '' ){
        return res.status(400).json({"error": "Title has to be a string and should not be empty"})
    }

    if(typeof done !== 'boolean'){
        return res.status(400).json({"error": "Title has to be a boolean"})
    }

    task.title = title
    task.done = done
    res.json(task)
})

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10)
    const taskIndex = tasks.findIndex(t => t.id === taskId)

    if(taskIndex === -1 ){
        return res.status(404).json({"error": "Task ID not found"})
    }

    tasks.splice(taskIndex, 1)
    res.status(204).send()
})

app.listen(port, ()=>{
    console.log(`Example app listening on port ${port}`)
})