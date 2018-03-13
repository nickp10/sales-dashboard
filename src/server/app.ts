import { Course, EnrollmentsPerDay } from "../interfaces";
import args from "./args";
import * as express from "express";
import * as mysql from "mysql";
import MySQLService from "./mysqlService";
import * as process from "process";
import Timeframe from "./timeframe";
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
        app.get("/getEnrollments", async (req, res) => await this.getEnrollments(req, res, sql, connection));
        app.listen(args.dashboardPort, async () => await this.serverStarted());
    }

    async serverStarted(): Promise<void> {
        console.log(`Server has started on port ${args.dashboardPort}`);
    }

    async getCourses(req: express.Request, res: express.Response, sql: MySQLService, connection: mysql.Connection): Promise<void> {
        const courses = await sql.selectCourses(connection, args.mysqlDatabase);
        res.status(200).send(courses);
    }

    async getEnrollments(req: express.Request, res: express.Response, sql: MySQLService, connection: mysql.Connection): Promise<void> {
        const courseId = utils.coerceInt(req.query.courseId);
        const timeframeFilterName = req.query.timeframeFilterName || "Past 30 Days";
        const enrollmentsMap = new Map<number, Map<number, Map<number, EnrollmentsPerDay>>>();
        if (courseId) {
            const course = await sql.selectCourse(connection, args.mysqlDatabase, courseId);
            await this.getEnrollmentsForCourse(sql, connection, enrollmentsMap, course);
        } else {
            const courses = await sql.selectCourses(connection, args.mysqlDatabase);
            for (const course of courses) {
                await this.getEnrollmentsForCourse(sql, connection, enrollmentsMap, course);
            }
        }
        const enrollments = this.flattenMap(enrollmentsMap, timeframeFilterName);
        res.status(200).send(enrollments);
    }

    async getEnrollmentsForCourse(sql: MySQLService, connection: mysql.Connection, enrollments: Map<number, Map<number, Map<number, EnrollmentsPerDay>>>, course: Course): Promise<void> {
        if (course.teachableName) {
            const teachables = await sql.selectTeachablesByCourseName(connection, args.mysqlDatabase, course.teachableName);
            for (const teachable of teachables) {
                this.updateEnrollments(enrollments, teachable.purchasedAt, course.courseName);
            }
        }
        if (course.udemyName) {
            const udemys = await sql.selectUdemysByCourseName(connection, args.mysqlDatabase, course.udemyName);
            for (const udemy of udemys) {
                this.updateEnrollments(enrollments, udemy.date, course.courseName);
            }
        }
    }

    flattenMap<T extends { date: Date }>(map: Map<number, Map<number, Map<number, T>>>, timeframeFilterName: string): T[] {
        const returnArr: T[] = [];
        for (const [yearKey, yearValue] of map.entries()) {
            for (const [monthKey, monthValue] of yearValue.entries()) {
                for (const [dayKey, dayValue] of monthValue.entries()) {
                    returnArr.push(dayValue);
                }
            }
        }
        const timeframeFilter = Timeframe.getTimeframeFilter(timeframeFilterName);
        return returnArr;//.filter(item => timeframeFilter(item.date)).sort((i1, i2) => i1.date.getTime() - i2.date.getTime());
    }

    updateEnrollments(enrollments: Map<number, Map<number, Map<number, EnrollmentsPerDay>>>, date: Date, courseName: string): void {
        if (!date) {
            return;
        }
        let yearMap = enrollments.get(date.getFullYear());
        if (!yearMap) {
            yearMap = new Map<number, Map<number, EnrollmentsPerDay>>();
            enrollments.set(date.getFullYear(), yearMap);
        }
        let monthMap = yearMap.get(date.getMonth());
        if (!monthMap) {
            monthMap = new Map<number, EnrollmentsPerDay>();
            yearMap.set(date.getMonth(), monthMap);
        }
        let enrollmentsPerDay = monthMap.get(date.getDate());
        if (!enrollmentsPerDay) {
            enrollmentsPerDay = {
                courseName: courseName,
                enrollments: 0,
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate())
            };
            monthMap.set(date.getDate(), enrollmentsPerDay);
        }
        enrollmentsPerDay.enrollments++;
    }
}