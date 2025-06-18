"use client";
import {
    LineChart,
    LabelList,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import React, { forwardRef } from "react";

const data = [
    { mes: "Jan", taxaIngrid: 79.4, taxaNicole: 50.2 },
    { mes: "Fev", taxaIngrid: 67.7, taxaNicole: 43.9 },
    { mes: "Mar", taxaIngrid: 58.8, taxaNicole: 69 },
];

const GraficoDeVendas = forwardRef<HTMLDivElement>((_props, ref) => {
    return (
        <div ref={ref} className="w-full h-96 bg-white p-4 rounded">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="mes" />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="taxaIngrid"
                        stroke="#FF4500"
                        name="Ingrid"
                    >
                        <LabelList dataKey="taxaIngrid" position="top" formatter={(val: number) => `${val}%`} />
                    </Line>

                    <Line
                        type="monotone"
                        dataKey="taxaNicole"
                        stroke="#1E90FF"
                        name="Nicole"
                    >
                        <LabelList dataKey="taxaNicole" position="top" formatter={(val: number) => `${val}%`} />
                    </Line>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});

export default GraficoDeVendas;