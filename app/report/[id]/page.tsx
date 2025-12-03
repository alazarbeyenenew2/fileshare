"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Lock, FileText, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

export default function ReportPage() {
    const params = useParams();
    const id = params.id as string;

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [filename, setFilename] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/report/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                const data = await res.json();
                setAuthenticated(true);
                setFilename(data.filename);

                // Parse Excel file
                const binaryString = atob(data.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const workbook = XLSX.read(bytes, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                setReportData(jsonData);
            } else {
                setError("Invalid password");
            }
        } catch (err) {
            setError("Failed to load report");
        } finally {
            setLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            background: 'hsl(var(--primary))',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                        }}>
                            <Lock color="white" size={30} />
                        </div>
                        <h1 className="heading-lg">Protected Report</h1>
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Enter password to view this report</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Verifying..." : "Access Report"}
                        </button>

                        <a href="/" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                            <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
                            Back to Home
                        </a>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <a href="/" className="btn btn-secondary">
                    <ArrowLeft size={18} />
                </a>
                <div>
                    <h1 className="heading-xl" style={{ marginBottom: '0.25rem' }}>{filename}</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>Report ID: {id}</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                {reportData && reportData.length > 0 ? (
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.9rem'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid hsl(var(--border))' }}>
                                {(reportData[0] as any[]).map((header: any, idx: number) => (
                                    <th key={idx} style={{
                                        padding: '0.75rem 1rem',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        background: 'hsl(var(--secondary))'
                                    }}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.slice(1).map((row: any[], rowIdx: number) => (
                                <tr key={rowIdx} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                    {row.map((cell: any, cellIdx: number) => (
                                        <td key={cellIdx} style={{ padding: '0.75rem 1rem' }}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No data available</p>
                )}
            </div>
        </div>
    );
}
