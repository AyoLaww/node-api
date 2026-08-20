const pool = require('./pool')

async function init(){
    await pool.query(
        `CREATE TABLE IF NOT EXISTS tasks(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0
        )`
    )

    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM tasks')
    const count = parseInt(rows[0].count, 10)

    if (count === 0){
        const tasks = [
            {"title": "Get money", "done": false},
            {"title": "Buy groceries", "done": true},
            {"title": "Complete project", "done": false}
        ]

        for (const task of tasks) {
            await pool.query(
                `INSERT INTO tasks (title, done) VALUES ($1, $2)`,
                [task.title, task.done ? 1 : 0]
            )
        }
    }
}

async function getAll(){
    const { rows } = await pool.query(`SELECT * FROM tasks`)
    return rows
}

async function getById(id){
    const { rows } = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id])
    return rows[0] || null
}

module.exports = { init, getAll, getById }