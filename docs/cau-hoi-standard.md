# VIQ UI Standard v1.0 — những điểm cần chị quyết

Cập nhật 20/10/2026 (bản 2: rút mục 4, thêm mục 22–24 sau khi đọc mockup Quoting BoM 16/10). Prototype đã theo standard **22 mục, không còn khoảng trống
nào mình biết mà chưa làm**. Phần còn lại nằm trong bốn bảng dưới đây: mỗi dòng
chị chỉ cần trả lời đồng ý hoặc không, mình làm theo.

Các mục ở bảng A không phải là mình không đồng ý — đó là **hai chỉ đạo của chính
bên chị đang ngược nhau**, nên chỉ chị chốt được.

---

## A. Hai chỉ đạo đang ngược nhau

| # | Câu hỏi | Mâu thuẫn ở đâu | Đề xuất của mình |
|---|---|---|---|
| 1 | Mã hồ sơ và mã part có dùng mono không? | Standard 14/10: *"JetBrains Mono for record numbers and part numbers"*. Review thiết kế 8/10: *"do not use monotext, hard to read"* — mình đã gỡ mono toàn hệ thống ngày 13/10 | Giữ font body + `tabular-nums`: mọi chữ số cùng bề ngang nên cột số vẫn thẳng hàng — đúng thứ mono được dùng để đạt — mà không mất phần dễ đọc chị đã phản ánh. Đề nghị bỏ dòng mono khỏi standard. Nếu chị vẫn muốn mono ở đâu đó, chỗ đáng nhất là **số hồ sơ trên tiêu đề trang**: một chuỗi, không phải một cột |
| 2 | Vàng và xanh trong Review BoM | Standard: vàng **chỉ** mang nghĩa cảnh báo, xanh *"not used to colour rows or cells in a normal list"*. Guideline 25/8: *"The background color is displayed in yellow because the manufacturer value already exists in Manufacturer Management"* — tức vàng cho một trạng thái hoàn toàn bình thường | Chỉ tô màu **những trạng thái có vấn đề**: part chưa có trong Part Master, manufacturer chưa nhận diện được. Trạng thái bình thường để trắng. Đo trên màn live ngày 15/10: cột `ROCKET_PN` được tô **13/13 dòng** — một màu mà dòng nào cũng mang thì không còn nói lên điều gì. Cách này vừa đúng standard mới, vừa giữ đỏ cho đúng thứ đang chặn Confirm |
| 3 | AML: tách cột hay dòng con? | Standard: *"Child lists as rows: one AML pair per row… never MFG 1 / MFG 2 columns"*. Chỉ đạo 15/10: *"each mfg and mfgpn is in different column now"* — mình đã build lại Review BoM theo đúng chỉ đạo này | Hai màn hai việc khác nhau, nên mình đề xuất hai hình khác nhau:<br>· **Step 2 — Review BoM: giữ cột.** Việc của người dùng ở đây là quét dọc xem dòng nào có nguồn thứ hai; chỉ cột mới cho phép quét như vậy.<br>· **Step 3 — Quoting: dòng con**, standard đúng ở màn này: mỗi AML có supplier, order qty và giá riêng.<br>· **Không gộp cặp trong một ô** (bản mình làm 15/10): SAP Fiori ghi rõ ô nhiều giá trị **xuất ra Excel bị rỗng** — với màn mà đầu ra là file Excel thì điều đó loại luôn phương án.<br>Nếu chị muốn một quy tắc chung cho cả hai màn thì dòng con cho cả hai là phương án an toàn hơn, mình sẽ làm lại Review BoM. Chỉ xin chị chốt lần cuối: màn này đã đổi hình ba lần trong ba ngày |


**Mục 4 (điều hướng wizard) đã rút khỏi bảng, 20/10.** Mockup *Quoting BoM 16 Oct*
đặt `Previous` / `Next` / `Save Draft` ở trên bên trái và stepper bên phải, có bản
chạy được — lần thứ hai chị nói cùng một điều. Mình theo chị, không hỏi lại nữa.
Riêng chữ "Submit" ở bước cuối mình vẫn đề nghị **Generate Quotation**, theo đúng
quy tắc *nút gọi tên kết quả* của chính standard.

