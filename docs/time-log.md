# Time log — Voyager IQ UX revamp

**Kỳ:** 16/10 – 28/10/2026 · **71 commit** trên `main`

## Cách con số này được tính

Lấy từ **dấu thời gian commit**, không phải bấm giờ. Một "phiên" là chuỗi
commit cách nhau dưới 2 tiếng; thời lượng phiên = từ commit **đầu** đến commit
**cuối** của phiên đó.

Nghĩa là con số này **thấp hơn thực tế**, vì phần việc làm ra commit đầu tiên
của mỗi phiên — đọc bundle hệ thống live, đo đạc, chụp màn hình, viết tài liệu
trước khi có thứ gì để commit — không nằm trong khoảng nào cả. Phiên chỉ có
một commit vì thế hiện 0:00. Em để nguyên như vậy thay vì ước lượng thêm.

## Theo phiên

| Ngày | Từ | Đến | Thời lượng | Commit | Việc chính |
|---|---|---|---|---|---|
| 16/10 | 07:20 | 07:20 | — | 1 | CI: Chrome khởi động 60s và báo lý do khi hỏng |
| 16/10 | 20:46 | 23:18 | **2:32** | 12 | Soát **Standard v1.0** với build · 4 luật trái nhau · 9 chỗ lệch · chuyển toàn bộ control sang thang kích thước Kendo |
| 18/10 | 20:18 | 20:18 | — | 1 | Cấu hình thang Kendo thay vì ghi đè |
| 20/10 | 06:52 | 06:52 | — | 1 | **Gửi chị 17 câu hỏi** (bản tiếng Việt) |
| 20/10 | 20:06 | 21:41 | **1:35** | 6 | Mockup Quoting BoM: AML dòng con · chọn supplier · MPN chính thức · consigned trừ trước · Quote Setup phải Apply |
| 21/10 | 06:43 | 07:44 | **1:01** | 5 | Wizard một hàng · bảng Result thay bộ chọn · **một trang cho chị**: đã ship / còn thiếu / cần quyết |
| 22/10 | 21:01 | 21:43 | **0:42** | 4 | **6 câu trả lời của chị**, dựng hết: mono, cỡ chữ, màu Review BoM, popup Discard, Priority, toolbar · step 1 theo mockup · attachment xem/tải |
| 25/10 | 16:45 | 16:56 | **0:11** | 5 | Nút icon về **26px** đúng bậc `xs` Kendo · audit Kendo 33 luật / 0 chỗ chưa ghi chép |
| 25/10 | 20:57 | 21:28 | **0:31** | 5 | Tài liệu **motion & loading** · loader · brief cho người vẽ tên lửa |
| 27/10 | 19:39 | 21:29 | **1:50** | 11 | Rà soát bản tên lửa (đo, không chỉ đọc) · **5 trạm gắn vào 5 mốc boot thật** · busy cho 3 nút tốn tiền · **trạng thái lỗi** · export Excel thật · skeleton hồ sơ (92px → 1px) |
| 28/10 | 06:53 | 07:01 | **0:08** | 2 | Sửa tài liệu: bỏ câu "đủ 8/8" · **màn xem kết quả theo phiên bản** |
| 28/10 | 19:53 | 22:52 | **2:59** | 18 | Xem bên dưới |
| | | | **≈ 11:29** | **71** | |

## Phiên 28/10 tối — chi tiết

| Giờ | Việc |
|---|---|
| 19:53 | **Attachment to Process\*** bắt buộc và chặn Next · **Import Completed Quote** (lựa chọn thứ ba, khoá) |
| 19:57 | Bỏ ô **File Name** in lại tên file ngay trên nó |
| 20:03 | **Continue from Drafts** luôn hiện · bảy cột theo mockup (thêm Quote Focus) |
| 20:23 | **Tài liệu so sánh**: 7 ảnh chụp tự động 1440×900, khung khoanh lấy từ toạ độ thật |
| 20:31 | Tài liệu bản **PDF** — A4 ngang, sửa 3 lỗi bố cục in |
| 20:44 | Quotation Result: nút lên **góc trên trái** · thẻ Cost Estimation sang **bên phải** (lưới 9 → 15 dòng) |
| 20:52 | Thanh thiết lập: **một bề rộng cột** cho mọi ô (trước đó 12 ô có 10 bề rộng) |
| 21:25 | **Tên nhóm + icon** cho mọi group ở step 2, 3, 4 và màn kết quả |
| 21:31 | **BoM Comparison** theo cùng mẫu · một luật header dùng chung cho ba loại thẻ |
| 21:37 | **Quote Strategy ghép cặp hai cột** như panel của chị (đo ra 470px) |
| 21:44 | **Action xếp ngang** ba thẻ · tài liệu đổi xưng hô **em / chị** · nút **Chạy thử** cho tên lửa |
| 21:55 | **Tên lửa biết đáp** · 4 màn chờ (skeleton hồ sơ, skeleton lưới, đang hỏi giá, lỗi) vào tài liệu |
| 22:09 | Đáp = **quay đầu**, tựa đuôi vào hành tinh |
| 22:21 | **Đáp đúng bản gốc**: thu nhỏ 0.3, lửa bùng rồi tắt, hành tinh nảy, **vòng xung**, **mặt cười** · hai hành tinh co/nở theo trạm |
| 22:28 | **Columns** cho step 4 và màn kết quả (hai lưới còn thiếu) |
| 22:40 | **Sọc zebra tô theo record** thay vì theo dòng — ô merge hết bị kẻ ngang |
| 22:46 | **Đính chính** lý do không dùng `rowspan` đã ghi sai trong tài liệu |
| 22:52 | **Bảng so sánh merge thật vs bỏ đường kẻ** trong tài liệu gửi chị |

## Sản phẩm bàn giao trong kỳ

- **Tài liệu so sánh** `so-sanh-prototype-16oct.html` / `.pdf` — 16 trang, một file
  tự chứa, ảnh và tên lửa nằm sẵn bên trong, bấm được nút Chạy thử.
- **Tài liệu câu hỏi** `cau-hoi-standard.md` — còn **9 câu** chờ chị trả lời.
- **Tài liệu motion & loading**, **brief hình tên lửa**, **rà soát bản tên lửa**,
  **audit thang kích thước Kendo**.
- Bộ ảnh chụp tự động trong `docs/shots/compare-16oct/` dựng lại được bằng
  `scripts/capture-compare.mjs`.
