import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import type { Folder } from "../route";

const FOLDERS_FILE = path.join(process.cwd(), "folder-metadata.json");

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

// GET - Get folder details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const folders = await readFolders();
    const folder = folders.find(f => f.id === id);

    if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder });
}

// PUT - Update folder
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, password } = body;

        const folders = await readFolders();
        const folderIndex = folders.findIndex(f => f.id === id);

        if (folderIndex === -1) {
            return NextResponse.json({ error: "Folder not found" }, { status: 404 });
        }

        if (name) {
            folders[folderIndex].name = name;
        }

        if (password !== undefined) {
            folders[folderIndex].passwordHash = password ? hashPassword(password) : null;
        }

        await writeFolders(folders);

        return NextResponse.json({ success: true, folder: folders[folderIndex] });
    } catch (error) {
        console.error("Update folder error:", error);
        return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
    }
}

// POST - Verify folder password
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { password } = await request.json();

        const folders = await readFolders();
        const folder = folders.find(f => f.id === id);

        if (!folder) {
            return NextResponse.json({ error: "Folder not found" }, { status: 404 });
        }

        // If no password is set, allow access
        if (!folder.passwordHash) {
            return NextResponse.json({ success: true, folder });
        }

        // Verify password
        if (hashPassword(password) !== folder.passwordHash) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        return NextResponse.json({ success: true, folder });
    } catch (error) {
        console.error("Verify password error:", error);
        return NextResponse.json({ error: "Failed to verify password" }, { status: 500 });
    }
}
