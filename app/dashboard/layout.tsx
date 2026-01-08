import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { LogOut, Home, Flag, Users, ShieldAlert, Trophy } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect('/');

    return (
        <div className="flex min-h-screen bg-black text-foreground font-sans selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="h-20 flex items-center justify-center border-b border-white/10">
                    <span className="text-3xl font-black tracking-widest text-[#ff4655] uppercase font-sans italic">NULLBOX</span>
                </div>

                <nav className="flex flex-col space-y-1 p-4 flex-1">
                    <NavItem href="/dashboard" icon={<Home size={18} />}>Overview</NavItem>
                    <NavItem href="/dashboard/challenges" icon={<Flag size={18} />}>Challenges</NavItem>
                    <NavItem href="/dashboard/leaderboard" icon={<Trophy size={18} />}>Leaderboard</NavItem>
                    <NavItem href="/dashboard/team" icon={<Users size={18} />}>Team Operations</NavItem>
                    {session.role === 'admin' && (
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <p className="px-4 text-[10px] uppercase text-muted-foreground tracking-widest mb-2 font-mono">Administration</p>
                            <NavItem href="/dashboard/admin" icon={<ShieldAlert size={18} />}>Admin Panel</NavItem>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="mb-4 px-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Logged in as</p>
                        <p className="font-mono text-primary truncate">{session.username}</p>
                    </div>
                    <form action={logout}>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors group">
                            <LogOut size={18} className="mr-3 group-hover:text-red-500" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavItem({ href, children, icon }: { href: string, children: React.ReactNode, icon: React.ReactNode }) {
    return (
        <Link href={href} className="flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all group">
            <span className="mr-3 group-hover:text-primary transition-colors">{icon}</span>
            {children}
        </Link>
    )
}