---

## B. Những điểm mình xin đề xuất ngược, kèm số đo

| # | Câu hỏi | Số đo | Đề xuất của mình |
|---|---|---|---|
| 5 | Control 44px trên form | Standard đã tự phân biệt: *"Standard forms use 44px controls; screens whose main content is a working grid use compact 32px controls"* và gọi tên Quoting là màn 32px — nên điểm còn lại chỉ là **form hồ sơ**. Form RFQ sâu 27 field: 44px làm nó cao thêm khoảng **270px**. Ngày 15/10 mình mất một ngày để lấy lại 94px trên Run Quotation vì grid chỉ còn 9 dòng trên tổng số 58 dòng BoM | 44px là **sàn cho cảm ứng** — `touch:check` của mình ép điều này mỗi lần push — và 34–36px cho chuột. WCAG 2.5.5 (mức AAA) quy định **vùng chạm** 44×44, không quy định ô nhập trên desktop phải cao 44: một ô 34px nằm trong hàng 44px vẫn đạt. Mức AA là 2.5.8, 24×24 |
| 6 | Label và helper text 11px | Check small-text của mình cảnh báo mọi thứ dưới 12px; người dùng đọc dữ liệu BoM dày đặc cả ngày | Sàn 12px. Phần còn lại của type scale giữ nguyên |
| 7 | *"Toolbar luôn một hàng, không bao giờ xuống dòng — cửa sổ hẹp thì cuộn ngang"* | Đo trên màn Quoting: một hàng = 56px ở 1400px; xuống dòng = 94px ở 1200px; hai băng cũ mà nó thay thế = 108px | Không xuống dòng cho tới 1280px, dưới mức đó cho xuống dòng. Bắt người dùng cuộn ngang để với tới bộ lọc là hỏng nặng hơn một dòng thứ hai |
| 8 | Popup Discard không liệt kê field đã đổi | — | Mình giữ **số đếm**: *"Discard 3 unsaved changes?"*. Số đếm không phải là danh sách — nó trả lời đúng câu hỏi người đang đưa tay bấm Discard tự hỏi: *"tôi có thật sự đổi gì không?"*. Phần nội dung bên dưới mình lấy theo bản của chị |
| 9 | Sáu hay bảy nhóm trạng thái | Mình đang ship **bảy**, tách `New/Open` khỏi `Draft` | Với người lập kế hoạch, một RFQ mới và một bản nháp không phải cùng một thứ. Xin chị hoặc xác nhận bảy, hoặc bảo mình gộp lại sáu. Pill vàng cho `open` đi kèm câu hỏi này |
| 10 | Dấu bắt buộc: `(*)` hay dấu `*` đỏ | Mình đang dùng `(*)` | Chị chọn một, mình sửa đồng loạt |
| 11 | Legend đặt ở đâu | Standard: footer của grid. Mình: phía trên grid, riêng step 3 nằm trong banner giải thích chính nó — nhờ vậy grid được thêm một dòng | Nêu ra để chị biết, chứ mình không tự dời |
| 12 | Filter chip bỏ số đếm | Mình **đã làm theo** standard | Chỉ xin nói lại một lần: panel lọc mặc định đóng, nên một grid lặng lẽ chỉ hiện một phần ba số dòng trông không khác gì mất dữ liệu. Nếu chị vẫn muốn bỏ thì mình giữ nguyên như hiện tại |
| 13 | Màu của Priority | Standard không nhắc tới "Priority" lần nào — màu High đỏ / Medium hổ phách là **của mình**, đang mượn bảng màu ngữ nghĩa (cảnh báo / nguy hiểm) cho một thang phân loại | Đổi sang thang đậm–nhạt trung tính: chấm đặc / nửa / rỗng. Trả đỏ và vàng về đúng nghĩa cảnh báo, đúng tinh thần standard |

