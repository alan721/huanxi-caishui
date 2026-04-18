/**
 * POST /api/contact
 * 接收表单数据，发送邮件通知（使用 Resend）
 *
 * 环境变量（在 Vercel Dashboard 中设置）：
 *   RESEND_API_KEY  — Resend 的 API Key（免费账号每月 3000 封）
 *   NOTIFY_EMAIL    — 接收通知的邮箱，例如你的企业邮箱
 */

export const config = { runtime: 'edge' }

export default async function handler(req) {
  // 只允许 POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 解析请求体
  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ success: false, message: '请求格式错误' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { name, phone, type, message } = body

  // 服务端校验
  if (!name || !phone) {
    return new Response(JSON.stringify({ success: false, message: '姓名和电话为必填项' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const phoneClean = phone.replace(/-/g, '')
  if (!/^1[3-9]\d{9}$/.test(phoneClean)) {
    return new Response(JSON.stringify({ success: false, message: '手机号格式不正确' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 时间戳（北京时间）
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

  // ── 发送邮件（Resend）
  const resendKey = process.env.RESEND_API_KEY
  const notifyEmail = process.env.NOTIFY_EMAIL || 'huanxicaishui@example.com'

  if (resendKey) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@huanxicaishui.com',   // 需在 Resend 配置域名后替换
          to: [notifyEmail],
          subject: `【欢喜财税官网】新询盘 — ${name} ${phoneClean}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fafaf8;border-radius:12px;">
              <h2 style="color:#C8442A;margin-bottom:4px;font-size:20px;">新询盘通知</h2>
              <p style="color:#6B6560;font-size:13px;margin-bottom:24px;">来自欢喜财税官网联系表单 · ${now}</p>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e8e3dc;color:#78716c;font-size:13px;width:100px;">姓名</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e8e3dc;font-size:15px;font-weight:600;color:#1c1917;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e8e3dc;color:#78716c;font-size:13px;">联系电话</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e8e3dc;font-size:15px;font-weight:600;color:#C8442A;">${phoneClean}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e8e3dc;color:#78716c;font-size:13px;">咨询类型</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e8e3dc;font-size:14px;color:#1c1917;">${type || '未选择'}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;color:#78716c;font-size:13px;vertical-align:top;padding-top:16px;">留言内容</td>
                  <td style="padding:12px 0;font-size:14px;color:#44403c;line-height:1.7;padding-top:16px;">${message || '（无留言）'}</td>
                </tr>
              </table>
              <div style="margin-top:28px;padding:16px 20px;background:#fff3f0;border-radius:8px;border-left:3px solid #C8442A;">
                <p style="margin:0;font-size:13px;color:#C8442A;font-weight:600;">请尽快联系客户：${phoneClean}</p>
              </div>
            </div>
          `,
        }),
      })

      if (!emailRes.ok) {
        console.error('Resend API error:', await emailRes.text())
      }
    } catch (err) {
      console.error('Email send failed:', err)
      // 邮件失败不影响用户体验，继续返回成功
    }
  } else {
    // 开发环境：打印到控制台
    console.log('📬 新询盘（未配置 RESEND_API_KEY）:', { name, phone: phoneClean, type, message, time: now })
  }

  return new Response(JSON.stringify({ success: true, message: '提交成功' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
