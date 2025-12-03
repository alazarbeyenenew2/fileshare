import { NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const METADATA_FILE = path.join(process.cwd(), "file-metadata.json");

interface FileMetadata {
    id: string;
    filename: string;
    filepath: string;
    folderId: string;
    uploadedAt: string;
}

// Ensure upload directory exists
async function ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
}

// Read metadata
async function readMetadata(): Promise<FileMetadata[]> {
    try {
        if (existsSync(METADATA_FILE)) {
            const data = await readFile(METADATA_FILE, "utf-8");
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Error reading metadata", err);
    }
    return [];
}

// Write metadata
async function writeMetadata(metadata: FileMetadata[]) {
    await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

// GET - List all files
export async function GET() {
    const metadata = await readMetadata();
    const files = metadata.map(({ id, filename, folderId, uploadedAt }) => ({
        id,
        filename,
        folderId,
        uploadedAt,
    }));
    return NextResponse.json({ files });
}

// POST - Upload file
export async function POST(request: Request) {
    try {
        await ensureUploadDir();

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folderId = formData.get("folderId") as string;

        if (!file || !folderId) {
            return NextResponse.json({ error: "Missing file or folder ID" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const id = crypto.randomUUID();
        const filepath = path.join(UPLOAD_DIR, `${id}_${file.name}`);

        await writeFile(filepath, buffer);

        const metadata = await readMetadata();
        metadata.push({
            id,
            filename: file.name,
            filepath,
            folderId,
            uploadedAt: new Date().toISOString(),
        });

        await writeMetadata(metadata);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
