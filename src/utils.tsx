import  axios from 'axios';

const PORT = 3123;
const TIMEOUT = 1000; // milliseconds
const SEARCH_TIMEOUT = 1000;
const REUSE_TIMEOUT = 2000;

export type IsMuted = 0 | 1;
let ip: string;

export const findServer = async (cb: (ip: number) => void) => {
        const ipMask = '192.168.1.';
        for (let i = 2; i <= 254; i++)
        {
            try
            {
                cb(i);
                ip = `${ipMask}${i}`;
                const url = `http://${ip}:${PORT}/state`;
                const res = await axios.get(url, { timeout: SEARCH_TIMEOUT });

                return ip;
            }
            catch(e) {} // ignore intentionally
        }
        
        return null; // error if reached here
};

export const getMicState = async (): Promise<IsMuted> => {
    try
    {
        const res = await axios.get(`http://${ip}:${PORT}/state`, { timeout: TIMEOUT });

        return res.data.isMuted;
    }
    catch (e) {}

    return 0;
}

export const switchMicState = async (): Promise<void> => {
    try
    {
        await axios.put(`http://${ip}:${PORT}/switch`, { timeout: TIMEOUT });
    }
    catch (e)
    {
        throw e;
    }
};

export const isServerRunning = async (ipToCheck: string): Promise<boolean> => {
    try
    {
        ip = ipToCheck;
        const url = `http://${ip}:${PORT}/state`
        await axios.get(url, { timeout: REUSE_TIMEOUT });

        return true;
    }
    catch (e)
    {
        console.error(e);
        return false;
    }
};
