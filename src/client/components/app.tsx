import { Button, Form, FormControl } from "react-bootstrap";
import { Course, CourseTransaction, TransactionsPerDay } from "../../interfaces";
import { ChartData, ChartOptions, TimeDisplayFormat, TimeUnit } from "chart.js";
import { Component } from "react";
import { Line } from "react-chartjs-2";
import * as moment from "moment";
import * as React from "react";
import Timeframe from "../../timeframe";

export interface AppProperties {
}

export interface AppState {
    error?: string;
    isLoaded?: boolean;
    courses?: Course[];
    frequencyNames?: { key: TimeUnit, label: string }[];
    platforms?: string[];
    selectedCourse?: number;
    selectedFrequency?: TimeUnit;
    selectedPlatform?: string;
    selectedTimeframeFilter?: string;
    transactions?: TransactionsPerDay[];
    timeframeFilterNames?: string[];
}

export default class App extends Component<AppProperties, AppState> {
    constructor(props: AppProperties, context?: any) {
        super(props, context);
        this.state = {
            error: "",
            isLoaded: false,
            courses: [],
            frequencyNames: [{
                key: "day",
                label: "Daily"
            }, {
                key: "week",
                label: "Weekly"
            }, {
                key: "month",
                label: "Monthly"
            }, {
                key: "quarter",
                label: "Quarterly"
            }, {
                key: "year",
                label: "Yearly"
            }],
            platforms: [],
            selectedFrequency: "day",
            transactions: [],
            timeframeFilterNames: []
        };
    }