---

## C. Mình xin đóng góp thêm vào standard

| # | Câu hỏi | Hiện trạng |
|---|---|---|
| 14 | Dark mode | Standard liệt kê 8 mã hex màu sáng — những giá trị này không sống được qua dark mode. Prototype đã có **69 token ngữ nghĩa**, chạy được cả `prefers-color-scheme` của hệ điều hành lẫn nút gạt thủ công. Mình đóng góp lớp ngữ nghĩa đó vào standard được không? |
| 15 | Accessibility | Standard viết rất kỹ về mù màu, nhưng chưa nói gì về thứ tự focus và điều hướng bàn phím. Mình đang kiểm **1.068 control trên 10 route** mỗi lần push. Mình soạn mục này cho standard nhé? |
| 16 | Attachments | Standard ghi rõ nằm ngoài v1.0, nhưng mình đã ship hành vi attachment ở Run Quotation step 1 và ở record. Giữ nguyên bản hiện tại hay đóng băng chờ v1.1? |
| 17 | *"Status not counted"* trong quy tắc ≤ 3 field | Xin chị liệt kê đủ các field audit không được tính (Created Date, Created By, Updated Date…) |

### Ba câu hỏi mới, từ chính mockup Quoting BoM 16/10

| # | Câu hỏi |
|---|---|
| 22 | **Alias MPN được lưu lúc nào?** Chính file của chị ghi: *"Known limitation: when the alias is saved (on pick or on Submit) is not confirmed yet"*. Lưu ngay khi chọn thì một lần bấm nhầm đã thành alias của khách; lưu khi Submit thì bỏ dở quote là mất lựa chọn |
| 23 | **"Low" của Excess & MOQ = excess ≤ 25% lượng cần mua.** Con số 25% trong `quoteLine()` là cố định hay cấu hình được? Không thấy nó ở tài liệu nào khác |
| 24 | **Công thức attrition.** `Total = Qty × Build Qty + Attrition × Attrition Set`, với Attrition = **max** của mô tả part và mô tả các AML, người dùng sửa đè được cho riêng quote này. Xin chị xác nhận — nó đổi con số thật trên báo giá |

---

## D. Chưa build — cần chị xác nhận phạm vi

| # | Hạng mục | Ghi chú |
|---|---|---|
| 18 | **Setup bị khoá sau khi tính** — *Used for Current Results*, Edit Setup → Update Results (không gọi API ngoài) / Discard Changes; trong lúc sửa thì khoá điều hướng và grid | Đây là mảng hành vi lớn nhất standard yêu cầu ở màn này, hiện chưa làm phần nào |
| 19 | **Dialog quota API** — *"This request uses your marketplace API quota…"* · Cancel / Re-pick Suppliers / Refresh Prices | Khớp với hai chế độ chạy thấy trong bundle live: `Run Quotation (Nexar API)` và `Run Quotation (Get Nexar from DB)` — tức phương án miễn phí là có thật |
| 20 | **Giá trị mang sang từ Project Requirement hiển thị màu xanh khi bị thay đổi** | Phụ thuộc mô hình changed-is-blue, mình làm sau khi mục này được chốt |
| 21 | **Step 4 sau Submit**: kết quả chỉ đọc, Export ở trên trái, chọn phiên bản ở trên phải | — |

---

## Thứ tự mình đề nghị làm, sau khi có câu trả lời cho bảng A

1. Regional Format — chạm vào mọi màn, mọi quy tắc sau đó phụ thuộc vào nó (**đã xong**)
2. Đổi tên `Discard Changes` và rà Title Case — rẻ, thấy ngay, không cần quyết định gì (**đã xong**)
3. Changed-is-blue — một mình nó mang lại nhiều nhất trong cả tài liệu
4. Ngữ nghĩa Delete và inline-vs-form — hành vi mới, nên ước lượng sau khi bảng A có câu trả lời
