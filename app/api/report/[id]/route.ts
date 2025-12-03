import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const METADATA_FILE = path.join(process.cwd(), "file-metadata.json");

interface FileMetadata {
    id: string;
    filename: string;
    filepath: string;
    passwordHash: string;
    uploadedAt: string;
}

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

function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { password } = await request.json();

    const metadata = await readMetadata();
    const fileData = metadata.find((f) => f.id === id);

    if (!fileData) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (hashPassword(password) !== fileData.passwordHash) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Read the file and send it back
    const fileBuffer = await readFile(fileData.filepath);
    const base64 = fileBuffer.toString("base64");

    return NextResponse.json({
        success: true,
        filename: fileData.filename,
        data: base64,
    });
}
