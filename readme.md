# Koi Logs SDK
Koi is a network designed to reward and help to coordinate the creation of public data resources. Install the SDK to register your gateway to the network and begin receiving traffic awards when you contribute logging data.


# Example 

```
import 'colors';
import express, { Express } from 'express';
import { config } from 'dotenv';
import { corsMiddleware } from './middleware/cors.middleware';
import { jsonMiddleware } from './middleware/json.middleware';
import { logMiddleware } from './middleware/log.middleware';
import { startSync } from './database/sync.database';
import { logsHelper, logsTask } from './utility/log.helper';
import cron from 'node-cron';

config();

export const app: Express = express();

export function start() {
  app.set(`trust proxy`, 1);
  app.use(corsMiddleware);
  app.use(jsonMiddleware);
  app.use(logMiddleware);

  cron.schedule('0 0 * * *', async function() {
    console.log('running the log cleanup task once per day on ', new Date () );
    var result = await logsTask()
    console.log('daily log task returned ', result)
  });

  app.get("/logs", logsHelper);
  app.get("/trigger-logs-dev", logsTask); // delete this in prod
  app.all('/', );

  app.listen(process.env.PORT || 3000, () => {
    log.info(`[app] started on http://localhost:${process.env.PORT || 3000}`);
  });
}


(async () => await start())();
```