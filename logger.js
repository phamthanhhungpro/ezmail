const { Op } = require('sequelize');
const { MailLog } = require('./db');
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

const logRequest = async (fromIp, action, value, typeOfAction) => {
    try {
        // Check for recent log entries within the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentLog = await MailLog.findOne({
            where: {
                FromIp: fromIp,
                Action: action,
                Value: value,
                TypeOfAction: typeOfAction,
                Time: {
                    [Op.gte]: fiveMinutesAgo
                }
            }
        });

        // If no recent log entry found, create a new log entry
        if (!recentLog) {
            await MailLog.create({
                FromIp: fromIp,
                Action: action,
                Value: value,
                TypeOfAction: typeOfAction,
            });
            appendToFile(`Log entry created: ${JSON.stringify({ fromIp, action, value, typeOfAction })}`);
        } 
        else {
        }
    } catch (error) {
        appendToFile(`Error logging request: ${error.message}`);
    }
};

module.exports = logRequest;
