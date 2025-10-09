# Sử dụng image Node.js chính thức
FROM node:20

# Tạo thư mục app
WORKDIR /usr/src/app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt các package Node.js
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Cấu hình cổng health check
EXPOSE 8000

# Lệnh chạy bot
CMD ["node", "index.js"]