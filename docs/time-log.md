# Time log — Voyager IQ UX revamp

**Kỳ này: 27/09 → 28/10/2026** · 92 commit · **≈ 15 giờ 17 phút đo được**

Nối tiếp đúng chỗ `Voyager-UIUX-Timesheet-Aug2026.xlsx` dừng lại (26/09).

---

## Con số này được tính thế nào

Lấy từ **dấu thời gian commit**, không bấm giờ. Một *phiên* là chuỗi commit cách
nhau dưới 2 tiếng; thời lượng phiên = từ commit **đầu** đến commit **cuối**.

**Nó thấp hơn thực tế, và thấp một cách có hệ thống.** Phần việc sinh ra commit
*đầu tiên* của mỗi phiên không nằm trong khoảng nào: đọc bundle hệ thống live,
đo đạc, chụp màn hình, soạn tài liệu, đọc mockup của chị. Phiên nào chỉ có một
commit thì hiện **—** chứ không phải 0. Em để nguyên như đo được; muốn tính đủ
thì phần cộng thêm phải là con số của anh, không phải ước lượng của em.

Sheet xlsx đang dùng ghi *"Hours are estimated from scope"* — tức là hai cách
tính khác nhau. Bảng dưới là **đo**, không phải **ước**.

---

## Theo ngày

