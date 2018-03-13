import args from "./args";
import * as express from "express";
import * as mysql from "mysql";
import MySQLService from "./mysqlService";
import * as process from "process";

export default class App {
    async connect(sql: MySQLService): Promise<mysql.Connection> {
        try {
            return await sql.connect({
                host: args.mysqlHost,
                port: args.mysqlPort,
                user: args.mysqlUser,
                password: args.mysqlPassword
            });
        } catch (error) {
            console.log(error.message);
            process.exit();
        }
    }

    async startServer(): Promise<void> {
        const sql = new MySQLService();
        const connection = await this.connect(sql);
        const app = express();
        app.use(express.static(__dirname));
        app.get("/getData", async (req, res) => await this.getData(req, res, sql, connection));
        app.listen(args.dashboardPort, async () => await this.serverStarted());
    }

    async serverStarted(): Promise<void> {
        console.log(`Server has started on port ${args.dashboardPort}`);
    }

    async getData(req: express.Request, res: express.Response, sql: MySQLService, connection: mysql.Connection): Promise<void> {
        const courses = await sql.selectCourses(connection, args.mysqlDatabase);
        res.status(200).send([ courses.length, courses.length + 1, courses.length - 1]);
    }
}