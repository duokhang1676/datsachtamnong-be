# Đất Sạch Tam Nông - Backend API

Backend API cho website bán đất hữu cơ Đất Sạch Tam Nông.

## Công nghệ sử dụng

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Cloudinary** - Image hosting
- **bcryptjs** - Password hashing

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/datsachtamnong
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/datsachtamnong

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Seed dữ liệu (Optional)

```bash
npm run seed
```

### 5. Chạy server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/updatedetails` - Cập nhật thông tin
- `PUT /api/auth/updatepassword` - Đổi mật khẩu

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `GET /api/products/slug/:slug` - Lấy sản phẩm theo slug
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)
- `POST /api/products/:id/reviews` - Thêm đánh giá

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng (Admin)
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id` - Cập nhật đơn hàng (Admin)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin)
- `DELETE /api/orders/:id` - Xóa đơn hàng (Admin)
- `GET /api/orders/stats/dashboard` - Thống kê đơn hàng (Admin)

### Customers
- `GET /api/customers` - Lấy danh sách khách hàng (Admin)
- `GET /api/customers/:id` - Lấy chi tiết khách hàng (Admin)
- `POST /api/customers` - Đăng ký nhận tin
- `PUT /api/customers/:id` - Cập nhật khách hàng (Admin)
- `DELETE /api/customers/:id` - Xóa khách hàng (Admin)
- `PUT /api/customers/:id/unsubscribe` - Hủy đăng ký
- `GET /api/customers/stats/dashboard` - Thống kê khách hàng (Admin)

### Contacts
- `GET /api/contacts` - Lấy danh sách liên hệ (Admin)
- `GET /api/contacts/:id` - Lấy chi tiết liên hệ (Admin)
- `POST /api/contacts` - Gửi liên hệ
- `PUT /api/contacts/:id/status` - Cập nhật trạng thái (Admin)
- `DELETE /api/contacts/:id` - Xóa liên hệ (Admin)
- `GET /api/contacts/stats/dashboard` - Thống kê liên hệ (Admin)

### Upload
- `POST /api/upload/image` - Upload ảnh đơn (Admin)
- `POST /api/upload/images` - Upload nhiều ảnh (Admin)
- `DELETE /api/upload/image/:publicId` - Xóa ảnh (Admin)

### Health Check
- `GET /api/health` - Kiểm tra trạng thái server

## Tạo Admin User

Để tạo tài khoản admin đầu tiên, sử dụng endpoint `/api/auth/register` với `role: "admin"`:

```bash
POST /api/auth/register
{
  "name": "Admin",
  "email": "admin@datsachtamnong.com",
  "password": "yourpassword",
  "role": "admin"
}
```

## Database Models

### User
- Quản lý tài khoản admin và user
- Mã hóa password với bcrypt
- Phân quyền theo role (admin/user)

### Product
- Quản lý sản phẩm
- Tự động tạo slug từ tên
- Hỗ trợ nhiều ảnh, đánh giá, thông số kỹ thuật

### Order
- Quản lý đơn hàng
- Tự động tạo mã đơn hàng (DNyymmddxxxx)
- Lịch sử thay đổi trạng thái

### Customer
- Quản lý khách hàng đăng ký nhận tin
- Theo dõi nguồn (footer/checkout/manual)
- Tự động cập nhật từ đơn hàng

### Contact
- Quản lý liên hệ, góp ý từ khách hàng
- Theo dõi trạng thái phản hồi

## Security

- JWT authentication
- Password hashing với bcrypt
- Protected routes với middleware
- Role-based authorization
- Input validation

## Error Handling

API sử dụng error handling middleware thống nhất:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Response Format

Tất cả responses đều có format:

```json
{
  "success": true,
  "data": {...}
}
```

Hoặc với pagination:

```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "totalPages": 10,
  "currentPage": 1,
  "data": [...]
}
```

## Deployment

### Deploy lên Render

1. Tạo tài khoản tại [Render.com](https://render.com)

2. Tạo MongoDB Atlas database:
   - Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Tạo cluster mới (free tier)
   - Lấy connection string

3. Tạo Cloudinary account:
   - Truy cập [Cloudinary](https://cloudinary.com)
   - Lấy Cloud Name, API Key, API Secret

4. Tạo Web Service mới trên Render:
   - Connect GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`

5. Thêm Environment Variables trên Render:
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

6. Deploy!

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT | Random secure string |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

## License

ISC

## Support

For support, email support@datsachtamnong.com
