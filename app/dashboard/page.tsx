"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import FolderTree from "../components/FolderTree";
import CreateFolder from "../components/CreateFolder";
import QRCodeDisplay from "../components/QRCodeDisplay";
import FileUpload from "../components/FileUpload";
import type { Folder } from "../api/folders/route";

export default function DashboardPage() {
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showQR, setShowQR] = useState<string | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [parentForSubfolder, setParentForSubfolder] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleFolderClick = (folder: Folder) => {
        setSelectedFolder(folder.id);
        setShowUpload(true);
    };

    const handleCreateSubfolder = (parentId: string) => {
        setParentForSubfolder(parentId);
        setShowCreateFolder(true);
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!confirm("Are you sure you want to delete this folder and all its contents?")) {
            return;
        }

        try {
            const res = await fetch(`/api/folders?id=${folderId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setRefreshTrigger(prev => prev + 1);
            } else {
                alert("Failed to delete folder");
            }
        } catch (err) {
            alert("Error deleting folder");
        }
    };

    const handleSuccess = () => {
        setShowCreateFolder(false);
        setShowUpload(false);
        setParentForSubfolder(null);
        setSelectedFolder(null);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Folders & Reports</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Organize your reports in folders with QR codes</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setParentForSubfolder(null);
                        setShowCreateFolder(true);
                    }}
                >
                    <FolderPlus size={18} style={{ marginRight: '0.5rem' }} />
                    Create Main Folder
                </button>
            </div>

            <FolderTree
                onFolderClick={handleFolderClick}
                onCreateSubfolder={handleCreateSubfolder}
                onDeleteFolder={handleDeleteFolder}
                onShowQR={(id) => setShowQR(id)}
                refreshTrigger={refreshTrigger}
            />

            {showCreateFolder && (
                <CreateFolder
                    onClose={() => {
                        setShowCreateFolder(false);
                        setParentForSubfolder(null);
                    }}
                    onSuccess={handleSuccess}
                    parentId={parentForSubfolder}
                    isSubfolder={!!parentForSubfolder}
                />
            )}

            {showUpload && selectedFolder && (
                <FileUpload
                    onClose={() => {
                        setShowUpload(false);
                        setSelectedFolder(null);
                    }}
                    onSuccess={handleSuccess}
                    folderId={selectedFolder}
                />
            )}

            {showQR && (
                <QRCodeDisplay
                    folderId={showQR}
                    onClose={() => setShowQR(null)}
                />
            )}
        </div>
    );
}
