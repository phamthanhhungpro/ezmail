const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('logstore', 'logstore', 'Logstore@1331', {
    host: '46.250.224.140',
    port: 5432,
    dialect: 'postgres',
});

const MailLog = sequelize.define('MailLog', {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    FromIp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TypeOfAction: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Value: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'MailLog',
    timestamps: false,
});

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

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        appendToFile(`Connection to PostgreSQL has been established successfully.`);
        await MailLog.sync({ alter: true });
        console.log('MailLog table has been synchronized.');
    } catch (error) {
        appendToFile('Unable to connect to the database or synchronize the table:', error.message);
    }
};

module.exports = { sequelize, MailLog, initializeDatabase };
