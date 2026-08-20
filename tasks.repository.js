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


module.exports = { init }