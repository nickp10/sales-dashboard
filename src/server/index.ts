import args from "./args";
import * as express from "express";
import * as process from "process";

const app = express();
app.use(express.static(__dirname));
app.listen(args.dashboardPort, () => {
    console.log(`Server started on port ${args.dashboardPort}`);
});
