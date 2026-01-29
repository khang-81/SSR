# User Roles - Giải Thích Ngắn Gọn

## Tổng Quan

Hệ thống có 2 vai trò chính: **Buyer** (Người mua) và **Seller** (Người bán). Một user có thể chỉ có 1 vai trò tại một thời điểm.

## Buyer (Người Mua)

**Mục đích**: Mua sản phẩm từ các seller

**Quyền hạn**:
- ✅ Xem danh sách tất cả sản phẩm
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Quản lý giỏ hàng (thêm/xóa/cập nhật số lượng)
- ✅ Đặt hàng
- ✅ Xem lịch sử đơn hàng của mình
- ✅ Cập nhật thông tin cá nhân
- ❌ Không thể tạo/chỉnh sửa sản phẩm
- ❌ Không thể xem đơn hàng của người khác

**Use Cases**:
- Mua hàng online
- Quản lý giỏ hàng
- Theo dõi đơn hàng

## Seller (Người Bán)

**Mục đích**: Bán sản phẩm cho buyers

**Quyền hạn**:
- ✅ Xem danh sách tất cả sản phẩm (để tham khảo)
- ✅ Tạo sản phẩm mới
- ✅ Chỉnh sửa sản phẩm của mình
- ✅ Xóa sản phẩm của mình
- ✅ Quản lý tồn kho (stock)
- ✅ Xem đơn hàng liên quan đến sản phẩm của mình
- ✅ Cập nhật trạng thái đơn hàng (đang xử lý, đã giao)
- ✅ Xem thống kê bán hàng
- ❌ Không thể chỉnh sửa sản phẩm của seller khác
- ❌ Không thể xem đơn hàng không liên quan đến mình

**Use Cases**:
- Quản lý cửa hàng online
- Thêm/sửa/xóa sản phẩm
- Xử lý đơn hàng
- Xem doanh thu

## Phân Biệt

| Tính năng | Buyer | Seller |
|-----------|-------|--------|
| Xem sản phẩm | ✅ Tất cả | ✅ Tất cả |
| Tạo sản phẩm | ❌ | ✅ |
| Sửa sản phẩm | ❌ | ✅ (chỉ của mình) |
| Đặt hàng | ✅ | ❌ (hoặc có thể, tùy business logic) |
| Xem đơn hàng | ✅ (chỉ của mình) | ✅ (liên quan đến sản phẩm của mình) |
| Quản lý giỏ hàng | ✅ | ❌ |

## Lưu Ý

- Một user chỉ có **1 role** tại một thời điểm
- Role được set khi **đăng ký** (mặc định: BUYER)
- Có thể mở rộng thêm role **ADMIN** sau này để quản lý toàn bộ hệ thống