| Ngày | Phiên | Đo được | Việc chính | Thành phẩm |
|---|---|---|---|---|
| **27/09** | 11:45 | — | Chốt time log tới 26/09 · nghiên cứu logo, dựng hướng đầu tiên | `docs/logo-ideas.md` (126 dòng, kèm ngoại lệ D2) · timesheet cập nhật |
| **06/10** | 21:26–21:56 | 0:30 | Run Quotation dùng hết màn hình; step 1 thôi giấu các trường nó bắt buộc · `npm install` tự kích hoạt licence Kendo để bản demo không bị dán badge · badge đếm thôi đè lên góc dialog | Wizard step 1 dựng lại · script `activate-kendo-licence.mjs` |
| **07/10** | 06:25–06:32 | 0:07 | Thêm dòng hiển thị trên màn · **câu hỏi chặn B5** gửi chị: *"Upload Quote from Voyager"* là BoM hay là quote? | Câu hỏi B5 vào `open-questions.md` |
| **13/10** | 21:33 | — | Ghi lại **review 08/10** và **cuộc họp 13/10** | `docs/design-review-08oct.md` |
| **14/10** | 06:30–07:05 | 0:35 | Trả lại **cột con mắt**, mã hồ sơ thôi làm link · **hai nền, không phải ba**: trắng = gõ được | Quy ước đọc/sửa cho toàn bộ form |
| **15/10** | 05:59–06:45 | 0:46 | **Activity Log** dựng lại theo đúng bản chị đã làm trên Voyager · Checklists: nút trong hàng đang nằm ngoài mép lưới · step 2: **AML thành cặp** thay cho 12 cột rỗng | Activity Log · Checklists · bản AML đầu tiên |
| **15/10** | 20:06–21:55 | **1:49** | Mỗi giá trị nằm trong một ô · thu gọn thanh quote · toast step 1 gọi tên **trường**, không gọi tên biến · section thành card ở cả hai luồng BoM · radio chuyển sang của Kendo · **lỗi cuộn trên Safari hoá ra là breakpoint 1180px, không phải trình duyệt** · step 3 gom hai băng control thành một | 8 commit sửa giao diện wizard · chẩn đoán sai lầm về Safari được ghi lại |
| **16/10** | 07:20 | — | CI: Chrome được 60s để khởi động và **nói rõ lý do khi hỏng** | CI ổn định |
| **16/10** | 20:46–23:18 | **2:32** | **Soát Standard v1.0 với build**: 4 luật tự mâu thuẫn, 9 chỗ lệch · Regional Format · một đỏ không thể vừa là nền vừa là chữ · Columns trên lưới wizard, action sang trái · **chuyển toàn bộ control sang thang kích thước của Kendo** thay vì ép chiều cao | `docs/ui-standard-review-16oct.md` · 5 commit về thang kích thước · nút icon vuông |
| **18/10** | 20:18 | — | Cấu hình thang Kendo thay vì ghi đè lên nó | `_kendo-size.scss` |
| **20/10** | 06:52 | — | **Gửi chị 17 câu hỏi**, bản tiếng Việt | `docs/cau-hoi-standard.md` |
| **20/10** | 20:06–21:41 | **1:35** | Dựng 5 điều mockup **Quoting BoM 16/10** chốt: Quote Setup phải Apply mới tính · **một dòng một nhà sản xuất** trên cả hai lưới BoM · chọn supplier chứ không chép · **MPN chính thức** lấy từ Nexar, BoM giữ giá trị riêng · **consigned trừ trước khi mua** | 6 commit · luồng quoting đúng mockup |
| **21/10** | 06:43–07:44 | **1:01** | Điều hướng trái, stepper phải, một hàng · 4 mục cuối của mockup · **bảng Result thay cho bộ chọn phiên bản** | **`docs/cau-hoi-standard.md` — một trang cho chị**: đã ship / còn thiếu / cần quyết |
| **22/10** | 21:01–21:43 | 0:42 | **6 câu trả lời của chị, dựng hết trong ngày**: bỏ mono, sàn chữ 12px, ba màu Review BoM, popup Discard, màu Priority, toolbar wrap · step 1 dựng lại theo mockup · attachment **xem được và tải được** | Step 1 theo mockup · 92px cap trả về đúng chỗ |
| **25/10** | 16:45–16:56 | 0:11 | Nút icon trong hàng về **26px** — lấy đúng bậc `xs` của Kendo chứ không tự đặt số · **audit Kendo: 33 luật, 0 chỗ chưa ghi chép** | `docs/kendo-control-scale-18oct.md` |
| **25/10** | 20:57–21:28 | 0:31 | **Viết tài liệu motion & loading lần đầu** · loader mà sản phẩm vốn đã có, giờ mới render · chỗ nào hình minh hoạ đáng tiền, chỗ nào không | `docs/motion-loading.md` (10 mục) · `docs/plane-illustration-brief.md` — brief cho người vẽ |
| **27/10** | 19:39–21:29 | **1:50** | **Rà soát bản tên lửa bằng cách chạy thật**: đo tương phản 1.52 → 3.81:1, C2PA 12.209 → 4.435 bytes · dựng bản dọc-sáng còn thiếu · **5 trạm gắn vào 5 mốc boot thật** · **busy cho 3 nút bấm hai lần là mất tiền** · **trạng thái lỗi** (trạng thái thứ ba) · export Excel thật · **skeleton màn hồ sơ**, đo tới khi hết nhảy (92px → 1px) | `docs/rocket-journey-review.md` · 4 file SVG + README · BootScreen · ErrorBoundary · RecordSkeleton |
| **28/10** | 06:53–07:01 | 0:08 | Sửa tài liệu: **bỏ câu "đủ 8/8"** vì không đúng · dựng **màn xem kết quả theo từng phiên bản** | Bảng 6 mục còn thiếu · `QuoteResultDialog` |
| **28/10** | 19:53–22:53 | **3:00** | 19 commit — xem bảng dưới | **Tài liệu so sánh HTML + PDF 16 trang** |
| | | **≈ 15:17** | **92 commit** | |

---

## Phiên 28/10 tối — chi tiết

