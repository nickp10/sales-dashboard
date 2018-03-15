import { Course, CourseTransaction, TransactionsPerDay } from "../../interfaces";
import { ChartData, ChartOptions } from "chart.js";
import { Component } from "react";
import { Line } from "react-chartjs-2";
import * as moment from "moment";
import * as React from "react";

export interface AppProperties {
}

export interface AppState {
    error?: string;
    isLoaded?: boolean;
    courses?: Course[];
    selectedCourse?: number;
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
            const transactions = await this.fetchTransactions(this.state.selectedCourse, timeframeFilterNames[0]);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: courses,
                    transactions: transactions,
                    selectedCourse: previousState.selectedCourse,
                    selectedTimeframeFilter: timeframeFilterNames[0],
                    timeframeFilterNames: timeframeFilterNames
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

    async fetchTransactions(selectedCourse: number, selectedTimeframeFilter: string): Promise<TransactionsPerDay[]> {
        const res = await fetch(`/getTransactions?courseId=${selectedCourse || ''}&timeframeFilterName=${selectedTimeframeFilter || ''}`);
        return await res.json();
    }

    async courseChanged(event): Promise<void> {
        try {
            const selectedCourse = event.target.value;
            const transactions = await this.fetchTransactions(selectedCourse, this.state.selectedTimeframeFilter);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    transactions: transactions,
                    selectedCourse: selectedCourse,
                    selectedTimeframeFilter: previousState.selectedTimeframeFilter,
                    timeframeFilterNames: previousState.timeframeFilterNames
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
            const transactions = await this.fetchTransactions(this.state.selectedCourse, selectedTimeframeFilter);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    transactions: transactions,
                    selectedCourse: previousState.selectedCourse,
                    selectedTimeframeFilter: selectedTimeframeFilter,
                    timeframeFilterNames: previousState.timeframeFilterNames
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

    render() {
        const { error, isLoaded, courses, transactions, timeframeFilterNames } = this.state;
        if (error) {
            return <div>Error: {error}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            const chartData: ChartData = {
                labels: transactions.map(t => moment(t.date).format("MM/DD/YYYY")),
                datasets: [
                    {
                        label: "Enrollments Per Day",
                        data: transactions.map(t => t.courseTransactions.map(ct => ct.totalEnrollments).reduce((t, v) => t + v, 0)),
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                        borderColor: "rgb(255, 99, 132)",
                        yAxisID: "enrollmentsYAxis"
                    },
                    {
                        label: "Sales Per Day",
                        data: transactions.map(t => t.courseTransactions.map(ct => ct.totalSales).reduce((t, v) => t + v, 0)),
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgb(54, 162, 235)",
                        yAxisID: "salesYAxis",
                    }
                ]
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
                                const value = parseInt(tooltipItem.yLabel);
                                if (!isNaN(value) && typeof value === "number") {
                                    return "$" + value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                                }
                            }
                            return tooltipItem.yLabel;
                        }
                    }
                },
                scales: {
                    xAxes: [
                        {
                            stacked: true
                        }
                    ],
                    yAxes: [
                        {
                            stacked: true,
                            position: "left",
                            id: "enrollmentsYAxis",
                            scaleLabel: {
                                display: true,
                                labelString: "Total Enrollments"
                            }
                        },
                        {
                            stacked: true,
                            position: "right",
                            id: "salesYAxis",
                            scaleLabel: {
                                display: true,
                                labelString: "Total Sales"
                            },
                            ticks: {
                                callback: (value, index, values) => {
                                    return "$" + value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                                }
                            }
                        }
                    ]
                }
            };
            const floatLeftStyle = {
                float: "left"
            };
            const floatRightStyle = {
                float: "right"
            };
            const canvasStyle = {
                marginLeft: "auto",
                marginRight: "auto",
                width: "80%"
            };
            const centerStyle = {
                textAlign: "center"
            };
            return(
                <div>
                    <div>
                        <div style={floatLeftStyle}>
                            <select id="courses" onChange={this.courseChanged.bind(this)}>
                                <option>All Courses</option>
                                {courses.map(course => <option value={course.id}>{course.courseName}</option>)}
                            </select>
                        </div>
                        <div style={floatRightStyle}>
                            <select id="timeframeFilterNames" onChange={this.timeframeFilterChanged.bind(this)}>
                                {timeframeFilterNames.map(timeframeFilterName => <option value={timeframeFilterName}>{timeframeFilterName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={canvasStyle}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    <div style={centerStyle}>
                        <button onClick={this.exportEnrollmentsToCSV.bind(this)}>Export Enrollments Per Day to CSV</button>&nbsp;&nbsp;&nbsp;
                        <button onClick={this.exportSalesToCSV.bind(this)}>Export Sales Per Day to CSV</button>
                    </div>
                </div>
            );
        }
    }
}
