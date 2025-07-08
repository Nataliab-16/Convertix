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

const getUltimosMeses = (quantidade = 3) => {
    const meses = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const hoje = new Date();
    const resultado = [];

    for (let i = quantidade - 1; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const nomeMes = meses[data.getMonth()];

        resultado.push({
            mes: nomeMes,
            taxaIngrid: parseFloat((Math.random() * 100).toFixed(1)),
            taxaNicole: parseFloat((Math.random() * 100).toFixed(1)),
        });
    }

    return resultado;
};

const data = getUltimosMeses();

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