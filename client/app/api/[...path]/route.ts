import { isProduction } from "@/lib/constants"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = isProduction ? "http://127.0.0.1:4000" : "http://localhost:4000"

async function handler(req: NextRequest) {
    const path = req.nextUrl.pathname.replace("/api", "")
    const url = BACKEND_URL + path

    const res = await fetch(url, {
        method: req.method,
        headers: req.headers,
        body:
            req.method === "GET" || req.method === "HEAD"
                ? undefined
                : await req.text(),
    })

    return new NextResponse(res.body, {
        status: res.status,
        headers: res.headers,
    })
}

export async function GET(req: NextRequest) {
    return handler(req)
}
export async function POST(req: NextRequest) {
    return handler(req)
}
export async function PUT(req: NextRequest) {
    return handler(req)
}
export async function PATCH(req: NextRequest) {
    return handler(req)
}
export async function DELETE(req: NextRequest) {
    return handler(req)
}
