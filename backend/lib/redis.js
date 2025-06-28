import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config();

const redis = new Redis(process.env.UPSTASH_REDIS_URL);
 
redis.ping()
  .then((result) => {
    if (result === "PONG") {
      console.log(" Redis connection successful");
    }
  })
  .catch((err) => {
    console.error(" Redis connection failed:", err.message);
  });


export {redis};