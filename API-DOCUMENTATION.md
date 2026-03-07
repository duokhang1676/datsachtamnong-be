# API DOCUMENTATION - ĐẤT SẠCH TAM NÔNG

> **Version:** 2.0  
> **Ngày cập nhật:** 6/3/2026  
> **Base URL:** `http://localhost:5000/api`

---

## 📋 TỔNG QUAN THAY ĐỔI

### ✅ Đã thêm:
1. **Banner API** - Quản lý banner trang chủ

### ⚠️ Đã điều chỉnh:
1. **Product Model** - Bỏ price, stock, reviews, sold (chuyển sang catalog)
2. **Customer Model** - Bỏ order tracking (chỉ newsletter)
3. **Order Controller** - Bỏ stock management logic

---

## 🆕 BANNER API

### **GET /api/banners**
Lấy danh sách banners

**Query Parameters:**
```
position      : string (hero|middle|bottom|sidebar)
isActive      : boolean
includeInactive: boolean (chỉ admin)
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "title": "Banner Chào Mừng",
      "description": "Giảm giá 20%",
      "image": {
        "url": "https://cloudinary.com/...",
        "publicId": "banners/..."
      },
      "link": "/products",
      "linkText": "Xem ngay",
      "position": "hero",
      "order": 1,
      "isActive": true,
      "startDate": "2026-03-01",
      "endDate": "2026-03-31",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### **GET /api/banners/:id**
Lấy chi tiết banner

**Response:**
```json
{
  "success": true,
  "data": { /* Banner object */ }
}
```

---

### **POST /api/banners** 🔒 Admin
Tạo banner mới

**Body:**
```json
{
  "title": "Banner Mùa Xuân",
  "description": "Ưu đãi đặc biệt",
  "image": {
    "url": "https://cloudinary.com/...",
    "publicId": "banners/spring"
  },
  "link": "/products/spring-sale",
  "linkText": "Mua ngay",
  "position": "hero",
  "order": 1,
  "isActive": true,
  "startDate": "2026-03-15",
  "endDate": "2026-04-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Created banner */ }
}
```

---

### **PUT /api/banners/:id** 🔒 Admin
Cập nhật banner

**Body:** Tương tự POST (có thể partial update)

---

### **DELETE /api/banners/:id** 🔒 Admin
Xóa banner

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

---

### **PUT /api/banners/reorder** 🔒 Admin
Sắp xếp lại thứ tự banner

**Body:**
```json
{
  "banners": [
    { "id": "banner_id_1", "order": 1 },
    { "id": "banner_id_2", "order": 2 },
    { "id": "banner_id_3", "order": 3 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã cập nhật thứ tự banner"
}
```

---

## 📦 PRODUCT API (Updated)

### **Thay đổi Schema:**

**Đã bỏ:**
- ❌ `price` - Giá bán
- ❌ `originalPrice` - Giá gốc
- ❌ `discount` - % giảm giá
- ❌ `stock` - Tồn kho
- ❌ `unit` - Đơn vị tính
- ❌ `weight` - Khối lượng
- ❌ `rating` - Đánh giá
- ❌ `reviews` - Nhận xét
- ❌ `sold` - Đã bán

**Đã thay đổi:**
- ✏️ `specifications` - Từ Array → String (text tự do)
- ✏️ `status` - Enum: `available` | `unavailable` | `discontinued`

**Schema hiện tại:**
```javascript
{
  "_id": "...",
  "name": "Đất sạch dinh dưỡng",
  "slug": "dat-sach-dinh-duong",
  "description": "<p>Mô tả chi tiết...</p>",
  "shortDescription": "Mô tả ngắn",
  "category": "category_id",
  "images": [
    {
      "url": "https://cloudinary.com/...",
      "publicId": "products/..."
    }
  ],
  "packaging": "Bao 20kg",
  "specifications": "Thành phần: ...\nCông dụng: ...",
  "features": [
    "Tơi xốp",
    "Giàu dinh dưỡng",
    "An toàn"
  ],
  "isFeatured": true,
  "isActive": true,
  "status": "available",
  "views": 120,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### **Các API không đổi:**
- `GET /api/products` - Lấy danh sách
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` 🔒 - Tạo mới
- `PUT /api/products/:id` 🔒 - Cập nhật
- `DELETE /api/products/:id` 🔒 - Xóa

---

## 👥 CUSTOMER API (Updated)

### **Thay đổi Schema:**

**Đã bỏ:**
- ❌ `orders` - Array order IDs
- ❌ `totalOrders` - Tổng đơn hàng
- ❌ `totalSpent` - Tổng chi tiêu
- ❌ `lastOrderAt` - Ngày mua cuối

**Mục đích:** Chỉ dùng cho Newsletter/Email marketing

**Schema hiện tại:**
```javascript
{
  "_id": "...",
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "phone": "0123456789",
  "source": "footer",        // footer | checkout | manual
  "status": "active",        // active | unsubscribed
  "note": "",
  "ipAddress": "192.168.1.1",
  "subscribedAt": "2026-03-06",
  "unsubscribedAt": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### **Các API không đổi:**
- `GET /api/customers` 🔒 - Lấy danh sách
- `GET /api/customers/:id` 🔒 - Chi tiết
- `POST /api/customers` - Đăng ký newsletter
- `PUT /api/customers/:id` 🔒 - Cập nhật
- `DELETE /api/customers/:id` 🔒 - Xóa
- `POST /api/customers/unsubscribe` - Hủy đăng ký

---

## 📋 ORDER API (Updated)

### **Thay đổi Logic:**

**Đã bỏ:**
- ❌ Kiểm tra tồn kho (`product.stock`)
- ❌ Cập nhật số lượng bán (`product.sold`)
- ❌ Cập nhật thống kê khách hàng (`customer.totalOrders`, `totalSpent`, etc.)
- ❌ Restore stock khi hủy đơn

**Giữ nguyên:**
- ✅ Tạo đơn hàng
- ✅ Quản lý trạng thái
- ✅ Lịch sử thay đổi
- ✅ Tạo customer record (nếu chưa tồn tại - cho mục đích newsletter)

### **POST /api/orders**
Tạo đơn hàng mới

**Body:**
```json
{
  "customer": {
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "phone": "0123456789",
    "address": {
      "street": "123 Đường ABC",
      "ward": "Phường 1",
      "district": "Quận 1",
      "city": "TP.HCM",
      "fullAddress": "123 Đường ABC, Phường 1, Quận 1, TP.HCM"
    }
  },
  "items": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "totalAmount": 200000,
  "shippingFee": 30000,
  "paymentMethod": "cod",
  "note": "Giao giờ hành chính"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "orderNumber": "DN2603060001",
    "customer": { /* ... */ },
    "items": [
      {
        "product": "product_id",
        "name": "Đất sạch dinh dưỡng",
        "image": "https://...",
        "quantity": 2
      }
    ],
    "totalAmount": 200000,
    "shippingFee": 30000,
    "finalAmount": 230000,
    "paymentMethod": "cod",
    "paymentStatus": "pending",
    "status": "pending",
    "createdAt": "..."
  }
}
```

**Lưu ý:**
- Không cần truyền `price` và `subtotal` cho mỗi item (sẽ lấy từ Product)
- `totalAmount` được tính từ frontend
- Tự động tạo customer record nếu chưa có (cho newsletter)

---

## 🔐 AUTHENTICATION

Tất cả routes có đánh dấu 🔒 cần token:

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Admin routes cần:**
- Token hợp lệ
- User có `role: "admin"`

---

## 📊 RESPONSE FORMAT

### **Success Response:**
```json
{
  "success": true,
  "data": { /* ... */ },
  "count": 10,        // Nếu là list
  "total": 100,       // Nếu có pagination
  "totalPages": 10,   // Nếu có pagination
  "currentPage": 1    // Nếu có pagination
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🎯 PAGINATION

Áp dụng cho các API list:

**Query Parameters:**
```
page  : number (default: 1)
limit : number (default: 20)
```

**Example:**
```
GET /api/products?page=2&limit=10
```

---

## 🔍 FILTER & SEARCH

### **Products:**
```
GET /api/products?category=catId&status=available&search=keyword
```

### **Customers:**
```
GET /api/customers?status=active&source=footer&search=email
```

### **Orders:**
```
GET /api/orders?status=pending&search=orderNumber&startDate=2026-03-01&endDate=2026-03-31
```

---

## 📁 COLLECTIONS SUMMARY

| Collection | Purpose | Public API | Admin API |
|-----------|---------|------------|-----------|
| **Banner** | Banner trang chủ | ✅ Read | ✅ Full CRUD |
| **Product** | Catalog sản phẩm | ✅ Read | ✅ Full CRUD |
| **Category** | Danh mục | ✅ Read | ✅ Full CRUD |
| **Customer** | Newsletter | ✅ Subscribe | ✅ Full CRUD |
| **Contact** | Liên hệ | ✅ Create | ✅ Read/Update |
| **News** | Tin tức/Blog | ✅ Read | ✅ Full CRUD |
| **Order** | Đơn hàng | ✅ Create | ✅ Full CRUD |
| **User** | Tài khoản | ✅ Auth | ✅ Full CRUD |
| **Settings** | Cấu hình | ✅ Read | ✅ Update |

---

## 🛠️ TESTING

### **Postman Collection:**
Import file: `backend/postman/DatSachTamNong.postman_collection.json`

### **Test Environment:**
```
BASE_URL=http://localhost:5000/api
ADMIN_TOKEN=<your_admin_token>
```

---

## 💡 BEST PRACTICES

1. **Images:** Upload qua `/api/upload` trước, nhận URL rồi mới tạo banner/product
2. **Banner Order:** Sử dụng `/api/banners/reorder` để sắp xếp thay vì update từng cái
3. **Product Specs:** Format text với line breaks (`\n`) hoặc markdown
4. **Customer Source:** Luôn set `source` để tracking (`footer`, `checkout`, `manual`)
5. **Error Handling:** Luôn check `success` field trước khi xử lý `data`

---

## 🔄 MIGRATION NOTES

### **Từ version 1.x lên 2.0:**

**Product:**
- Bỏ tất cả logic liên quan giá và tồn kho
- `specifications` từ object array → string
- `status` enum đổi: `in-stock`, `out-of-stock` → `available`, `unavailable`

**Customer:**
- Bỏ tất cả tracking đơn hàng
- Chỉ dùng cho newsletter

**Order:**
- Không còn tự động cập nhật stock
- Không còn cập nhật customer stats
- `items[].price` và `items[].subtotal` không bắt buộc

### **Script Migration:**
```bash
# Chạy trong terminal backend
node migrations/v2-cleanup.js
```

---

**Cần hỗ trợ thêm? Contact: admin@datsachtamnong.vn**
