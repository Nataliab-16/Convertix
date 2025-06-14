"use client";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    {
        mes: "Jan",
        taxaIngrid: 79.4,
        taxaNicole: 50.2,
    },
    {
        mes: "Fev",
        taxaIngrid: 67.7,
        taxaNicole: 43.9,
    },
    {
        mes: "Mar",
        taxaIngrid: 58.8,
        taxaNicole: 69,
    },
];

export default function GraficoDeVendas() {
    return (
        <div className="w-full h-96">
            <ResponsiveContainer  width="100%" height="100%">
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
                    />
                    <Line
                        type="monotone"
                        dataKey="taxaNicole"
                        stroke="#1E90FF"
                        name="Nicole"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

