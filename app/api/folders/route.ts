import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const FOLDERS_FILE = path.join(process.cwd(), "folder-metadata.json");

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    passwordHash: string | null;
    createdAt: string;
    qrCodePath: string | null;
}

async function readFolders(): Promise<Folder[]> {
    try {
        if (existsSync(FOLDERS_FILE)) {
            const data = await readFile(FOLDERS_FILE, "utf-8");
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Error reading folders", err);
    }
    return [];
}

async function writeFolders(folders: Folder[]) {
    await writeFile(FOLDERS_FILE, JSON.stringify(folders, null, 2));
}

function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// GET - List all folders
export async function GET() {
    const folders = await readFolders();
    return NextResponse.json({ folders });
}

// POST - Create new folder
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, parentId, password } = body;

        if (!name) {
            return NextResponse.json({ error: "Folder name required" }, { status: 400 });
        }

        const folders = await readFolders();

        // If parentId is provided, verify it exists
        if (parentId) {
            const parentExists = folders.some(f => f.id === parentId);
            if (!parentExists) {
                return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
            }
        }

        const id = crypto.randomUUID();
        const newFolder: Folder = {
            id,
            name,
            parentId: parentId || null,
            passwordHash: password ? hashPassword(password) : null,
            createdAt: new Date().toISOString(),
            qrCodePath: null, // Will be generated separately
        };

        folders.push(newFolder);
        await writeFolders(folders);

        return NextResponse.json({ success: true, folder: newFolder });
    } catch (error) {
        console.error("Create folder error:", error);
        return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
    }
}

// DELETE - Remove folder
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Folder ID required" }, { status: 400 });
        }

        const folders = await readFolders();
        const updatedFolders = folders.filter(f => f.id !== id && f.parentId !== id);

        await writeFolders(updatedFolders);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete folder error:", error);
        return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
    }
}
