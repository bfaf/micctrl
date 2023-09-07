import  axios from 'axios';

const PORT = 3123;
const TIMEOUT = 20; // milliseconds

export type IsMuted = 0 | 1;
let ip: string;

export const findServer = async () => {

        const ipMask = '192.168.1.';
        for (let i = 2; i < 254; i++)
        {
            try
            {
                ip = `${ipMask}${i}`;
                const res = await axios.get(`http://${ip}:${PORT}/state`, { timeout: TIMEOUT });

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

export const isServerRunning = async (): Promise<boolean> => {
    if (!ip || ip.length === 0)
    {
        return true; // server is not found yet so skip the check for now
    }
    try
    {

        const res = await axios.get(`http://${ip}:${PORT}/state`, { timeout: TIMEOUT });

        return true;
    }
    catch (e) {
        return false;
    }
};
