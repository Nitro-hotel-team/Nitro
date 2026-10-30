# 🚀 NITRO GRAND HOTEL — HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG (DEPLOYMENT GUIDE)

Tài liệu bàn giao triển khai phân hệ Frontend dành cho đội ngũ **DevOps & Backend** thuộc dự án Nitro Grand Hotel 4★.

---

## 1. YÊU CẦU HỆ THỐNG TỐI THIỂU
- **Node.js**: Phiên bản `>= 18.0.0` (Khuyến nghị sử dụng LTS `v20.x` hoặc `v22.x`).
- **NPM**: Phiên bản `>= 9.0.0`.
- **Trình duyệt mục tiêu**: Google Chrome (88+), Microsoft Edge (88+), Mozilla Firefox (85+), Apple Safari (14+).

---

## 2. TRIỂN KHAI VỚI DOCKER & NGINX

### 2.1. Tệp Dockerfile mẫu cho Frontend
Tạo tệp `Dockerfile` tại thư mục gốc `frontend/`:

```dockerfile
# Stage 1: Build production bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:verify

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.2. Tệp cấu hình Nginx mẫu (`nginx.conf`)
Đảm bảo định tuyến Single Page Application (SPA) hoạt động mượt mà và nén Gzip hiệu quả:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # SPA Fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Assets Long-term Cache (1 Year)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

### 2.3. Lệnh khởi chạy Docker Container
```bash
# Đóng gói image
docker build -t nitro-hotel-frontend:latest -f Dockerfile .

# Khởi chạy container trên cổng 80
docker run -d -p 80:80 --name nitro-frontend nitro-hotel-frontend:latest
```

---

## 3. TRIỂN KHAI LÊN NỀN TẢNG CLOUD (VERCEL / NETLIFY)

### 3.1. Triển khai Vercel
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Cấu hình `vercel.json` (SPA Rewrites)**:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### 3.2. Triển khai Netlify
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Tệp `_redirects`**:
  ```text
  /*    /index.html   200
  ```

---

## 4. QUY TRÌNH KIỂM ĐỊNH CHẤT LƯỢNG TRƯỚC KHI GIAO (PRE-FLIGHT CHECKLIST)

Trước khi chuyển giao mã nguồn hoặc gắn nhãn Release Tag, chạy chuỗi kiểm định tự động:

```bash
# 1. Kiểm tra tĩnh kiểu dữ liệu (Strict Type Check)
npm run lint

# 2. Chạy toàn bộ bộ kiểm thử khói và kiểm định Sprint 4
npm run test:smoke
npm run test:task-57
npm run test:task-58
npm run test:task-59
npm run test:task-60
npm run test:task-61
npm run test:task-62
npm run test:task-63
npm run test:task-64
npm run test:task-65

# 3. Đóng gói và chạy máy chủ xem trước kiểm tra tại cổng 4173
npm run build
npm run preview
```
*Tất cả lệnh phải báo màu xanh lá (0 Failure) trước khi đưa lên môi trường sản xuất.*
