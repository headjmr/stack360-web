// Vercel serverless function — POST /api/contact
const FREE = new Set(['gmail.com','googlemail.com','outlook.com','hotmail.com','live.com','yahoo.com','ymail.com','icloud.com','me.com','aol.com','proton.me','protonmail.com','gmx.com','mail.com']);
function isWorkEmail(v){ const m=/^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec((v||'').trim().toLowerCase()); return !!m && !FREE.has(m[1]); }
export default async function handler(req, res){
  if (req.method !== 'POST'){ res.setHeader('Allow','POST'); return res.status(405).json({error:'Method not allowed'}); }
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (b.website) return res.status(200).json({ ok:true });
    const name=(b.name||'').trim(), company=(b.company||'').trim(), title=(b.title||'').trim(),
          location=(b.location||'').trim(), phone=(b.phone||'').trim(), email=(b.email||'').trim();
    if (!name || !company || !title || !location || !phone || !isWorkEmail(email)){
      return res.status(400).json({ error:'Invalid submission' });
    }
    const row = { name, pe_company:company, title, city_country:location, phone,
                  work_email:email, source:(b.source||'landing'),
                  user_agent:(req.headers['user-agent']||'').slice(0,300) };
    const sb = await fetch(`${process.env.SUPABASE_URL}/rest/v1/contact_leads`, {
      method:'POST',
      headers:{ apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type':'application/json', Prefer:'return=minimal' },
      body: JSON.stringify(row)
    });
    if (!sb.ok) throw new Error('supabase ' + sb.status + ': ' + (await sb.text()));
    if (process.env.RESEND_API_KEY){
      await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers:{ Authorization:`Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json' },
        body: JSON.stringify({
          from:'Stack360 <notifications@stack360.ai>', to:['info@stack360.ai'], reply_to: email,
          subject:`New Founding Partner enquiry — ${company}`,
          text:`Name: ${name}\nFirm: ${company}\nTitle: ${title}\nLocation: ${location}\nPhone: ${phone}\nWork email: ${email}\nSource: ${row.source}`
        })
      }).catch(e => console.error('resend error', e));
    }
    return res.status(200).json({ ok:true });
  } catch (err){
    console.error('contact error', err);
    return res.status(500).json({ error:'Server error', detail: String(err && err.message || err) }); // TEMP: shows real reason
  }
}
