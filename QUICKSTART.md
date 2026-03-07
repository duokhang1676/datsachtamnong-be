# 🚀 Quick Start Guide - Backend

## Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

## Bước 2: Kiểm tra File .env

File `.env` đã được tạo sẵn với cấu hình MongoDB và Cloudinary của bạn.

Các biến môi trường quan trọng:
- `MONGO_URI` - MongoDB connection string (đã cấu hình)
- `CLOUDINARY_*` - Cloudinary credentials (đã cấu hình)
- `JWT_SECRET` - Secret key cho JWT (nên thay đổi trong production)
- `PORT` - Cổng server (mặc định: 5000)

## Bước 3: Tạo Admin User

Chạy script seed để tạo tài khoản admin đầu tiên:

```bash
npm run seed
```

Thông tin đăng nhập admin:
- **Email:** admin@datsachtamnong.com
- **Password:** admin123456

⚠️ **Quan trọng:** Đổi mật khẩu sau khi đăng nhập lần đầu!

## Bước 4: Chạy Server

### Development Mode (tự động reload khi code thay đổi):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Server sẽ chạy tại: **http://localhost:5000**

## Bước 5: Test API

### Kiểm tra server đang chạy:
```bash
GET http://localhost:5000/api/health
```

### Đăng nhập admin:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@datsachtamnong.com",
  "password": "admin123456"
}
```

Response sẽ trả về `token`, sử dụng token này cho các API cần authentication.

## Kết nối Frontend với Backend

Trong file frontend `.env.local`, thêm:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Documentation

Xem file `README.md` để biết chi tiết tất cả endpoints.

## Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra `MONGO_URI` trong file `.env`
- Kiểm tra kết nối internet
- Kiểm tra IP whitelist trên MongoDB Atlas

### Lỗi Cloudinary
- Kiểm tra các biến `CLOUDINARY_*` trong file `.env`
- Đảm bảo Cloud Name, API Key, API Secret chính xác

### Port đã được sử dụng
- Thay đổi `PORT` trong file `.env`
- Hoặc tắt ứng dụng đang dùng port 5000

## Các lệnh hữu ích

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Chạy production server
npm start

# Tạo admin user
npm run seed
```

## Cấu trúc thư mục

```
backend/
├── config/          # Database & Cloudinary config
├── controllers/     # Business logic
├── middleware/      # Auth & error handling
├── models/         # MongoDB schemas
├── routes/         # API routes
├── .env            # Environment variables
├── server.js       # Entry point
└── seed.js         # Database seeder
```

## Bảo mật

Trong production, nhớ:
1. Thay đổi `JWT_SECRET` thành chuỗi phức tạp
2. Đổi mật khẩu admin mặc định
3. Cập nhật `FRONTEND_URL` trong `.env`
4. Sử dụng HTTPS
5. Thiết lập rate limiting

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console logs khi chạy server
2. MongoDB Atlas dashboard
3. Cloudinary dashboard
4. Network requests trong browser DevTools
