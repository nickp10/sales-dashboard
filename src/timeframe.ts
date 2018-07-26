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
            case "Past 30 Days": return this.isInPast30Days;
            case "This Month": return this.isInThisMonth;
            case "Last Month": return this.isInLastMonth;
            case "Last 3 Months": return this.isInLast3Months;
            case "Last 6 Months": return this.isInLast6Months;
            case "Last 12 Months": return this.isInLast12Months;
            case "This Year": return this.isInThisYear;
        }
        return (date) => true;
    }

    private isInPast30Days(date: Date): boolean {
        const compare = moment();
        compare.subtract(30, "days");
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    private isInThisMonth(date: Date): boolean {
        const compare = new Date();
        return compare.getFullYear() === date.getFullYear() && compare.getMonth() === date.getMonth();
    }

    private isInLastMonth(date: Date): boolean {
        const compare = moment();
        compare.subtract(1, "months");
        return compare.year() === date.getFullYear() && compare.month() === date.getMonth();
    }

    private isInLast3Months(date: Date): boolean {
        const compare = moment();
        compare.subtract(3, "months");
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    private isInLast6Months(date: Date): boolean {
        const compare = moment();
        compare.subtract(6, "months");
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    private isInLast12Months(date: Date): boolean {
        const compare = moment();
        compare.subtract(12, "months");
        compare.hours(0);
        compare.minutes(0);
        compare.seconds(0);
        compare.milliseconds(0);
        return date.getTime() > compare.valueOf();
    }

    private isInThisYear(date: Date): boolean {
        const compare = new Date();
        return compare.getFullYear() === date.getFullYear();
    }

    getTimeframeEarliestDate(filterName: string): Date {
        switch (filterName) {
            case "Past 30 Days": return this.getPast30DaysEarliest();
            case "This Month": return this.getThisMonthEarliest();
            case "Last Month": return this.getLastMonthEarliest();
            case "Last 3 Months": return this.getLast3MonthsEarliest();
            case "Last 6 Months": return this.getLast6MonthsEarliest();
            case "Last 12 Months": return this.getLast12MonthsEarliest();
            case "This Year": return this.getThisYearEarliest();
        }
        return new Date();
    }

    private getPast30DaysEarliest(): Date {
        const earliest = moment();
        earliest.subtract(30, "days");
        earliest.hours(0);
        earliest.minutes(0);
        earliest.seconds(0);
        earliest.milliseconds(0);
        return earliest.toDate();
    }

    private getThisMonthEarliest(): Date {
        const earliest = moment().startOf("month");
        earliest.hours(0);
        earliest.minutes(0);
        earliest.seconds(0);
        earliest.milliseconds(0);
        return earliest.toDate();
    }

    private getLastMonthEarliest(): Date {
        const earliest = moment().startOf("month");
        earliest.subtract(1, "months");
        earliest.hours(0);
        earliest.minutes(0);
        earliest.seconds(0);
        earliest.milliseconds(0);
        return earliest.toDate();
    }

    private getLast3MonthsEarliest(): Date {
        const earliest = moment();
        earliest.subtract(3, "months");
        earliest.hours(0);
        earliest.minutes(0);
        earliest.seconds(0);
        earliest.milliseconds(0);
        return earliest.toDate();
    }

    private getLast6MonthsEarliest(): Date {
        const earliest = moment();
        earliest.subtract(6, "months");
        earliest.hours(0);
        earliest.minutes(0);
        earliest.seconds(0);
        earliest.milliseconds(0);
        return earliest.toDate();
    }

    private getLast12MonthsEarliest(): Date {
        const earliest = moment();
        earliest.subtract(12, "months");
        earliest.hours(0);
        earliest.minutes(0);
        earliest.seconds(0);
        earliest.milliseconds(0);
        return earliest.toDate();
    }

    private getThisYearEarliest(): Date {
        const earliest = moment().startOf("year");
        earliest.hours(0);
        earliest.minutes(0);
        earliest.seconds(0);
        earliest.milliseconds(0);
        return earliest.toDate();
    }

    getTimeframeLatestDate(filterName: string): Date {
        switch (filterName) {
            case "Past 30 Days": return new Date();
            case "This Month": return new Date();
            case "Last Month": return this.getLastMonthLatest();
            case "Last 3 Months": return new Date();
            case "Last 6 Months": return new Date();
            case "Last 12 Months": return new Date();
            case "This Year": return new Date();
        }
        return new Date();
    }

    private getLastMonthLatest(): Date {
        const now = moment();
        now.subtract(1, "months");
        const lastMonth = now.endOf("month");
        lastMonth.hours(23);
        lastMonth.minutes(59);
        lastMonth.seconds(59);
        lastMonth.milliseconds(999);
        return lastMonth.toDate();
    }
}

export default new Timeframe();
