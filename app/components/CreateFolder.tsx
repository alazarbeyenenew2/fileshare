"use client";

import { useState } from "react";
import { X, Folder as FolderIcon, Lock } from "lucide-react";

interface CreateFolderProps {
    onClose: () => void;
    onSuccess: () => void;
    parentId?: string | null;
    isSubfolder?: boolean;
}

export default function CreateFolder({ onClose, onSuccess, parentId = null, isSubfolder = false }: CreateFolderProps) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!name) return;

        setCreating(true);
        try {
            const res = await fetch("/api/folders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    password: isSubfolder ? null : password,
                    parentId
                }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert("Failed to create folder");
            }
        } catch (err) {
            alert("Error creating folder");
        } finally {
            setCreating(false);
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
            <div className="glass-panel fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '450px', position: 'relative' }}>
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
                        <FolderIcon color="white" size={30} />
                    </div>
                    <h2 className="heading-lg">
                        {isSubfolder ? "Create Subfolder" : "Create Main Folder"}
                    </h2>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                        {isSubfolder ? "Subfolders don't require passwords" : "Set a password to protect this folder"}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            Folder Name
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter folder name"
                            autoFocus
                        />
                    </div>

                    {!isSubfolder && (
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                <Lock size={16} />
                                Password
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreate}
                            disabled={!name || creating}
                            style={{ flex: 1 }}
                        >
                            {creating ? "Creating..." : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
