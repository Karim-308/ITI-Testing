const { fetchWithRetry } = require('./fetchWithRetry');
const apiClient = require('./apiClient');

jest.mock('./apiClient');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('fetchWithRetry', () => {

    it('returns data when first attempt succeeds', async () => {
        apiClient.getData.mockResolvedValue({ data: 'something' });

        const result = await fetchWithRetry();

        expect(result).toEqual({ data: 'something' });
        expect(apiClient.getData).toHaveBeenCalledTimes(1);
    });

    it('returns data when first attempt fails and second succeeds', async () => {
        apiClient.getData
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce({ data: 'something' });

        const result = await fetchWithRetry();

        expect(result).toEqual({ data: 'something' });
        expect(apiClient.getData).toHaveBeenCalledTimes(2);
    });

    it('throws after all 3 attempts fail', async () => {
        apiClient.getData.mockRejectedValue(new Error('server down'));

        await expect(fetchWithRetry()).rejects.toThrow('Failed after 3 attempts: server down');
        expect(apiClient.getData).toHaveBeenCalledTimes(3);
    });

    it('throws after 1 attempt when maxRetries is 1', async () => {
        apiClient.getData.mockRejectedValue(new Error('server down'));

        await expect(fetchWithRetry(1)).rejects.toThrow('Failed after 1 attempts: server down');
        expect(apiClient.getData).toHaveBeenCalledTimes(1);
    });

    it('first two fail and third succeeds - returns the data', async () => {
        apiClient.getData
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail again'))
            .mockResolvedValueOnce({ data: 'finally' });

        const result = await fetchWithRetry();

        expect(result).toEqual({ data: 'finally' });
    });

    it('first two fail and third succeeds - called exactly 3 times', async () => {
        apiClient.getData
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail again'))
            .mockResolvedValueOnce({ data: 'finally' });

        await fetchWithRetry();

        expect(apiClient.getData).toHaveBeenCalledTimes(3);
    });

    it('maxRetries 2, both fail - called exactly 2 times', async () => {
        apiClient.getData.mockRejectedValue(new Error('bad'));

        await expect(fetchWithRetry(2)).rejects.toThrow();

        expect(apiClient.getData).toHaveBeenCalledTimes(2);
    });

    it('maxRetries 2, both fail - error says Failed after 2 attempts', async () => {
        apiClient.getData.mockRejectedValue(new Error('bad'));

        await expect(fetchWithRetry(2)).rejects.toThrow('Failed after 2 attempts: bad');
    });

    it('maxRetries 5, all fail - called 5 times', async () => {
        apiClient.getData.mockRejectedValue(new Error('down'));

        await expect(fetchWithRetry(5)).rejects.toThrow();

        expect(apiClient.getData).toHaveBeenCalledTimes(5);
    });

    it('maxRetries 5, 4th attempt succeeds - called 4 times', async () => {
        apiClient.getData
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce({ data: 'ok' });

        await fetchWithRetry(5);

        expect(apiClient.getData).toHaveBeenCalledTimes(4);
    });

    it('maxRetries 5, 4th attempt succeeds - returns the data', async () => {
        apiClient.getData
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce({ data: 'ok' });

        const result = await fetchWithRetry(5);

        expect(result).toEqual({ data: 'ok' });
    });

    it('the original error message is included in the thrown error', async () => {
        apiClient.getData.mockRejectedValue(new Error('database is on fire'));

        await expect(fetchWithRetry()).rejects.toThrow('database is on fire');
    });

    it('a different original error message is also preserved', async () => {
        apiClient.getData.mockRejectedValue(new Error('timeout after 30s'));

        await expect(fetchWithRetry()).rejects.toThrow('timeout after 30s');
    });

    it('returns the exact data object that getData gives back', async () => {
        const payload = { user: 'ali', age: 25, active: true };
        apiClient.getData.mockResolvedValue(payload);

        const result = await fetchWithRetry();

        expect(result).toEqual(payload);
    });

    it('maxRetries 2, first succeeds - getData called only once not twice', async () => {
        apiClient.getData.mockResolvedValue({ data: 'fast' });

        await fetchWithRetry(2);

        expect(apiClient.getData).toHaveBeenCalledTimes(1);
    });

    it('maxRetries 4, first 3 fail and 4th succeeds - called 4 times', async () => {
        apiClient.getData
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce({ data: 'done' });

        await fetchWithRetry(4);

        expect(apiClient.getData).toHaveBeenCalledTimes(4);
    });

    it('maxRetries 4, all fail - error says Failed after 4 attempts', async () => {
        apiClient.getData.mockRejectedValue(new Error('gone'));

        await expect(fetchWithRetry(4)).rejects.toThrow('Failed after 4 attempts: gone');
    });

    it('first attempt success with maxRetries 3 - getData not called a second time', async () => {
        apiClient.getData.mockResolvedValue({ ok: true });

        await fetchWithRetry(3);

        expect(apiClient.getData).toHaveBeenCalledTimes(1);
    });

});
