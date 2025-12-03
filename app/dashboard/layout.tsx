import Link from "next/link";
import { LogOut, FileText, Upload } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                background: 'hsl(var(--card))',
                borderRight: '1px solid hsl(var(--border))',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ marginBottom: '2rem', paddingLeft: '1rem' }}>
                    <h2 className="heading-lg" style={{ fontSize: '1.25rem', marginBottom: 0 }}>Admin Panel</h2>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <Link href="/dashboard" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                background: 'hsl(var(--secondary))',
                                color: 'hsl(var(--foreground))'
                            }}>
                                <FileText size={18} />
                                Files
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div>
                    {/* Logout could be a form action or client component, keeping it simple link for now which won't actually clear cookie without logic */}
                    <a href="/login" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        color: 'hsl(var(--muted-foreground))',
                        transition: 'color 0.2s'
                    }}>
                        <LogOut size={18} />
                        Logout
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem' }}>
                <div className="container" style={{ maxWidth: '100%', padding: 0 }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
