"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

interface QRCodeDisplayProps {
    folderId: string;
    onClose: () => void;
}

export default function QRCodeDisplay({ folderId, onClose }: QRCodeDisplayProps) {
    const [qrCode, setQrCode] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQR();
    }, [folderId]);

    const fetchQR = async () => {
        try {
            const res = await fetch(`/api/folders/${folderId}/qr`);
            if (res.ok) {
                const data = await res.json();
                setQrCode(data.qrCode);
                setUrl(data.url);
            }
        } catch (err) {
            console.error("Failed to fetch QR code", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `folder-${folderId}-qr.png`;
        link.click();
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
            <div className="glass-panel fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '400px', position: 'relative' }}>
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

                <h2 className="heading-lg" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    Folder QR Code
                </h2>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <img src={qrCode} alt="QR Code" style={{ width: '100%', maxWidth: '300px' }} />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                Scan to access folder:
                            </p>
                            <div style={{
                                background: 'hsl(var(--input))',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.85rem',
                                wordBreak: 'break-all'
                            }}>
                                {url}
                            </div>
                        </div>

                        <button className="btn btn-gradient" onClick={downloadQR} style={{ width: '100%' }}>
                            <Download size={18} style={{ marginRight: '0.5rem' }} />
                            Download QR Code
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
