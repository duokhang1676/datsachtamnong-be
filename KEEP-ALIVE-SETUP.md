# Keep-Alive Setup - Ngăn Render Free Tier Sleep

## 🏥 Health Check Endpoint

Backend đã có sẵn health check endpoint:

```
GET https://your-backend.onrender.com/api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Đất Sạch Tam Nông API is running",
  "timestamp": "2026-03-07T10:30:00.000Z"
}
```

## 🔄 Ngăn Render Free Tier Sleep

Render free tier sẽ sleep sau 15 phút không hoạt động. Để giữ service luôn active, ping health endpoint định kỳ.

### Phương pháp 1: UptimeRobot (Khuyến nghị - FREE)

1. **Đăng ký tài khoản:**
   - Truy cập: https://uptimerobot.com/
   - Đăng ký miễn phí (50 monitors)

2. **Tạo Monitor:**
   - Click "+ Add New Monitor"
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `Tam Nong API Health`
   - URL: `https://your-backend.onrender.com/api/health`
   - Monitoring Interval: **5 minutes** (free tier)
   - Click "Create Monitor"

3. **Kết quả:**
   - UptimeRobot sẽ ping endpoint mỗi 5 phút
   - Service sẽ không sleep
   - Nhận email alert nếu API down

### Phương pháp 2: Cron-job.org (FREE)

1. **Đăng ký:**
   - Truy cập: https://cron-job.org/
   - Đăng ký miễn phí

2. **Tạo Cron Job:**
   - Click "Create cronjob"
   - Title: `Tam Nong API Ping`
   - URL: `https://your-backend.onrender.com/api/health`
   - Schedule: Every 5 minutes = `*/5 * * * *`
   - Click "Create"

### Phương pháp 3: EasyCron (FREE)

1. Truy cập: https://www.easycron.com/
2. Tạo cron job ping health endpoint mỗi 10 phút
3. Free tier: 1 cron job

### Phương pháp 4: GitHub Actions (Nếu có GitHub repo)

Tạo file `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Backend Alive

on:
  schedule:
    # Ping mỗi 10 phút (rate limit GitHub Actions)
    - cron: '*/10 * * * *'
  workflow_dispatch: # Manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          curl -f https://your-backend.onrender.com/api/health || exit 1
```

**Lưu ý:** GitHub Actions có rate limit, không nên ping quá thường xuyên.

## 📊 Monitoring & Alerts

### UptimeRobot Settings (Khuyến nghị)

**Alert Contacts:**
- Email: Nhận thông báo khi API down/up
- SMS: (Paid plan)
- Webhook: Tích hợp Discord/Slack

**Status Page:**
- Tạo public status page để khách hàng kiểm tra
- URL: https://stats.uptimerobot.com/your-page

## 🧪 Test Health Endpoint

### Curl
```bash
curl https://your-backend.onrender.com/api/health
```

### PowerShell
```powershell
Invoke-RestMethod -Uri "https://your-backend.onrender.com/api/health"
```

### Browser
Mở: `https://your-backend.onrender.com/api/health`

## ⚠️ Lưu Ý

1. **Render Free Tier Limits:**
   - 750 giờ/tháng (nếu chỉ 1 service)
   - Sleep sau 15 phút không hoạt động
   - Ping mỗi 5-10 phút sẽ giữ service active 24/7

2. **Không cần ping quá thường xuyên:**
   - 5 phút = An toàn nhất
   - 10 phút = Vẫn OK
   - 14 phút = Nguy hiểm (sát ngưỡng 15 phút)

3. **Chi phí bandwidth:**
   - Health endpoint rất nhẹ (~100 bytes)
   - Ping mỗi 5 phút ≈ 288 requests/ngày ≈ ~30KB/ngày
   - Hoàn toàn trong free tier của Render

## 🚀 Khuyến nghị

**Setup tối ưu:**
1. Dùng **UptimeRobot** (free, 50 monitors, email alerts)
2. Ping interval: **5 phút**
3. Bật email alerts để biết khi API down
4. Tạo status page public cho transparent

**URL cần monitor:**
- Health: `https://your-backend.onrender.com/api/health`
- (Optional) Frontend: `https://datsachtamnong-fe.vercel.app/`

---

**Hoàn thành setup:** Backend API sẽ luôn active, không sleep, response time < 1s
