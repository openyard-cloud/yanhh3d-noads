# YanHH3D No Ads

Extension Chrome/Edge chặn quảng cáo trên YanHH3D: bấm vào đâu cũng mở tab quảng cáo, tự chuyển trang sang site khác, khung quảng cáo đè lên trang và banner. Trang đổi tên miền thì không cần sửa gì.

## Cài đặt

1. Mở `chrome://extensions` (Edge: `edge://extensions`).
2. Bật **Developer mode** (Chế độ nhà phát triển).
3. Bấm **Load unpacked**, chọn thư mục này.
4. Tải lại trang YanHH3D.

Chrome sẽ báo extension được "đọc và thay đổi dữ liệu trên mọi trang web". Quyền này cần để nó nhận ra YanHH3D trên tên miền mới. Trên các trang khác, extension chỉ đọc thẻ `og:site_name` rồi không làm gì nữa.

## Nhận ra trang ở tên miền mới

- Tên miền có chữ `yanhh3d` (ví dụ `yanhh3d.xyz`): được nhận ra trước khi trang tải, nên được bảo vệ ngay từ lần mở đầu tiên.
- Tên miền không có chữ đó: được nhận ra nếu trang có `og:site_name` bắt đầu bằng "YanHH3D" và `APP_URL` trỏ về chính tên miền đang mở. Mọi trang của YanHH3D hiện đều có hai dấu hiệu này. Lần đầu mở, extension ghi nhớ tên miền rồi tự tải lại trang một lần.

Các tên miền đã ghi nhớ được lưu trong extension và giữ lại khi khởi động lại trình duyệt.

## Cách chặn

- **Quy tắc mạng** (`background.js`): trên các tên miền của YanHH3D, chặn mọi script tải từ site khác, trừ jQuery/Alpine trên cdnjs và jsdelivr. Script quảng cáo đổi tên miền thì vẫn bị chặn. Trình phát phim chạy trong iframe riêng nên không bị ảnh hưởng. `rules.json` chặn thêm các tên miền quảng cáo đã biết ở mọi nơi.
- **Lớp chặn trong trang** (`guard.js`): lớp thứ hai, phòng khi quảng cáo lọt qua. Chặn mở tab mới, tự chuyển trang sang site khác, iframe quảng cáo và link trong suốt đè lên trang. Ẩn các ô quảng cáo của trang. Link bạn tự bấm vẫn hoạt động.

Mỗi lần chặn, extension ghi `[noads] chặn ...` vào Console (F12).