    async componentDidMount(): Promise<void> {
        try {
            const res1 = await fetch("/getCourses");
            const courses = await res1.json();
            const res2 = await fetch("/getTimeframeFilterNames");
            const timeframeFilterNames = await res2.json();
            const res3 = await fetch("/getPlatforms");
            const platforms = await res3.json();
            const transactions = await this.fetchTransactions(this.state.selectedCourse, platforms[0], timeframeFilterNames[0]);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: courses,
                    frequencyNames: previousState.frequencyNames,
                    platforms: platforms,
                    selectedCourse: previousState.selectedCourse,
                    selectedFrequency: previousState.selectedFrequency,
                    selectedPlatform: platforms[0],
                    selectedTimeframeFilter: timeframeFilterNames[0],
                    timeframeFilterNames: timeframeFilterNames,
                    transactions: transactions
                };
            });
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    error: error.message
                };
            });
        }
    }

    async fetchTransactions(selectedCourse: number, selectedPlatform: string, selectedTimeframeFilter: string): Promise<TransactionsPerDay[]> {
        const res = await fetch(`/getTransactions?courseId=${selectedCourse || ''}&platform=${selectedPlatform || ''}&timeframeFilterName=${selectedTimeframeFilter || ''}`);
        return await res.json();
    }

    async courseChanged(event): Promise<void> {
        try {
            const selectedCourse = event.target.value;
            const transactions = await this.fetchTransactions(selectedCourse, this.state.selectedPlatform, this.state.selectedTimeframeFilter);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    frequencyNames: previousState.frequencyNames,
                    platforms: previousState.platforms,
                    selectedCourse: selectedCourse,
                    selectedFrequency: previousState.selectedFrequency,
                    selectedPlatform: previousState.selectedPlatform,
                    selectedTimeframeFilter: previousState.selectedTimeframeFilter,
                    timeframeFilterNames: previousState.timeframeFilterNames,
                    transactions: transactions
                };
            });
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    error: error.message
                };
            });
        }
    }

    async platformChanged(event): Promise<void> {
        try {
            const selectedPlatform = event.target.value;
            const transactions = await this.fetchTransactions(this.state.selectedCourse, selectedPlatform, this.state.selectedTimeframeFilter);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    frequencyNames: previousState.frequencyNames,
                    platforms: previousState.platforms,
                    selectedCourse: previousState.selectedCourse,
                    selectedFrequency: previousState.selectedFrequency,
                    selectedPlatform: selectedPlatform,
                    selectedTimeframeFilter: previousState.selectedTimeframeFilter,
                    timeframeFilterNames: previousState.timeframeFilterNames,
                    transactions: transactions
                };
            });
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    error: error.message
                };
            });
        }
    }

    frequencyChanged(event): void {
        try {
            const selectedFrequency = event.target.value;
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    frequencyNames: previousState.frequencyNames,
                    platforms: previousState.platforms,
                    selectedCourse: previousState.selectedCourse,
                    selectedFrequency: selectedFrequency,
                    selectedPlatform: previousState.selectedPlatform,
                    selectedTimeframeFilter: previousState.selectedTimeframeFilter,
                    timeframeFilterNames: previousState.timeframeFilterNames,
                    transactions: previousState.transactions
                };
            });
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    error: error.message
                };
            });
        }
    }

    async timeframeFilterChanged(event): Promise<void> {
        try {
            const selectedTimeframeFilter = event.target.value;
            const transactions = await this.fetchTransactions(this.state.selectedCourse, this.state.selectedPlatform, selectedTimeframeFilter);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    frequencyNames: previousState.frequencyNames,
                    platforms: previousState.platforms,
                    selectedCourse: previousState.selectedCourse,
                    selectedFrequency: previousState.selectedFrequency,
                    selectedPlatform: previousState.selectedPlatform,
                    selectedTimeframeFilter: selectedTimeframeFilter,
                    timeframeFilterNames: previousState.timeframeFilterNames,
                    transactions: transactions
                };
            });
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    error: error.message
                };
            });
        }
    }

    generateCSV(transactions: TransactionsPerDay[], header: string, valueFunc: (courseTransaction: CourseTransaction) => number): string {
        let content = `data:text/csv;charset=utf-8,`;
        content += `Course Name,Date,${header}\n`;
        for (const transaction of transactions) {
            const date = moment(transaction.date).format("MM/DD/YYYY");
            for (const courseTransaction of transaction.courseTransactions) {
                content += `${courseTransaction.courseName},${date},${valueFunc(courseTransaction)}\n`;
            }
        }
        return encodeURI(content);
    }

    downloadCSV(contents: string, filename: string): void {
        const link = document.createElement("a");
        link.setAttribute("href", contents);
        link.setAttribute("download", filename);
        link.click();
    }

    exportEnrollmentsToCSV(): void {
        const { transactions } = this.state;
        const csv = this.generateCSV(transactions, "Enrollments", c => c.totalEnrollments);
        this.downloadCSV(csv, "enrollmentsPerDay.csv");
    }

    exportSalesToCSV(): void {
        const { transactions } = this.state;
        const csv = this.generateCSV(transactions, "Sales", c => c.totalSales);
        this.downloadCSV(csv, "salesPerDay.csv");
    }

    formatCurrency(value: any): string {
        const valueNumber = parseFloat(value);
        if (!isNaN(valueNumber) && typeof valueNumber === "number") {
            return "$" + valueNumber.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        }
        return value;
    }

    createEmptyMap(timeframeFilter: string, frequency: TimeUnit): Map<string, { t: Date, y: number }> {
        const map = new Map<string, { t: Date, y: number }>();
        const earliest = Timeframe.getTimeframeEarliestDate(timeframeFilter);
        const latest = Timeframe.getTimeframeLatestDate(timeframeFilter);
        const current = moment(earliest).startOf(frequency);
        while (current.toDate().getTime() < latest.getTime()) {
            const key = this.formatKey(current, frequency);
            map.set(key, { t: current.toDate(), y: 0 });
            current.add(1, frequency);
        }
        return map;
    }

    formatKey(date: moment.Moment, frequency: TimeUnit): string {
        if (frequency === "day") {
            return date.format("MM/DD/YYYY");
        } else if (frequency === "week") {
            return date.format("YYYY-ww");
        } else if (frequency === "month") {
            return date.format("MM/YYYY");
        } else if (frequency === "quarter") {
            return date.format("[Q]Q YYYY");
        } else if (frequency === "year") {
            return date.format("YYYY");
        }
        return date.format("MM/DD/YYYY");
    }

    groupDataByFrequency(data: { t: Date, y: number }[], timeframeFilter: string, frequency: TimeUnit): { t: Date, y: number }[] {
        const tempData = this.createEmptyMap(timeframeFilter, frequency);
        for (const point of data) {
            const date = moment(point.t);
            const key = this.formatKey(date, frequency);
            const tempPoint = tempData.get(key);
            if (tempPoint) {
                tempPoint.y += point.y;
            }
        }
        return Array.from(tempData.values());
    }

    createAverageData(totalSales: number, timeframeFilter: string, frequency: TimeUnit): { t: Date, y: number }[] {
        const tempData = this.createEmptyMap(timeframeFilter, frequency);
        const average = totalSales / tempData.size;
        for (const value of tempData.values()) {
            value.y = average;
        }
        return Array.from(tempData.values());
    }

    render() {
        const { error, isLoaded, courses, frequencyNames, platforms, selectedFrequency, selectedTimeframeFilter, timeframeFilterNames, transactions } = this.state;
        if (error) {
            return <div>Error: {error}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            const enrollmentsData = this.groupDataByFrequency(transactions.map(t => {
                return {
                    y: t.courseTransactions.map(ct => ct.totalEnrollments).reduce((t, v) => t + v, 0),
                    t: t.date
                };
            }), selectedTimeframeFilter, selectedFrequency);
            const salesData = this.groupDataByFrequency(transactions.map(t => {
                return {
                    y: t.courseTransactions.map(ct => ct.totalSales).reduce((t, v) => t + v, 0),
                    t: t.date
                };
            }), selectedTimeframeFilter, selectedFrequency);
            const totalEnrollments = enrollmentsData.reduce<number>((t, v) => t + v.y, 0);
            const totalSales = salesData.reduce<number>((t, v) => t + v.y, 0);
            const averageData = this.createAverageData(totalSales, selectedTimeframeFilter, selectedFrequency);
            const chartData: ChartData = {
                datasets: [
                    {
                        label: "Enrollments",
                        data: enrollmentsData,
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                        borderColor: "rgb(255, 99, 132)",
                        yAxisID: "enrollmentsYAxis"
                    },
                    {
                        label: "Sales",
                        data: salesData,
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgb(54, 162, 235)",
                        yAxisID: "salesYAxis",
                    },
                    {
                        label: "Average Sales",
                        data: averageData,
                        backgroundColor: "rgba(85, 26, 139, 0.5)",
                        borderColor: "rgb(85, 26, 139)",
                        yAxisID: "salesYAxis"
                    }
                ]
            };
            const chartDateFormats: TimeDisplayFormat = {
                day: "MM/DD/YYYY",
                week: "ll",
                month: "MMM YYYY",
                quarter: "[Q]Q YYYY",
                year: "YYYY"
            };
            const chartOptions: ChartOptions = {
                hover: {
                    animationDuration: 0
                },
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => {
                            // Format currency
                            if (tooltipItem.datasetIndex === 1) {
                                return this.formatCurrency(tooltipItem.yLabel);
                            }
                            // Format currency per enrollment
                            else if (tooltipItem.datasetIndex === 2) {
                                return this.formatCurrency(tooltipItem.yLabel) + " per enrollment";
                            }
                            return tooltipItem.yLabel;
                        }
                    }
                },
                scales: {
                    xAxes: [
                        {
                            type: "time",
                            distribution: "linear",
                            ticks: {
                                source: "data"
                            },
                            time: {
                                unit: selectedFrequency,
                                displayFormats: chartDateFormats,
                                tooltipFormat: chartDateFormats[selectedFrequency]
                            }
                        }
                    ],
                    yAxes: [
                        {
                            position: "left",
                            id: "enrollmentsYAxis",
                            scaleLabel: {
                                display: true,
                                labelString: "Total Enrollments"
                            },
                            ticks: {
                                min: 0
                            }
                        },
                        {
                            position: "right",
                            id: "salesYAxis",
                            scaleLabel: {
                                display: true,
                                labelString: "Total Sales"
                            },
                            ticks: {
                                min: 0,
                                callback: (value, index, values) => {
                                    return this.formatCurrency(value);
                                }
                            }
                        }
                    ]
                }
            };
            const canvasStyle: React.CSSProperties = {
                float: "left",
                marginLeft: "3%",
                marginRight: "3%",
                width: "80%"
            };
            const totalsStyle: React.CSSProperties = {
                float: "left",
                width: "11%"
            };
            const selectStyle: React.CSSProperties = {
                marginLeft: "20px",
                marginRight: "20px"
            };
            const exportStyle: React.CSSProperties = {
                clear: "both",
                textAlign: "center"
            };
            return(
                <div>
                    <Form inline style={{justifyContent: "center"}}>
                        <FormControl componentClass="select" id="courses" onChange={this.courseChanged.bind(this)} style={selectStyle}>
                            <option>All Courses</option>
                            {courses.map(course => <option value={course.id}>{course.courseName}</option>)}
                        </FormControl>
                        <FormControl componentClass="select" id="platforms" onChange={this.platformChanged.bind(this)} style={selectStyle}>
                            {platforms.map(platform => <option value={platform}>{platform}</option>)}
                        </FormControl>
                        <FormControl componentClass="select" id="timeframeFilterNames" onChange={this.timeframeFilterChanged.bind(this)} style={selectStyle}>
                            {timeframeFilterNames.map(timeframeFilterName => <option value={timeframeFilterName}>{timeframeFilterName}</option>)}
                        </FormControl>
                        <FormControl componentClass="select" id="frequencyNames" onChange={this.frequencyChanged.bind(this)} style={selectStyle}>
                            {frequencyNames.map(frequencyName => <option value={frequencyName.key}>{frequencyName.label}</option>)}
                        </FormControl>
                    </Form>
                    <div style={canvasStyle}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    <div style={totalsStyle}>
                        <div>
                            <strong>Total&nbsp;Sales:</strong><br />
                            {this.formatCurrency(totalSales)}
                        </div>
                        <br />
                        <div>
                            <strong>Total&nbsp;Enrollments:</strong><br />
                            {totalEnrollments}
                        </div>
                    </div>
                    <div style={exportStyle}>
                        <Button onClick={this.exportEnrollmentsToCSV.bind(this)} bsStyle="danger">Export Enrollments Per Day to CSV</Button>&nbsp;&nbsp;&nbsp;
                        <Button onClick={this.exportSalesToCSV.bind(this)} bsStyle="primary">Export Sales Per Day to CSV</Button>
                    </div>
                </div>
            );
        }
    }
}
