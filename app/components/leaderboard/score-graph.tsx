'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ScoreData {
    timestamp: number;
    [key: string]: number | string; // team names as keys
}

interface ScoreGraphProps {
    data: ScoreData[];
    teams: { id: string, name: string, color: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-4 rounded-lg shadow-xl backdrop-blur-md">
                <p className="font-mono text-xs text-muted-foreground mb-2">{format(new Date(label), 'HH:mm:ss')}</p>
                {payload.map((p: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-sm font-mono">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span style={{ color: p.color }}>{p.name}:</span>
                        <span className="text-white">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function ScoreGraph({ data, teams }: ScoreGraphProps) {
    return (
        <div className="w-full h-[400px] p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4 ml-2">Live Signal Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="timestamp"
                        stroke="#666"
                        tickFormatter={(unixTime) => format(new Date(unixTime), 'HH:mm')}
                        fontSize={12}
                        tick={{ fill: '#666' }}
                    />
                    <YAxis
                        stroke="#666"
                        fontSize={12}
                        tick={{ fill: '#666' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {teams.map((team) => (
                        <Line
                            key={team.id}
                            type="stepAfter"
                            dataKey={team.name}
                            stroke={team.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
