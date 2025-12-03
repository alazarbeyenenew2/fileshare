"use client";

import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";

interface FileUploadProps {
    onClose: () => void;
    onSuccess: () => void;
    folderId: string;
}

export default function FileUpload({ onClose, onSuccess, folderId }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderId", folderId);

        try {
            const res = await fetch("/api/files", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert("Upload failed");
            }
        } catch (err) {
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="glass-panel fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '500px', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'hsl(var(--foreground))'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 className="heading-lg">Upload File to Folder</h2>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Files will be protected by the folder's password
                </p>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragActive ? 'hsl(var(--ring))' : 'hsl(var(--border))'}`,
                        borderRadius: 'var(--radius)',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        background: dragActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        transition: 'all 0.3s'
                    }}
                >
                    <Upload size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                    {file ? (
                        <div>
                            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{file.name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Drop your file here or click to browse</p>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Excel files (.xlsx, .xls, .csv)</p>
                        </>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        style={{ flex: 1 }}
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
}
