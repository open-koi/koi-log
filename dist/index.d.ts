import { Request, Response } from 'express';
import cron from 'node-cron';
interface ExpressApp {
    use: Function;
    get: Function;
}
export declare const joinKoi: (app: ExpressApp) => Promise<void>;
export declare const koiLogsHelper: (req: Request, res: Response) => void;
export declare const koiLogsDailyTask: () => cron.ScheduledTask;
export declare const logsTask: () => Promise<unknown>;
export {};
