import { createClient } from "redis";
import { env } from "./env.js";


const redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redis: Max retries reached. Connection failed.');
                return new Error('Redis connection lost');
            }
            return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000, 
    }
});

redisClient.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
        console.warn('Redis Connection Reset: Attempting to reconnect...');
    } else {
        console.error('Redis Client Error:', err);
    }
});

(async () => {
    try {
        await redisClient.connect();
        console.log('✅ Redis Connected');
    } catch (err) {
        console.error('❌ Redis initial connection failed:', err);
    }
})();

export default redisClient;