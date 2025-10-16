import * as readline from 'readline';
import * as mysql from 'mysql';
// import { exec } from 'child_process'; // scary
// import * as http from 'http'; // no need to import this anymore, use https instead
import * as https from 'https'
import * as nodemailer from 'nodemailer'; // email validation package
import * as dotenv from 'dotenv';

dotenv.config(); // would load a theoretical .env file

// Storing credentials in plaintext is a huge security risk, known as a
// Cryptographic Failure by OWASP, sensitive data should be stored in a safe 
// environment, that is marked by version control to never enter a production 
// environment.

// const dbConfig = {
//     host: 'mydatabase.com',
//     user: 'admin',
//     password: 'secret123',
//     database: 'mydb'
// };

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};


function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Identification and Authentication Failure, only asks for a name
    // without requiring credentials
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

    try {
        await transporter.sendMail({ //nodemailer method
            from: process.env.SMTP_USER,
            to,
            subject,
            text: body
        });
        return true;
    } catch (error) {
        console.error("Failed to send email:", error)
        return false;
    }

// This getData function doesn't validate or sanitize the data it receives
// from the external API, which could lead to various security issues if
// the data is used in an unsafe manner later on. Falls under A04: Insecure Design
function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get('https://insecure-api.com/get-data', (res) => { // use https instead of http
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function saveToDb(data: string) {
    const connection = mysql.createConnection(dbConfig);

// Huge SQL injection risk, someone could very easily execute a query to find
// confidential data or delete tables. Instead we can use a parameterized query
// with placeholders to prevent this

//     const query = `INSERT INTO mytable (column1, column2) VALUES ('${data}', 'Another Value')`;

//     connection.connect();
//     connection.query(query, (error, results) => {
//         if (error) {
//             console.error('Error executing query:', error);
//         } else {
//             console.log('Data saved');
//         }
//         connection.end();
//     });
// }

    // This query is parameterized, the (?, ?) are placeholder values which
    // let the mysql library know these are data and not code, which prevents
    // query injection.
    const query = "INSERT INTO mytable (column 1, column 2) VALUES (?, ?)";
    connection.connect();
    connection.query(query, [data, 'Another Value'], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
        } else {
            console.log('Data saved');
        }
        connection.end();
    });

(async () => {
    // Insecure Design,
    const userInput = await getUserInput();
    const data = await getData();
    saveToDb(data);
    sendEmail('admin@example.com', 'User Input', userInput);
    }); 
    }
};