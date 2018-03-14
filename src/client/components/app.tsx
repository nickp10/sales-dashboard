import { Course, ItemsPerDay } from "../../interfaces";
import { ChartData } from "chart.js";
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
    enrollments?: ItemsPerDay[];
    sales?: ItemsPerDay[];
    timeframeFilterNames?: string[];
}

export default class App extends Component<AppProperties, AppState> {
    constructor(props: AppProperties, context?: any) {
        super(props, context);
        this.state = {
            error: "",
            isLoaded: false,
            courses: [],
            enrollments: [],
            sales: [],
            timeframeFilterNames: []
        };
    }

    async componentDidMount(): Promise<void> {
        try {
            const res1 = await fetch("/getCourses");
            const courses = await res1.json();
            const res2 = await fetch("/getTimeframeFilterNames");
            const timeframeFilterNames = await res2.json();
            const enrollments = await this.fetchEnrollments(this.state.selectedCourse, timeframeFilterNames[0]);
            const sales = await this.fetchSales(this.state.selectedCourse, timeframeFilterNames[0]);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: courses,
                    enrollments: enrollments,
                    sales: sales,
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

    async fetchEnrollments(selectedCourse: number, selectedTimeframeFilter: string): Promise<ItemsPerDay[]> {
        const res = await fetch(`/getEnrollments?courseId=${selectedCourse || ''}&timeframeFilterName=${selectedTimeframeFilter || ''}`);
        return await res.json();
    }

    async fetchSales(selectedCourse: number, selectedTimeframeFilter: string): Promise<ItemsPerDay[]> {
        const res = await fetch(`/getSales?courseId=${selectedCourse || ''}&timeframeFilterName=${selectedTimeframeFilter || ''}`);
        return await res.json();
    }

    async courseChanged(event): Promise<void> {
        try {
            const selectedCourse = event.target.value;
            const enrollments = await this.fetchEnrollments(selectedCourse, this.state.selectedTimeframeFilter);
            const sales = await this.fetchSales(selectedCourse, this.state.selectedTimeframeFilter);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    enrollments: enrollments,
                    sales: sales,
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
            const enrollments = await this.fetchEnrollments(this.state.selectedCourse, selectedTimeframeFilter);
            const sales = await this.fetchSales(this.state.selectedCourse, selectedTimeframeFilter);
            this.setState((previousState, props) => {
                return {
                    isLoaded: true,
                    courses: previousState.courses,
                    enrollments: enrollments,
                    sales: sales,
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

    render() {
        const { error, isLoaded, courses, enrollments, sales, timeframeFilterNames } = this.state;
        if (error) {
            return <div>Error: {error}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            const chartData: ChartData = {
                labels: Array.from(new Set(
                    enrollments.map(item => moment(item.date))
                    .concat(sales.map(item => moment(item.date)))
                    .sort((i1, i2) => i1.valueOf() - i2.valueOf())
                    .map(i => i.format("MM/DD/YY"))
                )),
                datasets: [
                    {
                        label: "Enrollments Per Day",
                        data: enrollments.map(item => Array.from(new Set(item.items)).length),
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                        borderColor: "rgb(255, 99, 132)"
                    },
                    {
                        label: "Sales Per Day",
                        data: sales.map(item => Array.from(new Set(item.items)).length),
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgb(54, 162, 235)"
                    }
                ]
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
                width: "75%"
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
                        <Line data={chartData} />
                    </div>
                </div>
            );
        }
    }
}
