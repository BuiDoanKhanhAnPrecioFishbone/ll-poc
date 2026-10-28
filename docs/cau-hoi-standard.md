# VIQ — tình trạng và những điểm cần chị quyết

Cập nhật 25/10/2026. Bản trước (21/10) hỏi 17 câu; mail của chị ngày 22/10 trả
lời 7 câu, nên bảng dưới còn **10**.

## Chị đã chốt 22/10 — đã làm xong

| | Chị trả lời | Đã ship |
|---|---|---|
| Mono cho mã hồ sơ | *"e cứ thử xem ntn sẽ đẹp hơn"* | Bỏ mono, giữ `tabular-nums`. Hai chỗ còn sót (mã trong lưới nhỏ và trong khối dữ liệu) đã dọn |
| Cỡ chữ 11px | helper ≤ label, in nghiêng; label in đậm | Sàn 12px, helper 12px nghiêng, label bold |
| Màu trong Review BoM | vàng = MFG chưa verify · đỏ = không có trong hệ thống · trắng = đã verify | Ba trạng thái đúng như vậy, kèm chữ trong ô để không chỉ dựa vào màu |
| Toolbar wrap | *"show full toolbar cho filter… có thể extend ra"* | Một hàng tới 1280px, dưới đó cho wrap |
| Popup Discard | *"Discard 'unique name của record'"* | *"Discard Assembly 0455-300-0192-01?"* |
| Màu Priority | theo đề xuất của mình | Thang đậm–nhạt trung tính; đỏ–vàng trả về nghĩa cảnh báo |
| Thứ tự focus | BA định nghĩa, hotkey để sau | Nhận — xin xem câu 8 |

Thêm: **Step 2 chị đã OK**; panel step 1 đổi tên **Quote Strategy**, các trường
chỉ sửa được ở step 3; step 1 dựng lại theo mockup của chị, kèm attachment xem
và tải được như prototype chị gửi.

## Đã làm trong tháng 10

| | |
|---|---|
| **Standard v1.0** | 22 mục, không còn khoảng trống nào mình biết: Regional Format, Title Case, `Discard Changes`, dấu `*` đỏ, legend xuống chân lưới, Columns trên lưới của wizard, thang kích thước control thống nhất |
| **Review 8/10 + họp 13/10** | bỏ mono, trả lại cột con mắt, định dạng đọc/sửa |
| **Activity Log** | dựng lại theo bản chị đã làm trên Voyager |
| **Run Quotation** | step 1 dùng hết màn hình · step 2–3 gọn lại · điều hướng wizard trên trái, stepper trên phải · thẻ *Quote Run · Version N* + *Prices From* ở step 4 · Cost Estimation 2×2 · *Continue from Drafts* |
| **Quoting BoM (16/10)** | Quote Setup tách khỏi kết quả · AML thành dòng con ở step 2 và 3 · Preferred Suppliers theo nhóm ưu tiên · chọn MPN chính thức từ Nexar · Consigned trừ trước khi mua · giá trị mang từ RFQ tô xanh kèm tooltip · step 1 dựng lại theo mockup kèm attachment xem/tải. **Còn thiếu — xem mục dưới** |
| **25/10** | nút icon trong hàng về **26px** đúng standard — lấy đúng bậc `xs` của Kendo chứ không tự đặt số, nên 26 nằm cùng một phép tính với 32 và 34 |
| **28/10** | màn xem kết quả theo phiên bản (mục 1) · **Attachment to Process\*** và **Import Completed Quote** (mục 5, 6) · mỗi lựa chọn trong nhóm radio có câu giải thích của riêng nó, như mockup của chị |

### Còn thiếu so với prototype 16/10 — bản trước nói "đủ 8/8", không đúng

Mình mở lại đúng file chị gửi và chạy nó để đối chiếu. Prototype của chị dựng
**step 1, step 2 và một màn xem kết quả riêng** (nút *Quote result (view mode)*);
bấm Next sang step 3 và 4 thì nội dung vẫn là lưới Review BoM.

| | | |
|---|---|---|
| 1 | **Màn xem kết quả theo từng phiên bản** — bấm một dòng trong bảng Result giờ mở ra đúng màn của chị: thiết lập đã dùng, Cost Estimation, và toàn bộ dòng đã định giá (14 cột, kèm **Ext. Price** theo tên của chị) | **xong** |
| 2 | **Export to PDF** — nút đã có trên màn kết quả, bấm vào báo "chưa dựng". Xin chị cho biết bản PDF cần trông ra sao (mẫu có sẵn chưa?) | **cần chị trả lời** |
| 3 | **Import** trên thanh công cụ lưới kết quả — nút đã có, và nó là đầu kia của mục 6. Cả hai cùng chờ một câu trả lời: *một báo giá đã hoàn tất bên Voyager sang đây dưới dạng gì* | **cần chị trả lời** |
| 4 | **Pricing Detail** — nút cạnh *Add Package*. Trong prototype của chị bấm vào **chưa làm gì**, nên mình chưa biết nó mở ra gì — xin chị cho biết | **cần chị trả lời** |
| 5 | **Attachment to Process\*** — trường chọn *file đính kèm nào là BoM*. Mục này **ghi sai ở bản trước**: trường vẫn có, chỉ là nó lấy nguyên câu hướng dẫn làm nhãn, không có dấu `*`, và Next vẫn cho đi tiếp khi chưa chọn file. Giờ đúng nhãn của chị, có dấu `*`, và Next dừng lại | **xong** |
| 6 | **Import Completed Quote** — lựa chọn thứ ba của Select Action. Dựng đúng như prototype của chị: **có mặt nhưng không chọn được**, kèm câu *"Migration only"* ngay dưới | **xong** |

