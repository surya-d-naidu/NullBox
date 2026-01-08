import { AuthForm } from './components/auth-form';

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative bg-black overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 h-[500px] bg-primary/20 blur-[150px] opacity-10 rounded-full" />

      <div className="relative z-10 w-full flex items-center justify-center p-4">
        <AuthForm />
      </div>

      <div className="absolute bottom-4 right-4 text-xs font-mono text-muted-foreground opacity-30">
        SYS.VER.0.1.0 // BETA-CTF
      </div>
    </main>
  );
}
