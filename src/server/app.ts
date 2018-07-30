import { Course, TransactionsPerDay } from "../interfaces";
import args from "./args";
import * as express from "express";
import * as mysql from "mysql";
import MySQLService from "./mysqlService";
import * as process from "process";
import Timeframe from "../timeframe";
import utils from "../utils";

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
        app.get("/getCourses", async (req, res) => await this.getCourses(req, res, sql, connection));
        app.get("/getPlatforms", async (req, res) => await this.getPlatforms(req, res, sql, connection));
        app.get("/getTimeframeFilterNames", async (req, res) => await this.getTimeframeFilterNames(req, res, sql, connection));
        app.get("/getTransactions", async (req, res) => await this.getTransactions(req, res, sql, connection));
        app.listen(args.dashboardPort, async () => await this.serverStarted());
    }

    async serverStarted(): Promise<void> {
        console.log(`Server has started on port ${args.dashboardPort}`);
    }

    async getCourses(req: express.Request, res: express.Response, sql: MySQLService, connection: mysql.Connection): Promise<void> {
        const courses = await sql.selectCourses(connection, args.mysqlDatabase);
        res.status(200).send(courses);
    }

    async getPlatforms(req: express.Request, res: express.Response, sql: MySQLService, connection: mysql.Connection): Promise<void> {
        res.status(200).send(["All Platforms", "Teachable", "Udemy"]);
    }

    async getTimeframeFilterNames(req: express.Request, res: express.Response, sql: MySQLService, connection: mysql.Connection): Promise<void> {
        const timeframeFilterNames = Timeframe.getTimeframeFilterNames();
        res.status(200).send(timeframeFilterNames);
    }

    async getTransactions(req: express.Request, res: express.Response, sql: MySQLService, connection: mysql.Connection): Promise<void> {
        const courseId = utils.coerceInt(req.query.courseId);
        const platform = req.query.platform;
        const timeframeFilterName = req.query.timeframeFilterName;
        const map = new Map<number, Map<number, Map<number, TransactionsPerDay>>>();
        if (courseId) {
            const course = await sql.selectCourse(connection, args.mysqlDatabase, courseId);
            await this.getTransactionsForCourse(sql, connection, map, course, platform);
        } else {
            const courses = await sql.selectCourses(connection, args.mysqlDatabase);
            for (const course of courses) {
                await this.getTransactionsForCourse(sql, connection, map, course, platform);
            }
        }
        const flatMap = this.flattenMap(map, timeframeFilterName);
        res.status(200).send(flatMap);
    }

    async getTransactionsForCourse(sql: MySQLService, connection: mysql.Connection, map: Map<number, Map<number, Map<number, TransactionsPerDay>>>, course: Course, platform: string): Promise<void> {
        if ((!platform || platform === "All Platforms" || platform === "Teachable") && course.teachableName) {
            const transactions = await sql.getTeachableTransactions(connection, args.mysqlDatabase, course.teachableName);
            for (const transaction of transactions) {
                this.updateTransactionsMap(map, transaction.purchasedAt, transaction.earningsUSD / 100, course.courseName);
            }
        }
        if ((!platform || platform === "All Platforms" || platform === "Udemy") && course.udemyName) {
            const transactions = await sql.getUdemyTransactions(connection, args.mysqlDatabase, course.udemyName);
            for (const transaction of transactions) {
                this.updateTransactionsMap(map, transaction.date, transaction.instructorShare, course.courseName);
            }
        }
    }

    flattenMap(map: Map<number, Map<number, Map<number, TransactionsPerDay>>>, timeframeFilterName: string): TransactionsPerDay[] {
        const transactions: TransactionsPerDay[] = [];
        for (const [yearKey, yearValue] of map.entries()) {
            for (const [monthKey, monthValue] of yearValue.entries()) {
                for (const [dayKey, dayValue] of monthValue.entries()) {
                    transactions.push(dayValue);
                }
            }
        }
        const timeframeFilter = Timeframe.getTimeframeFilter(timeframeFilterName);
        return transactions.filter(t => timeframeFilter(t.date)).sort((i1, i2) => i1.date.getTime() - i2.date.getTime());
    }

    updateTransactionsMap(map: Map<number, Map<number, Map<number, TransactionsPerDay>>>, date: Date, salePrice: number, courseName: string): void {
        if (!date || !salePrice) {
            return;
        }
        let yearMap = map.get(date.getFullYear());
        if (!yearMap) {
            yearMap = new Map<number, Map<number, TransactionsPerDay>>();
            map.set(date.getFullYear(), yearMap);
        }
        let monthMap = yearMap.get(date.getMonth());
        if (!monthMap) {
            monthMap = new Map<number, TransactionsPerDay>();
            yearMap.set(date.getMonth(), monthMap);
        }
        let transactionsPerDay = monthMap.get(date.getDate());
        if (!transactionsPerDay) {
            transactionsPerDay = {
                courseTransactions: [],
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate())
            };
            monthMap.set(date.getDate(), transactionsPerDay);
        }
        const courseTransactionsArr = transactionsPerDay.courseTransactions;
        let courseTransactions = courseTransactionsArr.find(c => c.courseName === courseName);
        if (!courseTransactions) {
            courseTransactions = {
                courseName: courseName,
                totalEnrollments: 0,
                totalSales: 0
            };
            courseTransactionsArr.push(courseTransactions);
        }
        courseTransactions.totalEnrollments++;
        courseTransactions.totalSales += salePrice;
    }
}
