const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const cors = require('cors');

// Allow all origins
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const endpoint = "https://www.1secmail.com/api/v1/";

// Define a route to handle requests for a new email
app.get('/api/new-email', async (req, res) => {
    try {
        const response = await axios.get(`${endpoint}?action=genRandomMailbox`);
        if(1==1) {
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
        const response = await axios.get(`${endpoint}?action=readMessage&login=${login}&domain=${domain}&id=${messageId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
