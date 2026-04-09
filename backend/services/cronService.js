const cron = require('node-cron');
const { syncZohoItems } = require('./zohoService');

const initCronJobs = () => {
    // Run at 00:00 (Midnight) every day
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Scheduled Zoho Stock Sync...');
        try {
            await syncZohoItems();
        } catch (error) {
            console.error('Scheduled Zoho Sync Failed:', error);
        }
    });

    console.log('Cron Jobs Initialized: Zoho Sync scheduled for 00:00 daily.');
};

module.exports = {
    initCronJobs
};