| Giờ | Việc | Thành phẩm |
|---|---|---|
| 19:53 | **Attachment to Process\*** bắt buộc và chặn Next · **Import Completed Quote** — lựa chọn thứ ba, khoá, đúng như prototype | Mục 5 và 6 của bảng thiếu |
| 19:57 | Bỏ ô **File Name** in lại tên file ngay phía trên nó | BoM Options còn 3 quyết định |
| 20:03 | **Continue from Drafts** luôn hiện, kể cả khi trống · bảy cột theo mockup (có Quote Focus) | Luồng draft nhìn thấy được |
| 20:23 | **Tài liệu so sánh**: 7 ảnh chụp tự động 1440×900, khung khoanh lấy từ **toạ độ thật** của phần tử | `scripts/capture-compare.mjs` · `bundle-doc.mjs` · HTML 1 file tự chứa |
| 20:31 | Bản **PDF**: A4 ngang, sửa 3 lỗi bố cục in | `scripts/print-pdf.mjs` |
| 20:44 | Quotation Result: nút lên **góc trên trái** · Cost Estimation sang **phải** → lưới 9 → **15 dòng** | Màn kết quả đúng chuẩn |
| 20:52 | Thanh thiết lập: **một bề rộng cột cho mọi ô** (trước: 12 ô, 10 bề rộng) | Đều và thẳng cột |
| 21:25 | **Tên nhóm + icon** cho mọi group ở step 2, 3, 4 và màn kết quả | Một mẫu group duy nhất |
| 21:31 | **BoM Comparison** theo cùng mẫu · một luật header dùng chung cho ba loại thẻ | Hết trùng lặp CSS |
| 21:37 | **Quote Strategy ghép cặp hai cột** như panel của chị — 470px là **đo ra**, không chọn bừa | Panel hết cuộn |
| 21:44 | **Action xếp ngang** ba thẻ · tài liệu đổi xưng hô **em / chị** · nút **Chạy thử** cho tên lửa | Action cao 230 → 151px |
| 21:55 | **Tên lửa biết đáp** · 4 màn chờ vào tài liệu (skeleton hồ sơ, skeleton lưới, đang hỏi giá, lỗi) | Mục 5 của tài liệu |
| 22:09 | Đáp = **quay đầu**, tựa đuôi vào hành tinh | |
| 22:21 | **Đáp đúng bản gốc**: thu nhỏ 0.3, lửa bùng rồi tắt, hành tinh nảy, **vòng xung**, **mặt cười** · hai hành tinh co/nở theo trạm | Đọc lại engine của bản demo gốc |
| 22:28 | **Columns** cho step 4 và màn kết quả — hai lưới còn thiếu | Đủ cả 4 lưới |
| 22:40 | **Sọc zebra tô theo record** thay vì theo dòng | Ô merge hết bị kẻ ngang |
| 22:46 | **Đính chính** lý do không dùng `rowspan` đã ghi sai trong tài liệu | |
| 22:52 | **Bảng so sánh merge thật vs bỏ đường kẻ**, 6 dòng, chia đôi công bằng | Tài liệu 16 trang |

---

## Thành phẩm còn lại sau kỳ này

| | |
|---|---|
| **Tài liệu so sánh** | `so-sanh-prototype-16oct.html` / `.pdf` — 16 trang, **một file tự chứa**: ảnh và tên lửa nằm sẵn bên trong, bấm được nút Chạy thử, gửi đi đâu cũng mở được |
| **Tài liệu câu hỏi** | `cau-hoi-standard.md` — còn **9 câu** chờ chị trả lời |
| **Tài liệu kỹ thuật** | motion & loading · brief hình tên lửa · rà soát bản tên lửa · audit thang kích thước Kendo · modal patterns |
| **Công cụ dựng lại được** | `capture-compare.mjs` (chụp cả hai bên, khoanh theo toạ độ thật) · `bundle-doc.mjs` · `print-pdf.mjs` — tài liệu dựng lại bằng 3 lệnh |
| **Trong sản phẩm** | Run Quotation 4 bước đúng mockup · màn xem kết quả theo phiên bản · BootScreen + tên lửa 5 trạm · skeleton lưới và hồ sơ · trạng thái lỗi · BoM Comparison |

## Còn chờ chị

Ba mục trong bảng thiếu vẫn **chờ chị trả lời chứ không chờ việc**: Export to PDF
(cần mẫu), Pricing Detail (trong prototype của chị bấm vào cũng chưa làm gì), và
Import Completed Quote (một báo giá hoàn tất bên Voyager sang đây dưới dạng gì).
