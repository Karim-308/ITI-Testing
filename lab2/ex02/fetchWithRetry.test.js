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

});
