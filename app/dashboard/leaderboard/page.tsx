import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Trophy, Medal, Target } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ScoreGraph } from '@/app/components/leaderboard/score-graph';
import { AutoRefresh } from '@/app/components/leaderboard/auto-refresh';

export default async function LeaderboardPage() {
    const session = await getSession();
    if (!session) redirect('/');

    // 1. Get top teams
    // 1. Get all teams (we need to sort them all to find true rank)
    // We fetch a larger limit to ensure we capture the active field. Limit 100 for now.
    const rawTeams = await prisma.team.findMany({
        take: 100,
        include: {
            _count: { select: { submissions: { where: { isCorrect: true } } } },
            members: true,
            submissions: {
                where: { isCorrect: true },
                include: { challenge: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    // 2. Sort teams: Score (DESC) -> Last Submission Time (ASC)
    const teams = rawTeams.sort((a, b) => {
        // Primary: Score Higher = Better
        if (b.score !== a.score) {
            return b.score - a.score;
        }

        // Secondary: Earlier Time = Better
        const aLastSub = a.submissions.length > 0 ? a.submissions[a.submissions.length - 1].createdAt.getTime() : 0;
        const bLastSub = b.submissions.length > 0 ? b.submissions[b.submissions.length - 1].createdAt.getTime() : 0;

        // If one has no submissions (but somehow has score? unlikely if score defaults to 0), they go to bottom
        // Logic: Lower timestamp (earlier) is better.
        // If aLastSub < bLastSub -> return -1 (a comes first)
        return aLastSub - bLastSub;
    });

    // 2. Process data for graph
    // We need a timeline of events. 
    // Start with empty timeline or based on first submission.

    // Collect all unique timestamps from all submissions
    let events: { time: number, teamId: string, points: number }[] = [];

    teams.forEach(team => {
        team.submissions.forEach(sub => {
            events.push({
                time: sub.createdAt.getTime(),
                teamId: team.id,
                points: sub.challenge.points
            });
        });
    });

    events.sort((a, b) => a.time - b.time);

    // Initial state: all teams have 0 points at start time (or slightly before first event)
    const graphData: any[] = [];
    const currentScores: Record<string, number> = {};

    // Initialize scores
    teams.forEach(t => currentScores[t.name] = 0);

    // Add initial point
    if (events.length > 0) {
        graphData.push({
            timestamp: events[0].time - 60000, // 1 min before start
            ...currentScores
        });
    }

    // Iterate events and build timeline
    events.forEach(event => {
        const team = teams.find(t => t.id === event.teamId);
        if (team) {
            currentScores[team.name] += event.points;

            // Push new data point
            graphData.push({
                timestamp: event.time,
                ...currentScores
            });
        }
    });

    // Extrapolate to "now"
    graphData.push({
        timestamp: Date.now(),
        ...currentScores
    });

    // Generate colors for teams (cycling through neon palette)
    const colors = [
        '#00ff9d', '#ff00ff', '#00eaff', '#ffff00', '#ff4d4d',
        '#9d00ff', '#ff9d00', '#00ff4d', '#4d4dff', '#ff009d'
    ];

    const teamMetadata = teams.map((t, i) => ({
        id: t.id,
        name: t.name,
        color: colors[i % colors.length]
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <AutoRefresh />
            <header className="flex flex-col space-y-2 border-l-4 border-primary pl-4">
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Global Rankings</h1>
                <p className="text-muted-foreground font-bold tracking-widest text-sm uppercase">Top Unit Intelligence</p>
            </header>

            {/* Graph Section - Visible to All */}
            {teams.length > 0 && events.length > 0 && (
                <ScoreGraph data={graphData} teams={teamMetadata} />
            )}

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-xs text-muted-foreground uppercase tracking-widest font-mono">
                            <th className="p-4 w-24 text-center">Rank</th>
                            <th className="p-4">Unit Name</th>
                            <th className="p-4 text-center">Flags Captured</th>
                            <th className="p-4 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {teams.map((team, index) => {
                            let rankIcon: React.ReactNode = <span className="text-muted-foreground font-mono">#{index + 1}</span>;
                            let rowClass = "hover:bg-white/5 transition-colors";

                            if (index === 0) {
                                rankIcon = <Trophy className="text-yellow-500 mx-auto drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={24} />;
                                rowClass = "bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors border-l-2 border-yellow-500";
                            } else if (index === 1) {
                                rankIcon = <Medal className="text-gray-400 mx-auto" size={24} />;
                                rowClass = "bg-white/5 hover:bg-white/10 transition-colors border-l-2 border-gray-400";
                            } else if (index === 2) {
                                rankIcon = <Medal className="text-amber-700 mx-auto" size={24} />;
                                rowClass = "bg-amber-700/5 hover:bg-amber-700/10 transition-colors border-l-2 border-amber-700";
                            }

                            return (
                                <tr key={team.id} className={rowClass}>
                                    <td className="p-4 text-center font-bold">{rankIcon}</td>
                                    <td className="p-4">
                                        <span className="font-bold font-mono text-lg">{team.name}</span>
                                        {team.members && team.members.length > 0 && (
                                            <span className="text-xs text-muted-foreground ml-2">({team.members.length} operatives)</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                                            <Target size={14} className="text-primary" />
                                            <span className="font-mono text-sm">{team._count.submissions}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="font-bold font-mono text-xl text-primary drop-shadow-[0_0_5px_rgba(0,255,157,0.5)]">
                                            {team.score}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}

                        {teams.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground font-mono">
                                    NO DATA RECORDED. BEGIN OPERATIONS.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
