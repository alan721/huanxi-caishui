/**
 * POST /api/contact
 * 接收官网询盘表单，发邮件通知（Resend）
 *
 * Vercel 环境变量（Dashboard → Settings → Environment Variables）：
 *   RESEND_API_KEY   — resend.com 免费注册获取，每月 3000 封
 *   NOTIFY_EMAIL     — 接收询盘的邮箱
 *   FROM_EMAIL       — 发件人地址（需在 Resend 验证域名后替换，默认可用 onboarding@resend.dev 测试）
 */

export const config = { runtime: 'edge' }

export default async function handler(req) {
  // 只接受 POST
  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405)
  }

  // 解析 body
  let body
  try {
    body = await req.json()
  } catch {
    return json({ success: false, message: '请求格式错误' }, 400)
  }

  const { name, phone, type, message } = body

  // 服务端校验
  if (!name?.trim() || !phone?.trim()) {
    return json({ success: false, message: '姓名和手机号为必填项' }, 400)
  }
  const phoneClean = phone.replace(/-/g, '').trim()
  if (!/^1[3-9]\d{9}$/.test(phoneClean)) {
    return json({ success: false, message: '手机号格式不正确' }, 400)
  }

  // 北京时间
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

  // ── 发送邮件
  const key   = process.env.RESEND_API_KEY
  const toEmail   = process.env.NOTIFY_EMAIL   || 'huanxicaishui@example.com'
  const fromEmail = process.env.FROM_EMAIL      || 'onboarding@resend.dev'

  if (key) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `欢喜财税官网 <${fromEmail}>`,
          to: [toEmail],
          subject: `【欢喜财税官网询盘】${name}  ${phoneClean}`,
          html: buildEmail({ name, phone: phoneClean, type, message, now }),
        }),
      })
    } catch (e) {
      console.error('Resend error:', e)
    }
  } else {
    // 开发模式：打印到控制台
    console.log('📬 新询盘（未配置 RESEND_API_KEY）', { name, phone: phoneClean, type, message, now })
  }

  return json({ success: true })
}

// ── 工具函数
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

function buildEmail({ name, phone, type, message, now }) {
  return `
<div style="font-family:'PingFang SC',sans-serif;max-width:580px;margin:0 auto;background:#FDFAF4;border-radius:16px;overflow:hidden">
  <!-- header -->
  <div style="background:linear-gradient(135deg,#977745,#C4A06A);padding:32px 36px">
    <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:.1em">欢喜财税</div>
    <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;letter-spacing:.05em">官网新询盘通知</div>
  </div>
  <!-- body -->
  <div style="padding:36px">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #EDE5D2;width:90px;font-size:14px;color:#B0A080;font-weight:500">姓名</td>
        <td style="padding:14px 0;border-bottom:1px solid #EDE5D2;font-size:17px;font-weight:700;color:#1A1510">${name}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #EDE5D2;font-size:14px;color:#B0A080;font-weight:500">手机</td>
        <td style="padding:14px 0;border-bottom:1px solid #EDE5D2;font-size:17px;font-weight:700;color:#977745">${phone}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #EDE5D2;font-size:14px;color:#B0A080;font-weight:500">咨询类型</td>
        <td style="padding:14px 0;border-bottom:1px solid #EDE5D2;font-size:16px;color:#1A1510">${type || '未选择'}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;font-size:14px;color:#B0A080;font-weight:500;vertical-align:top;padding-top:18px">留言</td>
        <td style="padding:14px 0;font-size:15px;color:#3A2E1C;line-height:1.8;padding-top:18px">${message || '（无留言）'}</td>
      </tr>
    </table>
    <!-- cta -->
    <div style="margin-top:28px;padding:18px 22px;background:#F8F2E4;border-radius:10px;border-left:3px solid #977745">
      <div style="font-size:14px;color:#977745;font-weight:600">📞 请尽快联系客户：${phone}</div>
    </div>
    <div style="margin-top:20px;font-size:12px;color:#B0A080">提交时间：${now}</div>
  </div>
</div>`
}
