import axios, { AxiosError } from 'axios';

const client = axios.create({
    timeout: 15000,
    headers: {
        Accept: 'application/json, text/plain, */*',
    },
});

const CORS_PROXIES = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
];

function isLikelyCorsError(err: AxiosError) {
    return err.code === 'ERR_NETWORK' ||
        err.message?.includes('CORS') ||
        err.message?.includes('Network Error');
}

async function tryWithProxy(url: string, proxy: string): Promise<any> {
    try {
        const proxiedUrl = `${proxy}${url}`;
        console.warn('Trying CORS proxy:', proxiedUrl);

        const res = await client.get(proxiedUrl, {
            responseType: 'json',
            timeout: 10000
        });
        return res.data;
    } catch (proxyErr) {
        console.warn(`Proxy ${proxy} failed:`, proxyErr);
        throw proxyErr;
    }
}

export async function getJson<T = unknown>(url: string): Promise<T> {
    try {
        const res = await client.get<T>(url, { responseType: 'json' });
        return res.data;
    } catch (err) {
        const axErr = err as AxiosError;

        if (isLikelyCorsError(axErr)) {
            // Intentar con cada proxy hasta que uno funcione
            for (const proxy of CORS_PROXIES) {
                try {
                    const data = await tryWithProxy(url, proxy);
                    return data as T;
                } catch (proxyErr) {
                    // Continuar al siguiente proxy
                    continue;
                }
            }

            throw new Error('All CORS proxies failed. Please try again later.');
        }

        throw err;
    }
}