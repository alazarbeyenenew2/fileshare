"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Folder as FolderIcon, FileText, ArrowLeft, Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { Folder } from "../../api/folders/route";

interface FileMetadata {
    id: string;
    filename: string;
    folderId: string;
    uploadedAt: string;
}

export default function FolderPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [folder, setFolder] = useState<Folder | null>(null);
    const [subfolders, setSubfolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [viewingFile, setViewingFile] = useState<string | null>(null);

    useEffect(() => {
        checkFolder();
    }, [id]);

    const checkFolder = async () => {
        try {
            const res = await fetch(`/api/folders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFolder(data.folder);

                // If no password required, authenticate immediately
                if (!data.folder.passwordHash) {
                    loadFolderContents(data.folder);
                }
            }
        } catch (err) {
            console.error("Failed to load folder", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/folders/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                const data = await res.json();
                loadFolderContents(data.folder);
            } else {
                setError("Invalid password");
            }
        } catch (err) {
            setError("Failed to access folder");
        } finally {
            setLoading(false);
        }
    };

    const loadFolderContents = async (folderData: Folder) => {
        setAuthenticated(true);
        setFolder(folderData);

        try {
            const [foldersRes, filesRes] = await Promise.all([
                fetch("/api/folders"),
                fetch("/api/files")
            ]);

            if (foldersRes.ok) {
                const data = await foldersRes.json();
                const subs = data.folders.filter((f: Folder) => f.parentId === id);
                setSubfolders(subs);
            }

            if (filesRes.ok) {
                const data = await filesRes.json();
                const folderFiles = data.files.filter((f: FileMetadata) => f.folderId === id);
                setFiles(folderFiles);
            }
        } catch (err) {
            console.error("Failed to load contents", err);
        }
    };

    const viewFile = async (fileId: string, filename: string) => {
        try {
            const res = await fetch(`/api/files/${fileId}`);
            if (res.ok) {
                const blob = await res.blob();
                const arrayBuffer = await blob.arrayBuffer();

                const workbook = XLSX.read(arrayBuffer, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                setSelectedFile({ filename, data: jsonData });
                setViewingFile(fileId);
            }
        } catch (err) {
            alert("Failed to load file");
        }
    };

    if (!folder) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!authenticated && folder.passwordHash) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="glass-panel fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            background: 'var(--gradient-primary)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)'
                        }}>
                            <Lock color="white" size={30} />
                        </div>
                        <h1 className="heading-lg">{folder.name}</h1>
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Enter password to access this folder</p>
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
                            {loading ? "Verifying..." : "Access Folder"}
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

    if (viewingFile && selectedFile) {
        return (
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setViewingFile(null)} className="btn btn-secondary">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="heading-xl" style={{ marginBottom: '0.25rem' }}>{selectedFile.filename}</h1>
                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>From folder: {folder.name}</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                    {selectedFile.data && selectedFile.data.length > 0 ? (
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.9rem'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid hsl(var(--border))' }}>
                                    {(selectedFile.data[0] as any[]).map((header: any, idx: number) => (
                                        <th key={idx} style={{
                                            padding: '0.75rem 1rem',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            background: 'var(--gradient-primary)',
                                            color: 'white'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedFile.data.slice(1).map((row: any[], rowIdx: number) => (
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

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <button onClick={() => router.push('/')} className="btn btn-secondary">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="heading-xl" style={{ marginBottom: '0.25rem' }}>{folder.name}</h1>
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {subfolders.length} subfolder{subfolders.length !== 1 ? 's' : ''}, {files.length} file{files.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {subfolders.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 className="heading-md">Subfolders</h2>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                        {subfolders.map(subfolder => (
                            <div
                                key={subfolder.id}
                                className="folder-card"
                                onClick={() => router.push(`/folder/${subfolder.id}`)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        background: 'var(--gradient-accent)',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        <FolderIcon size={24} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{subfolder.name}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div>
                    <h2 className="heading-md">Files</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {files.map(file => (
                            <div
                                key={file.id}
                                className="glass-panel"
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer'
                                }}
                                onClick={() => viewFile(file.id, file.filename)}
                            >
                                <FileText size={24} style={{ color: 'hsl(var(--accent))' }} />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{file.filename}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                                        Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                                    </p>
                                </div>
                                <button className="btn btn-gradient">
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subfolders.length === 0 && files.length === 0 && (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <FolderIcon size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>This folder is empty</p>
                </div>
            )}
        </div>
    );
}
