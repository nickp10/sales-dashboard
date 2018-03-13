import * as argv from "argv";
import * as path from "path";
import * as process from "process";
import utils from "../utils";

export class Args {
    dashboardPort: number;
    mysqlHost: string;
    mysqlPort: number;
    mysqlDatabase: string;
    mysqlUser: string;
    mysqlPassword: string;

    constructor() {
        const args = argv
            .option({ name: "dashboard-port", short: "p", type: "string" })
            .option({ name: "mysql-host", type: "string" })
            .option({ name: "mysql-port", type: "number" })
            .option({ name: "mysql-database", type: "string" })
            .option({ name: "mysql-user", type: "string" })
            .option({ name: "mysql-password", type: "string" })
            .run();
        const argDashboardPort = utils.coerceInt(args.options["dashboard-port"]);
        const argMysqlHost = args.options["mysql-host"];
        const argMysqlPort = utils.coerceInt(args.options["mysql-port"]);
        const argMysqlDatabase = args.options["mysql-database"];
        const argMysqlUser = args.options["mysql-user"];
        const argMysqlPassword = args.options["mysql-password"];
        this.validate(argDashboardPort, argMysqlHost, argMysqlPort, argMysqlDatabase, argMysqlUser, argMysqlPassword);
    }

    validate(argDashboardPort: number, argMysqlHost: string, argMysqlPort: number, argMysqlDatabase: string, argMysqlUser: string, argMysqlPassword: string): void {
        // Validate dashboard-port
        this.dashboardPort = argDashboardPort || 8000;
        if (!this.dashboardPort) {
            console.error("The -p or --dashboard-port argument must be supplied.");
            process.exit();
        }

        // Validate mysql-host
        this.mysqlHost = argMysqlHost || "localhost";
        if (!this.mysqlHost) {
            console.error("The --mysql-host argument must be supplied.");
            process.exit();
        }

        // Validate mysql-port
        this.mysqlPort = argMysqlPort || 3306;
        if (!this.mysqlPort) {
            console.error("The --mysql-port argument must be supplied.");
            process.exit();
        }

        // Validate mysql-database
        this.mysqlDatabase = argMysqlDatabase || "sales";
        if (!this.mysqlDatabase) {
            console.error("The --mysql-database argument must be supplied.");
            process.exit();
        }

        // Validate mysql-user
        this.mysqlUser = argMysqlUser || "root";
        if (!this.mysqlUser) {
            console.error("The --mysql-user argument must be supplied.");
            process.exit();
        }

        // Validate mysql-password
        this.mysqlPassword = argMysqlPassword || "";
    }
}

export default new Args();
