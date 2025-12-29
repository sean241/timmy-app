import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Timmy</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/admin/signup"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center space-y-8 bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Simplify Your <span className="text-primary">Workforce</span> Management
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Effortless time tracking, scheduling, and payroll management for modern businesses.
              Focus on your team, not the paperwork.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/admin"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md text-lg font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/kiosk"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-md text-lg font-medium transition-colors"
            >
              Open Kiosk
            </Link>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 px-6 bg-background">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Time Tracking</h3>
              <p className="text-muted-foreground"> precise clock-in/out logging with our intuitive kiosk mode.</p>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Dashboard</h3>
              <p className="text-muted-foreground">Monitor attendance and productivity from anywhere with live data.</p>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Team Management</h3>
              <p className="text-muted-foreground">Easily manage employee profiles, roles, and schedules.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Timmy. All rights reserved.</p>
      </footer>
    </div>
  );
}