Thêm một câu: mockup của chị có nút **Add Package** ngay cạnh *Pricing Detail*
trên màn xem kết quả. Mình **chưa đặt nó ở đó** — thêm một linh kiện đóng gói
làm đổi giá, mà đây là phiên bản **đã gửi đi rồi**, nên nút đó sẽ là thứ duy
nhất trên một màn chỉ-đọc lại đi sửa lịch sử. Nút Add Package của mình nằm ở
step 4, nơi báo giá còn mở. Nếu ý chị là *"thêm package rồi chạy lại thành
phiên bản mới"* thì đó là một nút khác với một cái tên khác — xin chị xác nhận.

Một câu nữa, thấy được chính nhờ đổi nhãn ở mục 5: ngay dưới *Attachment to
Process* mình còn một ô **File Name** chỉ-đọc, và nó in lại đúng tên file vừa
chọn ở trên — hai ô cạnh nhau, một chuỗi. Ô này là của guideline (r23–r25), còn
prototype của chị **không có nó**. Mình đề nghị **bỏ**, nhưng vì nó nằm trong
guideline nên xin chị quyết.

Một điểm nhỏ: mockup có 6 attachment, bản mình có 3. Cột tiền mình đã đổi theo
chị thành **Ext. Price**.

**Một điểm mình làm khác:** mockup có bộ chọn phiên bản sau khi Submit; mình giữ
**bảng Result** — mỗi phiên bản một dòng, kèm ngày chạy, người chạy, tổng tiền.
Một bảng cho thấy đủ các phiên bản cạnh nhau, so sánh được và xuất Excel được.
Nếu chị vẫn muốn bộ chọn thì mình thêm.

## Cần chị quyết — 10 câu

**Đang ngược nhau trong tài liệu**

| | | Đề xuất của mình |
|---|---|---|
| 1 | AML dòng con — mình đã làm theo chị | Xin chị **chốt lần cuối**: màn này đã đổi hình ba lần trong ba ngày |

**Mình xin đề xuất ngược, kèm số đo**

| | | Đề xuất |
|---|---|---|
| 2 | 44px cho form hồ sơ (chỉ còn form RFQ) | 44px là sàn cho **cảm ứng**, 34–36px cho chuột. Form 27 trường cao thêm ~270px. WCAG 2.5.5 nói về vùng chạm, không nói ô nhập phải cao 44 |
| 3 | Sáu hay bảy nhóm trạng thái | Giữ **bảy**: RFQ mới và bản nháp không phải một thứ. Kèm pill vàng `open` |

**Ba câu từ chính file 16/10**

| | |
|---|---|
| 4 | **Alias MPN lưu lúc nào** — khi chọn hay khi Submit? File chị ghi *"not confirmed yet"* |
| 5 | **"Low" của Excess & MOQ = dư ≤ 25%** — 25% cố định hay cấu hình được? |
| 6 | **Công thức attrition**: `Total = Qty × Build Qty + Attrition × Attrition Set`, Attrition = max của mô tả part và các AML, sửa đè được cho riêng quote. Xin chị xác nhận — nó đổi con số trên báo giá |

**Mình xin đóng góp thêm vào standard**

| | |
|---|---|
| 7 | **Lớp token màu.** Chị giao mình xem phần màu, và muốn cho user tự chỉnh palette theo custom profile. Hai việc đó cùng một điều kiện: màu phải được gọi theo **ý nghĩa** (`warning`, `danger`, `verified`) chứ không theo mã. Standard hiện liệt kê 8 mã màu sáng — không sống qua dark mode và không chỉnh được theo profile. Mình đã có 69 token ngữ nghĩa, xin đóng góp lớp đó làm nền cho cả hai |
| 8 | **Accessibility.** Chị giao BA định nghĩa thứ tự focus — mình xin soạn **bản nháp** để BA review, vì mình đang kiểm 1.068 control / 12 route mỗi lần push và đã có số liệu sẵn |
| 9 | **Attachments** — ngoài phạm vi v1.0 nhưng mình đã ship (xem / tải). Giữ ở v1.0 hay đóng băng tới v1.1? |
| 10 | **"Status not counted"** — xin danh sách đủ các field audit không được tính |

*Nút cuối wizard: mình vẫn đề nghị **Generate Quotation** thay cho "Submit",
theo đúng quy tắc "nút gọi tên kết quả" của chính standard.*
