const express = require('express')
const app = express()
const port = 3000
const swaggerUi = require('swagger-ui-express')
const openapiSpec = require('./openapi.json')

const db = require('better-sqlite3')('tasks.db')

app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))

const tasks = [
    {"id": 1, "title": "Get money", "done": false},
    {"id": 2, "title": "Buy groceries", "done": true},
    {"id": 3, "title": "Complete project", "done": false}
]

const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)')
const editRow = db.prepare(`UPDATE tasks SET title = ?, done = ? WHERE id = ?`)
const deleteRow = db.prepare(`DELETE FROM tasks WHERE id = ?`)

const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get()

if(count === 0 ){
    const insert = db.prepare(
        `
        INSERT INTO tasks (id, title, done)
        VALUES (@id, @title, @done)
        `
    )

    const insertMany = db.transaction((taskList) => {
    for (const task of taskList){
            insert.run({
                id: task.id,
                title: task.title,
                done: task.done ? 1 : 0 
                })
        }
    })

    insertMany(tasks)
}


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
    const rows = db.prepare('SELECT * FROM tasks').all()
    const tasks = rows.map(row => ({
        id: row.id,
        title: row.title,
        done: !!row.done
    }))
    res.json(tasks)
})

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10)
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId)
    
    if(!row){
        return res.status(404).json({"error": "Task ID not found"})
    }

    const task = {
        id: row.id,
        title: row.title,
        done: !!row.done
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

app.listen(port, ()=>{
    console.log(`Example app listening on port ${port}`)
})