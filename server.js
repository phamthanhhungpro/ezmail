const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const cors = require('cors');
const { initializeDatabase, MailVisitorLog } = require('./db');
const logRequest = require('./logger');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, 'logs.txt');

// Function to append logs to the file
const appendToFile = (message) => {
    fs.appendFile(logFilePath, message + '\n', (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

// Allow all origins
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));
// Trust the proxy to get the correct client IP address
app.set('trust proxy', true);

app.use(async (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip = clientIp.split(',')[0];
    const visitDate = moment().format('YYYY-MM-DD');

    try {
        // Check if the IP already exists for today
        const existingLog = await MailVisitorLog.findOne({
            where: {
                ipAddress: ip,
                visitDate: visitDate
            }
        });

        if (!existingLog) {
            // If not, insert the new IP
            await MailVisitorLog.create({ ipAddress: ip, visitDate: visitDate });
        }
    } catch (err) {
        appendToFile(`Can not log visitor ${err}`);
    }

    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const endpoint = "https://www.1secmail.com/api/v1/";

// Define a route to handle requests for a new email
app.get('/api/new-email', async (req, res) => {
    try {
        const response = await axios.get(`${endpoint}?action=genRandomMailbox`);
        if (1 == 1) {
            const [login, domain] = response.data[0].split('@');

            var arr = [login];
            return res.json(arr);
        }

        return res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// get list mail in mailbox
app.get('/api/list-mail', async (req, res) => {
    try {
        const email = req.query.email;

        const [login, domain] = email.split('@');
        const response = await axios.get(`${endpoint}?action=getMessages&login=${login}&domain=${domain}`);

        // Log the response
        try {
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            await logRequest(clientIp.split(',')[0], 'response', `Nhận email từ ${email}`, JSON.stringify(response.data));
        } catch (error) {
            console.error('Error logging request:', error);
        }

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get content of the mail by id
app.get('/api/mail/:id', async (req, res) => {
    try {
        const email = req.query.email;
        const [login, domain] = email.split('@');
        const messageId = req.params.id;

        // Log the request
        try {
            const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            await logRequest(clientIp.split(',')[0], 'request', `Đọc nội dung tin nhắn từ email ${email}`, messageId);
        } catch (error) {
            console.error('Error logging request:', error);
        }
        const response = await axios.get(`${endpoint}?action=readMessage&login=${login}&domain=${domain}&id=${messageId}`);

        // Log the response
        try {
            const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            await logRequest(clientIp.split(',')[0], 'response', `Nội dung tin nhắn từ email ${email}`, JSON.stringify(response.data));
        } catch (error) {
            console.error('Error logging request:', error);
        }
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/visitor-count', async (req, res) => {
    const date = req.query.date || moment().format('YYYY-MM-DD');

    try {
        const count = await VisitorLog.count({
            where: {
                visitDate: date
            }
        });
        res.json({ date, count });
    } catch (err) {
        console.error('Error fetching visitor count:', err);
        res.status(500).send('Internal Server Error');
    }
});

initializeDatabase()
    .finally(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    });
