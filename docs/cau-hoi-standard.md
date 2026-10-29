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
| **28/10** | màn xem kết quả theo phiên bản (mục 1) · **Attachment to Process\*** và **Import Completed Quote** (mục 5, 6) · mỗi lựa chọn trong nhóm radio có câu giải thích của riêng nó, như mockup của chị · bỏ ô **File Name** vì nó in lại đúng tên file vừa chọn ngay trên nó · **Continue from Drafts** luôn hiện, kể cả khi chưa có draft nào, và lấy đúng bảy cột của chị (có **Quote Focus**, bỏ Revision) |

### Còn thiếu so với prototype 16/10 — bản trước nói "đủ 8/8", không đúng

Mình mở lại đúng file chị gửi và chạy nó để đối chiếu. Prototype của chị dựng
**step 1, step 2 và một màn xem kết quả riêng** (nút *Quote result (view mode)*);
bấm Next sang step 3 và 4 thì nội dung vẫn là lưới Review BoM.

| | | |
|---|---|---|
| 1 | **Màn xem kết quả theo từng phiên bản** — bấm một dòng trong bảng Result giờ mở ra đúng màn của chị: thiết lập đã dùng, Cost Estimation, và toàn bộ dòng đã định giá (14 cột, kèm **Ext. Price** theo tên của chị) | **xong** |
| 2 | **Export to PDF** — chị trả lời 29/10: **tạm gác**, khách đang xuất Excel rồi nhập thủ công theo template riêng của từng PM | **gác lại** |
| 3 | **Import Completed Quote** — chị trả lời 29/10: **tạm gác** | **gác lại** |
| 4 | **Pricing Detail** — chị trả lời 29/10: màn **Other Quoted Cost**. Run quote chỉ cho giá vật tư; PM còn cần so với **giá lịch sử** và thêm **chi phí nhân công, tư vấn…** Gồm REFERENCE COST theo đơn vị (standard / target / highest / lowest / last PO), bảng dòng *Sale type · Unit price · Qty · Amount · Amount with markup*, rồi Subtotal · Markup · Total Quoted | **việc lớn nhất còn lại** |
| 5 | **Attachment to Process\*** — trường chọn *file đính kèm nào là BoM*. Mục này **ghi sai ở bản trước**: trường vẫn có, chỉ là nó lấy nguyên câu hướng dẫn làm nhãn, không có dấu `*`, và Next vẫn cho đi tiếp khi chưa chọn file. Giờ đúng nhãn của chị, có dấu `*`, và Next dừng lại | **xong** |
| 6 | **Import Completed Quote** — lựa chọn thứ ba của Select Action. Dựng đúng như prototype của chị: **có mặt nhưng không chọn được**, kèm câu *"Migration only"* ngay dưới | **xong** |

**Add Package — chị đã trả lời 29/10, và em đoán sai.** Em không đặt nút này
trên màn xem kết quả vì nghĩ một phiên bản đã gửi đi là lịch sử, không nên sửa.
Chị trả lời: **nó không phải lịch sử** — package là thứ bên mình bán thêm khi
khách yêu cầu, thêm vào là **tính lại giá ngay cho chính phiếu báo giá đang
xem**. Vậy nút về đúng chỗ chị đặt, và nó ghi vào phiên bản.

**Bảng Result gom nhiều lần chạy vào một dòng.** Ví dụ chị gửi: một part chạy
**6 lần** nhưng bảng chỉ có **một dòng**, cột *Last Run Version* ghi 6. Bản em
đang mỗi lần chạy một dòng — phải sửa, và thêm **dropdown chọn version** ngay
trong màn xem để đổi phiên bản mà không phải đóng màn.

Ô **File Name** dưới *Attachment to Process* đã **bỏ**: nó in lại đúng tên file
vừa chọn ngay phía trên, hai ô cạnh nhau một chuỗi. Ô này là của guideline
(r23–r25), prototype của chị không có nó. Nhánh *Existing Assembly* vẫn giữ ô
File name, vì ở đó file đến từ hộp thoại upload nên ô đó là chỗ duy nhất biết
đã chọn file nào.

**Continue from Drafts giờ luôn hiện.** Trước đây mục này chỉ xuất hiện khi đã
có draft, mà draft chỉ sống trong một phiên trình duyệt — nên mở prototype lên
là không thấy gì, cả một luồng đã dựng xong trông như chưa có. Giờ mục luôn ở
đó; khi chưa có draft nào thì bảng nói rõ draft sinh ra từ đâu. Mình **không**
gieo draft mẫu: một draft là dấu vết công việc ai đó vừa làm, ba dòng giả sẽ mở
ra một BoM chưa từng được cấu hình. Bảng lấy đúng bảy cột của chị — có **Quote
Focus**, bỏ Revision (Revision vẫn nằm trên thanh đầu mỗi bước và trong menu
Resume ở record).

Một điểm nhỏ: mockup có 6 attachment, bản mình có 3. Cột tiền mình đã đổi theo
chị thành **Ext. Price**.

**Một điểm mình làm khác:** mockup có bộ chọn phiên bản sau khi Submit; mình giữ
**bảng Result** — mỗi phiên bản một dòng, kèm ngày chạy, người chạy, tổng tiền.
Một bảng cho thấy đủ các phiên bản cạnh nhau, so sánh được và xuất Excel được.
Nếu chị vẫn muốn bộ chọn thì mình thêm.

## Chị trả lời 29/10 — chín câu của tài liệu so sánh

| | Chị trả lời | Việc sinh ra |
|---|---|---|
| **Template bắt buộc?** | **Có** — không có template thì không load được BoM. Trường có `*` đỏ là bắt buộc | Thêm `*`, chặn Next |
| **Select Column Detection** | **Bỏ** — yêu cầu mới từ khách | Gỡ khỏi step 1 |
| **Build Qty / Attrition Set** | **Bắt buộc**. Revision **số và chữ đều được** | Thêm `*`, chặn Next |
| **Quote Setup ở step 2** | **Chỉ đọc**, chỉ sửa ở step 3 | Không phải làm gì — đang đúng |
| **Bộ chọn phiên bản** | **Có**, và bảng Result **gom nhiều lần chạy vào một dòng** | Hai việc: gom dòng + dropdown trong màn xem |
| **Add Package** | Sửa **trên chính phiên bản đang xem**, tính lại giá ngay | Đưa lên màn kết quả, ghi vào phiên bản |
| **Pricing Detail** | Màn **Other Quoted Cost** — xem mục 4 bảng trên | Một màn mới |
| **Export to PDF** | **Tạm gác** | Giữ nút, vẫn báo chưa dựng |
| **Import Completed Quote** | **Tạm gác** | Giữ như đang có |

Chị bổ sung hai điều, và cả hai **xác nhận bản em đang đúng**: step 3 lúc mới mở
chưa có dữ liệu nhà cung cấp hay order qty, và **phải bấm Get Prices** mới lấy
giá từ sàn về.

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

*Nút cuối wizard: **rút đề nghị này** (29/10). User manual của chị gọi nút cuối
là **Submit** và nút ở step 3 là **Next** — và chị đúng: nút ở step 3 không
sinh ra báo giá nào cả, nó chỉ đánh NO BID rồi sang step 4. Thứ thật sự tạo
bản ghi là Submit. Bản em đã đổi theo.*
