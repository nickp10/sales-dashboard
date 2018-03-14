import { Course, Statement, Teachable, Udemy } from "../interfaces";
import * as mysql from "mysql";
import utils from "../utils";

export default class MySQLService {
    async connect(connectionUri: string | mysql.ConnectionConfig): Promise<mysql.Connection> {
        return new Promise<mysql.Connection>((resolve, reject) => {
            const connection = mysql.createConnection(connectionUri);
            connection.connect((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });
    }

    async disconnect(connection: mysql.Connection): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (connection.state === "connected") {
                connection.end((error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    async selectCourse(connection: mysql.Connection, database: string, id: number): Promise<Course> {
        return new Promise<Course>((resolve, reject) => {
            const sql = `SELECT * FROM \`${database}\`.\`courses\` WHERE \`id\` = ?`;
            connection.query(sql, [ id ], (error, rows) => {
                if (error) {
                    reject(error);
                } else if (!Array.isArray(rows)) {
                    reject("An invalid reponse was returned from the SQL query.");
                } else if (rows.length < 1) {
                    resolve(undefined);
                } else {
                    const row = rows[0];
                    resolve({ id: row["id"], courseName: row["courseName"], teachableName: row["teachableName"], udemyName: row["udemyName"] });
                }
            });
        });
    }

    async selectCourses(connection: mysql.Connection, database: string): Promise<Course[]> {
        return new Promise<Course[]>((resolve, reject) => {
            const sql = `SELECT * FROM \`${database}\`.\`courses\``;
            connection.query(sql, (error, rows) => {
                if (error) {
                    reject(error);
                } else if (!Array.isArray(rows)) {
                    reject("An invalid reponse was returned from the SQL query.");
                } else {
                    resolve(rows.map(row => { return { id: row["id"], courseName: row["courseName"], teachableName: row["teachableName"], udemyName: row["udemyName"] }; }));
                }
            });
        });
    }

    async selectTeachablesByCourseName(connection: mysql.Connection, database: string, courseName: string): Promise<Teachable[]> {
        return new Promise<Teachable[]>((resolve, reject) => {
            const sql = `SELECT * FROM \`${database}\`.\`teachable\` WHERE \`courseName\` = ? ORDER BY \`purchasedAt\` DESC`;
            connection.query(sql, [ courseName ], (error, rows) => {
                if (error) {
                    reject(error);
                } else if (!Array.isArray(rows)) {
                    reject("An invalid reponse was returned from the SQL query.");
                } else {
                    resolve(rows.map(row => { return { id: row["id"], teachableID: row["teachableID"], purchasedAt: utils.coerceDate(row["purchasedAt"]), courseName: row["courseName"], userID: row["userID"], saleID: row["saleID"] }; }));
                }
            });
        });
    }

    async selectUdemysByCourseName(connection: mysql.Connection, database: string, courseName: string): Promise<Udemy[]> {
        return new Promise<Udemy[]>((resolve, reject) => {
            const sql = `SELECT * FROM \`${database}\`.\`Udemy\` WHERE \`courseName\` = ? ORDER BY \`date\` DESC`;
            connection.query(sql, [ courseName ], (error, rows) => {
                if (error) {
                    reject(error);
                } else if (!Array.isArray(rows)) {
                    reject("An invalid reponse was returned from the SQL query.");
                } else {
                    resolve(rows.map(row => { return { id: row["id"], transactionID: row["transactionID"], date: utils.coerceDate(row["date"]), userName: row["userName"], courseName: row["courseName"] }; }));
                }
            });
        });
    }
}
