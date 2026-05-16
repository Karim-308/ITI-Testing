const apiClient = require('./apiClient');

async function fetchWithRetry(maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiClient.getData();
        } catch (err) {
            lastError = err;
        }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

module.exports = { fetchWithRetry };
