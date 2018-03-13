import { ChartData } from "chart.js";
import { Component } from "react";
import { Line } from "react-chartjs-2";
import * as React from "react";

export interface AppProperties {
}

export interface AppState {
    error?: string;
    isLoaded?: boolean;
    data?: any[];
}

export default class App extends Component<AppProperties, AppState> {
    constructor(props: AppProperties, context?: any) {
        super(props, context);
        this.state = {
            error: "",
            isLoaded: false,
            data: []
        };
    }

    componentDidMount() {
        fetch("/getData")
            .then(res => res.json())
            .then(res => {
                this.setState((previousState, props) => {
                    return {
                        isLoaded: true,
                        data: res
                    };
                });
            }, error => {
                this.setState((previousState, props) => {
                    return {
                        error: error.message,
                        isLoaded: true
                    };
                });
            });
    }

    render() {
        const { error, isLoaded, data } = this.state;
        if (error) {
            return <div>Error: {error}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            const chartData: ChartData = {
                labels: ["January", "March", "December"],
                datasets: [
                    {
                        label: "My First Dataset",
                        data: data
                    }
                ]
            };
            return <Line data={chartData} />;
        }
    }
}
