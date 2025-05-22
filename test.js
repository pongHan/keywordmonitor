//const mysql = require('mysql');
const mysql = require('mysql2/promise');

async function connectDB() {
    const connection = await mysql.createConnection({
        host: 'giant0510.cafe24.com',
        user: 'giant0510',
        password: 'ftp@7788',
        database: 'giant0510',
    });

    const [rows] = await connection.execute('SELECT * sns_code');
    console.log(rows);

    await connection.end();
}

connectDB().catch(console.error);
