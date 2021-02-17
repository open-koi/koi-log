import 'colors';
import express, { Express } from 'express';
// import { config } from 'dotenv';
import { koiLogMiddleware, koiLogsDailyTask, koiLogsHelper } from './index.ts';

// config();

// initialize an express server
export const app: Express = express();

export function start() {

  // add koi tasks
  app.use(koiLogMiddleware);
  app.get("/logs", koiLogsHelper);
  koiLogsDailyTask() // start the daily log task

  // start the server listener
  app.listen(process.env.PORT || 3000, () => {
    log.info(`[app] started on http://localhost:${process.env.PORT || 3000}`);
  });
}


(async () => await start())();