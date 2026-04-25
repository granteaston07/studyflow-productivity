import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GC_BASE = 'https://classroom.googleapis.com/v1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!
  const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!

  // User-scoped client so auth.uid() works in RLS policies
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  // Service-role client for direct DB writes (bypasses RLS where needed)
  const svc = createClient(supabaseUrl, serviceKey)

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* empty body */ }
  const { action } = body

  // ─────────────────────────────────────────────────────────────────
  // EXCHANGE: trade an auth code for tokens and store them
  // ─────────────────────────────────────────────────────────────────
  if (action === 'exchange') {
    const { code, code_verifier, redirect_uri } = body as Record<string, string>
    if (!code || !code_verifier || !redirect_uri)
      return json({ error: 'Missing params: code, code_verifier, redirect_uri' }, 400)

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri,
        grant_type: 'authorization_code',
        code_verifier,
      }),
    })

    if (!tokenRes.ok) {
      const detail = await tokenRes.text()
      console.error('Google token exchange failed:', detail)
      return json({ error: 'Token exchange failed', detail }, 400)
    }

    const tokens = await tokenRes.json()
    const { access_token, refresh_token, expires_in, scope } = tokens
    const expiresAt = new Date(Date.now() + Number(expires_in) * 1000).toISOString()

    // Get the Google account email
    const meRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const me: Record<string, string> = meRes.ok ? await meRes.json() : {}
    const googleEmail: string | null = me.email ?? null

    // Encrypt tokens via DB function
    const { data: encAccess } = await svc.rpc('encrypt_token', { token: access_token })
    const { data: encRefresh } = await svc.rpc('encrypt_token', { token: refresh_token ?? '' })

    // Upsert connection (one row per user)
    const { data: existing } = await svc
      .from('google_classroom_connections')
      .select('id, refresh_token')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      await svc
        .from('google_classroom_connections')
        .update({
          access_token,
          access_token_encrypted: encAccess,
          refresh_token: refresh_token ?? existing.refresh_token,
          refresh_token_encrypted: refresh_token ? encRefresh : undefined,
          scope,
          expires_at: expiresAt,
          google_email: googleEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await svc.from('google_classroom_connections').insert({
        user_id: user.id,
        access_token,
        access_token_encrypted: encAccess,
        refresh_token: refresh_token ?? '',
        refresh_token_encrypted: encRefresh,
        scope,
        expires_at: expiresAt,
        google_email: googleEmail,
      })
    }

    return json({ success: true, google_email: googleEmail })
  }

  // ─────────────────────────────────────────────────────────────────
  // STATUS: return connection status (no tokens)
  // ─────────────────────────────────────────────────────────────────
  if (action === 'status') {
    const { data: conn } = await svc
      .from('google_classroom_connections')
      .select('google_email, last_synced_at')
      .eq('user_id', user.id)
      .maybeSingle()

    return json({
      connected: !!conn,
      google_email: conn?.google_email ?? null,
      last_synced_at: conn?.last_synced_at ?? null,
    })
  }

  // ─────────────────────────────────────────────────────────────────
  // SYNC: fetch courses + assignments and upsert as tasks
  // ─────────────────────────────────────────────────────────────────
  if (action === 'sync') {
    const { data: conn } = await svc
      .from('google_classroom_connections')
      .select('id, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted, expires_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!conn) return json({ error: 'Not connected to Google Classroom' }, 400)

    // Decrypt stored access token
    let accessToken: string = conn.access_token
    if (conn.access_token_encrypted) {
      const { data: dec } = await svc.rpc('decrypt_token', { encrypted_token: conn.access_token_encrypted })
      if (dec) accessToken = dec
    }

    // Refresh if expired or expiring within 2 minutes
    const expiry = new Date(conn.expires_at)
    if (expiry <= new Date(Date.now() + 120_000)) {
      let refreshToken: string = conn.refresh_token
      if (conn.refresh_token_encrypted) {
        const { data: decR } = await svc.rpc('decrypt_token', { encrypted_token: conn.refresh_token_encrypted })
        if (decR) refreshToken = decR
      }

      if (refreshToken) {
        const refreshRes = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            grant_type: 'refresh_token',
          }),
        })

        if (refreshRes.ok) {
          const refreshed = await refreshRes.json()
          accessToken = refreshed.access_token
          const newExpiry = new Date(Date.now() + Number(refreshed.expires_in) * 1000).toISOString()
          const { data: encNew } = await svc.rpc('encrypt_token', { token: accessToken })
          await svc
            .from('google_classroom_connections')
            .update({
              access_token: accessToken,
              access_token_encrypted: encNew,
              expires_at: newExpiry,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conn.id)
        }
      }
    }

    // Fetch active courses
    const coursesRes = await fetch(`${GC_BASE}/courses?courseStates=ACTIVE&pageSize=20`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!coursesRes.ok) {
      const detail = await coursesRes.text()
      return json({ error: 'Failed to fetch courses', detail }, 400)
    }
    const coursesData = await coursesRes.json()
    const courses: Record<string, string>[] = coursesData.courses ?? []

    // Load existing synced tasks so we can update rather than duplicate
    const { data: existingTasks } = await svc
      .from('tasks')
      .select('id, google_classroom_id, title, due_date, description, subject')
      .eq('user_id', user.id)
      .eq('source', 'google_classroom')

    const existingMap = new Map<string, Record<string, string>>()
    for (const t of existingTasks ?? []) {
      if (t.google_classroom_id) existingMap.set(t.google_classroom_id, t)
    }

    let newCount = 0

    for (const course of courses) {
      const cwRes = await fetch(
        `${GC_BASE}/courses/${course.id}/courseWork?orderBy=dueDate%20desc&pageSize=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      if (!cwRes.ok) continue

      const cwData = await cwRes.json()
      const assignments: Record<string, unknown>[] = cwData.courseWork ?? []

      for (const assignment of assignments) {
        if (assignment.state !== 'PUBLISHED') continue

        // Build ISO due date if the assignment has one
        let dueDate: string | null = null
        if (assignment.dueDate) {
          const d = assignment.dueDate as Record<string, number>
          const t = (assignment.dueTime ?? {}) as Record<string, number>
          dueDate = new Date(d.year, d.month - 1, d.day, t.hours ?? 23, t.minutes ?? 59).toISOString()
        }

        const gcId = String(assignment.id)
        const title = String(assignment.title ?? 'Untitled assignment')
        const courseName = String(course.name ?? 'Google Classroom')
        const link = String(assignment.alternateLink ?? '')
        const rawDesc = assignment.description ? String(assignment.description) : ''
        const description = rawDesc ? `${rawDesc}\n\n${link}` : link

        if (existingMap.has(gcId)) {
          // Update only the GC-authoritative fields; leave user edits (priority, status, completed) intact
          const existing = existingMap.get(gcId)!
          await svc
            .from('tasks')
            .update({
              title,
              subject: courseName,
              description,
              due_date: dueDate,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
        } else {
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const status = dueDate && new Date(dueDate) < today ? 'overdue' : 'pending'

          await svc.from('tasks').insert({
            user_id: user.id,
            title,
            subject: courseName,
            description,
            due_date: dueDate,
            priority: 'medium',
            status,
            completed: false,
            sort_order: 999,
            source: 'google_classroom',
            google_classroom_id: gcId,
            google_course_id: String(course.id),
            recurring: 'none',
          })
          newCount++
        }
      }
    }

    await svc
      .from('google_classroom_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', conn.id)

    return json({ success: true, synced: newCount, total: existingMap.size + newCount })
  }

  // ─────────────────────────────────────────────────────────────────
  // DISCONNECT: remove connection, optionally delete tasks
  // ─────────────────────────────────────────────────────────────────
  if (action === 'disconnect') {
    const { delete_tasks = false } = body as { delete_tasks?: boolean }

    if (delete_tasks) {
      await svc
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'google_classroom')
    }

    await svc
      .from('google_classroom_connections')
      .delete()
      .eq('user_id', user.id)

    return json({ success: true })
  }

  return json({ error: 'Unknown action' }, 400)
})
