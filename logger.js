const { Op } = require('sequelize');
const { MailLog } = require('./db');

const logRequest = async (fromIp, typeOfAction, action, value) => {
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
            console.log('Log entry created:', { fromIp, action, value, typeOfAction });
        } else {
            console.log('Duplicate log entry detected, skipping:', { fromIp, action, value, typeOfAction });
        }
    } catch (error) {
        console.error('Error logging request:', error);
    }
};

module.exports = logRequest;