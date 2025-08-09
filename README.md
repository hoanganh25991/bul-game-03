# 🗡️ Hành Trình Anh Hùng

Một trò chơi nhập vai (RPG) đơn giản được phát triển bằng HTML5, JavaScript và CSS. Người chơi sẽ điều khiển một anh hùng khám phá thế giới, chiến đấu với quái vật và nâng cấp nhân vật.

## 🎮 Tính năng chính

- **Hệ thống chiến đấu**: Chiến đấu theo lượt với các quái vật khác nhau
- **Hệ thống cấp độ**: Tăng cấp độ thông qua kinh nghiệm (XP)
- **Quản lý tài nguyên**: Theo dõi máu, vàng và các vật phẩm
- **Túi đồ**: Quản lý vũ khí và trang bị
- **Hệ thống wave**: Các đợt quái vật xuất hiện liên tục
- **Nhật ký trò chơi**: Theo dõi các sự kiện trong game

## 🎯 Cách chơi

### Điều khiển
- **WASD** hoặc **Phím mũi tên**: Di chuyển nhân vật
- **SPACE**: Tấn công khi ở gần quái vật

### Mục tiêu
1. Khám phá bản đồ và tìm kiếm quái vật
2. Chiến đấu để kiếm kinh nghiệm và vàng
3. Nâng cấp nhân vật và trang bị
4. Sống sót qua các wave quái vật

### Hệ thống chiến đấu
- **Tấn công**: Gây sát thương cho kẻ thù
- **Phòng thủ**: Giảm sát thương nhận vào
- **Chạy trốn**: Thoát khỏi trận chiến (có thể thất bại)

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- Không cần cài đặt thêm phần mềm

### Chạy trò chơi
1. Clone repository này:
   ```bash
   git clone <repository-url>
   cd bul-hành-trình-anh-hùng
   ```

2. Mở file `index.html` bằng trình duyệt web:
   - Cách 1: Double-click vào file `index.html`
   - Cách 2: Sử dụng Live Server (khuyến nghị cho development)
   - Cách 3: Chạy local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (nếu có http-server)
     npx http-server
     ```

3. Truy cập `http://localhost:8000` (nếu sử dụng local server)

## 📁 Cấu trúc dự án

```
bul-hành-trình-anh-hùng/
├── index.html          # File HTML chính
├── main.js            # Logic game chính
├── style.css          # Stylesheet
└── README.md          # Tài liệu này
```

## 🎨 Tính năng kỹ thuật

### Công nghệ sử dụng
- **HTML5 Canvas**: Render đồ họa game
- **JavaScript ES6+**: Logic game và tương tác
- **CSS3**: Styling và responsive design
- **Module System**: Tổ chức code theo module

### Kiến trúc game
- **Game State Management**: Quản lý trạng thái game tập trung
- **Entity System**: Hệ thống quản lý player và enemies
- **Event-driven**: Xử lý sự kiện người dùng
- **Canvas Rendering**: Vẽ game objects lên canvas

## 🎭 Các loại quái vật

| Quái vật    | HP  | Tấn công | Phòng thủ | XP  | Vàng |
| ----------- | --- | -------- | --------- | --- | ---- |
| 👹 Yêu tinh  | 50  | 15       | 2         | 25  | 10   |
| 🐺 Sói hoang | 40  | 18       | 1         | 20  | 8    |
| 🧟‍♂️ Zombie    | 60  | 12       | 3         | 30  | 12   |
| 🐉 Rồng      | 100 | 25       | 5         | 50  | 25   |

## 🔧 Phát triển

### Thêm tính năng mới
1. **Quái vật mới**: Thêm vào array `enemyTypes` trong `main.js`
2. **Vật phẩm mới**: Mở rộng hệ thống inventory
3. **Kỹ năng**: Thêm hệ thống skill cho player
4. **Bản đồ**: Tạo nhiều khu vực khác nhau

### Code Structure
```javascript
// Game state chính
const gameState = {
    player: { /* thông tin player */ },
    enemies: [ /* danh sách enemies */ ],
    wave: { /* hệ thống wave */ }
};

// Game loop chính
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}
```

## 🐛 Báo lỗi và đóng góp

Nếu bạn tìm thấy lỗi hoặc muốn đóng góp:
1. Tạo issue mô tả chi tiết vấn đề
2. Fork repository và tạo branch mới
3. Commit changes với message rõ ràng
4. Tạo Pull Request

## 📝 Changelog

### Version 1.0.0
- ✅ Hệ thống chiến đấu cơ bản
- ✅ Player movement và controls
- ✅ Enemy spawning system
- ✅ Inventory và stats tracking
- ✅ Battle modal interface
- ✅ Game logging system

## 📄 License

**Proprietary Software** - Copyright © 2025 Monk Journey Team. All Rights Reserved.

This software is proprietary and confidential. Unauthorized reproduction, distribution, modification, or use is strictly prohibited. See the [LICENSE](LICENSE) file for complete terms and conditions.
