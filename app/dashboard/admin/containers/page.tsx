import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { LayoutGrid, StopCircle, Clock, Server } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { adminStopContainer } from '@/app/actions/admin';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminContainersPage() {
    const session = await getSession();
    if (!session || session.role !== 'admin') redirect('/dashboard');

    const containers = await prisma.container.findMany({
        include: {
            team: true,
            challenge: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <header className="flex flex-col space-y-4">
                <Link href="/dashboard/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-wider">
                    <ArrowLeft size={14} className="mr-2" />
                    Back to Console
                </Link>
                <div className="border-l-4 border-primary pl-4">
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Live Environments</h1>
                    <p className="text-muted-foreground text-sm font-bold tracking-widest uppercase">Monitor and control active challenge instances.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {containers.map(container => (
                    <div key={container.id} className="p-6 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded">
                                    <Server size={16} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-bold font-mono">{container.challenge.title}</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-muted-foreground border border-white/10 font-mono">
                                    {container.containerId.substring(0, 12)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Assigned Unit</p>
                                    <p className="font-mono text-sm">{container.team.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Port Mapping</p>
                                    <p className="font-mono text-sm">{container.hostPort} (Host) → {container.challenge.internalPort} (Container)</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-4 text-xs font-mono text-muted-foreground">
                                <Clock size={12} />
                                <span>Expires: {new Date(container.expiresAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <form action={async (formData) => {
                            'use server';
                            await adminStopContainer(null, formData);
                        }} className="ml-6">
                            <input type="hidden" name="containerId" value={container.id} />
                            <Button variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50">
                                <StopCircle size={16} className="mr-2" />
                                TERMINATE
                            </Button>
                        </form>
                    </div>
                ))}

                {containers.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <LayoutGrid className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-mono">No active environments detected.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
