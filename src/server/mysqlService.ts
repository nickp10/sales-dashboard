import { Course, Statement, Teachable, Udemy } from "./interfaces";
import * as mysql from "mysql";

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
}
