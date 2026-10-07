import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { NextRequest } from 'next/server'
import { zip } from '@/lib/zip'

/** Télécharge l'extension DWAY Sync, réglée sur l'adresse de ce site. */
export async function GET(request: NextRequest) {
  const dir = path.join(process.cwd(), 'extension')
  const names = (await readdir(dir)).sort()
  const files = await Promise.all(
    names.map(async (name) => {
      const raw = await readFile(path.join(dir, name))
      const data = name.endsWith('.png')
        ? new Uint8Array(raw)
        : new TextEncoder().encode(raw.toString('utf8').replaceAll('__DWAY_ORIGIN__', request.nextUrl.origin))
      return { name, data }
    }),
  )
  return new Response(zip(files), {
    headers: { 'content-disposition': 'attachment; filename="dway-sync.zip"', 'cache-control': 'no-store' },
  })
}
