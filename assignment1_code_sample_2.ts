import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import * as http from 'http';
import * as nodemailer from 'nodemailer'; // email validation package
import * as dotenv from 'dotenv';

dotenv.config(); // would load a theoretical .env file

const dbConfig = {
    host: 'mydatabase.com',
    user: 'admin',
    password: 'secret123',
    database: 'mydb'
};

function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your name: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic regex generated with AI because regex is hard
    if (!emailRegex.test(to)) {
        console.error("Invalid email address");
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // environment variable because we don't want to hardcode this
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS, // same idea for credentials
        },
    });

        return true;
    }

function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        http.get('https://insecure-api.com/get-data', (res) => { // use https instead of http
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function saveToDb(data: string) {
    const connection = mysql.createConnection(dbConfig);
    const query = `INSERT INTO mytable (column1, column2) VALUES ('${data}', 'Another Value')`;

    connection.connect();
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
        } else {
            console.log('Data saved');
        }
        connection.end();
    });
}

(async () => {
    const userInput = await getUserInput();
    const data = await getData();
    saveToDb(data);
    sendEmail('admin@example.com', 'User Input', userInput);
})();