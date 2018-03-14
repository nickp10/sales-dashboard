import * as moment from "moment";

export class Timeframe {
    getTimeframeFilterNames(): string[] {
        return [
            "Past 30 Days",
            "This Month",
            "Last Month",
            "Last 3 Months",
            "Last 6 Months",
            "Last 12 Months",
            "This Year",
            "Beginning Of Time"
        ];
    }

    getTimeframeFilter(filterName: string): (date: Date) => boolean {
        switch (filterName) {
            case "Past 30 Days": return this.past30Days;
            case "This Month": return this.thisMonth;
            case "Last Month": return this.lastMonth;
            case "Last 3 Months": return this.last3Months;
            case "Last 6 Months": return this.last6Months;
            case "Last 12 Months": return this.last12Months;
            case "This Year": return this.thisYear;
        }
        return (date) => true;
    }

    past30Days(date: Date): boolean {
        const compare = moment();
        compare.subtract(30, "days");
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    thisMonth(date: Date): boolean {
        const compare = new Date();
        return compare.getFullYear() === date.getFullYear() && compare.getMonth() === date.getMonth();
    }

    lastMonth(date: Date): boolean {
        const compare = moment();
        compare.subtract(1, "months");
        return compare.year() === date.getFullYear() && compare.months() === date.getMonth();
    }

    last3Months(date: Date): boolean {
        const compare = moment();
        compare.subtract(3, "months");
        compare.days(1);
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    last6Months(date: Date): boolean {
        const compare = moment();
        compare.subtract(6, "months");
        compare.days(1);
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    last12Months(date: Date): boolean {
        const compare = moment();
        compare.subtract(12, "months");
        compare.days(1);
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    thisYear(date: Date): boolean {
        const compare = new Date();
        return compare.getFullYear() === date.getFullYear();
    }
}

export default new Timeframe();
