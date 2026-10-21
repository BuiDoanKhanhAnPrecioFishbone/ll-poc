# VIQ — tình trạng và những điểm cần chị quyết

Cập nhật 21/10/2026.

## Đã làm trong tháng 10

| | |
|---|---|
| **Standard v1.0** | 22 mục theo đúng chuẩn, không còn khoảng trống nào mình biết. Regional Format (ngày / số / tiền theo thiết lập vùng), Title Case, `Discard Changes`, dấu bắt buộc `*` đỏ, legend xuống chân lưới, Columns trên lưới của wizard, thang kích thước control thống nhất |
| **Review thiết kế 8/10 + họp 13/10** | bỏ mono, trả lại cột con mắt, định dạng đọc/sửa (mọi giá trị trong khung, read-only có khoá) |
| **Activity Log** | dựng lại theo bản mới chị đã làm trên Voyager |
| **Run Quotation** | step 1 dùng hết màn hình; step 2–3 gọn lại; thẻ nhóm cho BoM Quotation; sửa lỗi hàng nút, lỗi cuộn Safari |
| **Quoting BoM (file 16/10)** | 6 trên 8 mục — xem dưới |

## File *Quoting BoM 16 Oct*

**Đã làm:** Quote Setup tách khỏi kết quả (`Get Prices` / `Update Results` / `Refresh Prices` + dialog cảnh báo quota) · AML thành dòng con ở cả step 2 và 3 · Preferred Suppliers theo nhóm ưu tiên + thuật toán chọn nhà cung cấp · chọn MPN chính thức từ danh sách Nexar (file BoM giữ nguyên giá trị) · Consigned trừ trước khi mua · điều hướng wizard trên trái, stepper trên phải.

**Đã làm nốt 21/10:** thẻ *Quote Run · Version N* + *Prices From* ở step 4 · Cost Estimation 2×2 · *Continue from Drafts* ở step 1 · giá trị mang từ RFQ tô xanh kèm tooltip *"RFQ value: 27"*.

**Còn lại một điểm:** bộ chọn phiên bản sau khi Submit. Tab **Result** trên hồ sơ đã liệt kê mỗi phiên bản một dòng (ngày chạy, người chạy, tổng tiền) — mình thấy một bảng đủ phiên bản tốt hơn một bộ chọn chỉ hiện một. Xin chị cho ý kiến.

## Cần chị quyết

**Hai chỉ đạo đang ngược nhau**

| | | Đề xuất của mình |
|---|---|---|
| 1 | Mã hồ sơ / part có dùng mono không? (standard 14/10 ↔ review 8/10 *"do not use monotext"*) | Giữ font body + `tabular-nums`: cột số vẫn thẳng, không mất dễ đọc |
| 2 | Vàng / xanh trong Review BoM (standard: vàng chỉ để cảnh báo ↔ guideline 25/8: vàng = MFG đã có) | Chỉ tô trạng thái **có vấn đề**. Đo trên live: `ROCKET_PN` xanh 13/13 dòng — màu mà dòng nào cũng có thì không nói gì |
| 3 | AML dòng con — mình đã làm theo chị | Xin chị **chốt lần cuối**: màn này đã đổi hình ba lần trong ba ngày |

**Mình xin đề xuất ngược, kèm số đo**

| | | Đề xuất |
|---|---|---|
| 4 | 44px cho form hồ sơ (chỉ còn form RFQ; standard đã miễn trừ màn lưới ở 32px) | 44px là sàn cho **cảm ứng**, 34–36px cho chuột. Form 27 trường cao thêm ~270px. WCAG 2.5.5 nói về vùng chạm, không nói ô nhập phải cao 44 |
| 5 | Label / helper 11px | Sàn 12px |
| 6 | *"Toolbar không bao giờ xuống dòng, hẹp thì cuộn ngang"* | Không wrap tới 1280px, dưới đó cho wrap. Đo: 1 hàng 56px @1400 · wrap 94px @1200 · hai băng cũ 108px |
| 7 | Popup Discard không liệt kê field | Giữ **số đếm** — *"Discard 3 unsaved changes?"* trả lời đúng câu người bấm Discard tự hỏi |
| 8 | Sáu hay bảy nhóm trạng thái | Giữ **bảy**: RFQ mới và bản nháp không phải một thứ. Kèm pill vàng `open` |
| 9 | Filter chip bỏ số đếm — **mình đã làm theo** | Chỉ xin nói lại: panel lọc mặc định đóng, lưới lặng lẽ hiện 1/3 số dòng trông như mất dữ liệu |
| 10 | Màu Priority — standard không nhắc tới, màu High đỏ / Medium hổ phách là **của mình** | Đổi sang thang đậm–nhạt trung tính, trả đỏ–vàng về nghĩa cảnh báo |

**Ba câu từ chính file 16/10**

| | |
|---|---|
| 11 | **Alias MPN lưu lúc nào** — khi chọn hay khi Submit? File chị ghi *"not confirmed yet"* |
| 12 | **"Low" của Excess & MOQ = dư ≤ 25%** — con số 25% cố định hay cấu hình được? |
| 13 | **Công thức attrition**: `Total = Qty × Build Qty + Attrition × Attrition Set`, Attrition = max của mô tả part và các AML, sửa đè được cho riêng quote. Xin chị xác nhận — nó đổi con số trên báo giá |

**Mình xin đóng góp thêm vào standard**

| | |
|---|---|
| 14 | **Dark mode** — standard liệt kê 8 mã màu sáng, không sống qua dark mode. Mình đã có 69 token ngữ nghĩa, xin đóng góp lớp đó |
| 15 | **Accessibility** — standard chưa nói về thứ tự focus và bàn phím. Mình kiểm 1.068 control / 10 route mỗi lần push, xin soạn mục này |
| 16 | **Attachments** — ngoài phạm vi v1.0 nhưng mình đã ship. Giữ hay đóng băng tới v1.1? |
| 17 | **"Status not counted"** — xin danh sách đủ các field audit không được tính |

*Điều hướng wizard (hỏi cũ số 4) đã rút: mockup 16/10 đặt trên trái lần thứ hai, mình theo chị. Riêng "Submit" ở bước cuối mình vẫn đề nghị **Generate Quotation**, theo quy tắc nút gọi tên kết quả của chính standard.*
