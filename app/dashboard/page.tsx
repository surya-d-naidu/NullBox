import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { team: true }
    });

    return (
        <div className="space-y-8">
            <header className="border-l-4 border-primary pl-4">
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Mission Control</h1>
                <p className="text-muted-foreground mt-2 font-bold tracking-widest text-sm uppercase">Welcome back, operative {session.username}.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Team Card */}
                <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm val-card relative overflow-hidden">
                    <div className="val-corner-tl" />
                    <h2 className="text-xl font-black italic uppercase text-white mb-4 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Unit Status
                    </h2>
                    {user?.team ? (
                        <div>
                            <p className="text-4xl font-black italic text-white mb-2 uppercase">{user.team.name}</p>
                            <div className="flex justify-between items-end mt-4">
                                <div className="text-sm text-muted-foreground">
                                    <span className="block text-xs uppercase tracking-widest text-white/40 mb-1">Current Score</span>
                                    <span className="text-xl text-primary font-mono">{user.team.score} PTS</span>
                                </div>
                                <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider">ACTIVE</span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-muted-foreground mb-6 text-sm">Operative is currently independent. Join a unit to participate in team challenges.</p>
                            <Link href="/dashboard/team">
                                <Button variant="default" size="sm" className="w-full">Initialize / Join Team</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* System Status */}
                <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-4 text-accent">System Status</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform</span>
                            <span className="text-green-500">ONLINE</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Workforce</span>
                            <span className="text-green-500">OPERATIONAL</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Defcon</span>
                            <span className="text-yellow-500">LEVEL 4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
