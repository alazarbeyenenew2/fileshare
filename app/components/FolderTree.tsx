"use client";

import { useState, useEffect } from "react";
import { Folder as FolderIcon, FileText, ChevronRight, Lock, QrCode, Trash2, FolderPlus } from "lucide-react";
import type { Folder } from "../api/folders/route";

interface FolderTreeProps {
    onFolderClick: (folder: Folder) => void;
    onCreateSubfolder: (parentId: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onShowQR: (folderId: string) => void;
    refreshTrigger: number;
}

interface FileMetadata {
    id: string;
    filename: string;
    folderId: string;
    uploadedAt: string;
}

export default function FolderTree({ onFolderClick, onCreateSubfolder, onDeleteFolder, onShowQR, refreshTrigger }: FolderTreeProps) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const fetchData = async () => {
        try {
            const [foldersRes, filesRes] = await Promise.all([
                fetch("/api/folders"),
                fetch("/api/files")
            ]);

            if (foldersRes.ok) {
                const data = await foldersRes.json();
                setFolders(data.folders || []);
            }

            if (filesRes.ok) {
                const data = await filesRes.json();
                setFiles(data.files || []);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const getSubfolders = (parentId: string | null) => {
        return folders.filter(f => f.parentId === parentId);
    };

    const getFolderFiles = (folderId: string) => {
        return files.filter(f => f.folderId === folderId);
    };

    const renderFolder = (folder: Folder, depth: number = 0) => {
        const subfolders = getSubfolders(folder.id);
        const folderFiles = getFolderFiles(folder.id);
        const isExpanded = expandedFolders.has(folder.id);
        const hasChildren = subfolders.length > 0 || folderFiles.length > 0;

        return (
            <div key={folder.id} className="fade-in" style={{ marginLeft: `${depth * 1.5}rem` }}>
                <div
                    className="folder-card"
                    style={{
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >
                    {hasChildren && (
                        <button
                            onClick={() => toggleFolder(folder.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'hsl(var(--foreground))',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <ChevronRight
                                size={20}
                                style={{
                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        </button>
                    )}

                    <div
                        onClick={() => onFolderClick(folder)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            background: 'var(--gradient-primary)',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FolderIcon size={20} color="white" />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{folder.name}</h3>
                                {folder.passwordHash && <Lock size={14} style={{ color: 'hsl(var(--primary))' }} />}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                {subfolders.length} subfolder{subfolders.length !== 1 ? 's' : ''}, {folderFiles.length} file{folderFiles.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!folder.parentId && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onShowQR(folder.id); }}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem', minWidth: 'auto' }}
                                title="Show QR Code"
                            >
                                <QrCode size={18} />
                            </button>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); onCreateSubfolder(folder.id); }}
                            className="btn btn-gradient"
                            style={{ padding: '0.5rem', minWidth: 'auto' }}
                            title="Add Subfolder"
                        >
                            <FolderPlus size={18} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem', minWidth: 'auto' }}
                            title="Delete Folder"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div>
                        {subfolders.map(subfolder => renderFolder(subfolder, depth + 1))}

                        {folderFiles.map(file => (
                            <div
                                key={file.id}
                                className="glass-panel"
                                style={{
                                    marginLeft: `${(depth + 1) * 1.5}rem`,
                                    marginBottom: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <FileText size={18} style={{ color: 'hsl(var(--accent))' }} />
                                <span style={{ fontSize: '0.9rem' }}>{file.filename}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const mainFolders = getSubfolders(null);

    if (mainFolders.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <FolderIcon size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>No folders created yet</p>
            </div>
        );
    }

    return (
        <div>
            {mainFolders.map(folder => renderFolder(folder, 0))}
        </div>
    );
}
