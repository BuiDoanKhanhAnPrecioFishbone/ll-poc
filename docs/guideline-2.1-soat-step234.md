# Soát step 2–4 với guideline 2.1 — 29/10/2026

Nguồn: **`2.1 Quoting Flow for New BoM upload – User Guideline.pdf`** (bản web
cũ, 37 trang, chi tiết từng field) đối chiếu với **`Quoting BoM — User Manual`**
(bản chị nhờ AI viết theo flow mới, 29/10) và với bản em đang dựng.

PDF không mở được bằng công cụ sẵn có nên em viết bộ giải mã ToUnicode theo
từng font để lấy chữ ra — đọc thật, không đoán từ ảnh.

**Quan trọng khi đọc bảng dưới:** 2.1 là **hệ thống cũ**. Chỗ nào 2.1 và manual
mới ngược nhau thì **manual mới thắng** (chị đã chốt nguyên tắc này hôm 20/10
với cặp *Import New BoM* / *Quick Quote from BoM File*).

---

## A · 2.1 xác nhận bản em đang đúng

| | Guideline 2.1 | Bản em |
|---|---|---|
| Quote Focus | Bốn giá trị: *Production-Competitive Cost · Stock-High Cost · Stock-Low Cost · OTHER*, kèm nghĩa từng cái | Đúng bốn, đúng tên |
| OTHER | *"The system does not pick. You choose the supplier yourself."* | Step 3 không auto-pick khi Quote Focus = OTHER, và tooltip nói rõ |
| Không auto-pick khi | OTHER · không nhà cung cấp ưu tiên nào có chào giá · sàn không trả giá | Cả ba |
| MPN không tìm thấy trên Nexar | **tô đỏ** | Đỏ |
| Sàn trả về tên MFG khác | hiện **(\*)** cạnh MPN | Dấu `*`, bấm vào chọn MPN chính thức, BoM giữ giá trị riêng |
| Dòng MAKE / MAKE-PHANT và Qty = 0 | **bỏ tick sẵn** | Đúng, và legend nói ra điều đó |
| Build Qty | *"Must be greater than 0. Default: 1"* | Dưới 1 là tự về 1, sửa lúc rời ô |
| Total Qty | `Qty × Build Qty + Attrition × Attrition Set` | Cùng công thức |
| Material Package Type | *Cut Tape* (số lượng bất kỳ) · *Reels* (nguyên kiện) | Danh sách của hệ thống, giữ nguyên |

## B · Em sửa luôn hôm nay

| | 2.1 nói | Trước | Giờ |
|---|---|---|---|
| **Mở kết quả** | §4: *"Click the **eye icon** on the assembly to open quote result"* — và ảnh chụp 29/10 của chị cũng là nút con mắt ở cột đầu | Bấm vào **mã part** (link) | **Nút con mắt** ở cột riêng, trước Part Number. Mã part trả về chữ thường — cell lấy lại khả năng bôi đen để copy |
| **Thông báo sau Submit** | §3.4: *"The message **'Add Quotation Successfully'** appears"* | *"Add Quotation Result"* | Đúng câu của hệ thống |
| **Export to Excel** | §5: **Sheet 1 Summary** (tổng theo board và toàn bộ, có/không markup; bốn nhóm cần chú ý: **Excess** · **No Stock** *(có tính tiền)* · **No Bid** *(không tính)* · **EOL/NRND/Obsolete** *(không tính)*) · **Sheet 2 Detail** (mọi dòng, dòng No Bid tô đỏ) · **Sheet 3 Supporting** (mọi chào giá sàn trả về — để kiểm vì sao chọn nhà cung cấp đó) | Một sheet, đúng lưới đang xem | **Ba sheet.** Mỗi tiêu đề nhóm tự ghi số dòng và *(có tính tiền)* / *(KHÔNG tính tiền)* — tổng bỏ dòng nào thì phải nói ra dòng nào. Nhóm EOL/NRND **ghi thẳng là chưa mô phỏng** chứ không để bảng rỗng: bảng rỗng đọc thành "không có hàng EOL", mà điều đó chưa ai kiểm. Xuất **toàn bộ** dòng, không theo filter đang xem |

## C · Còn thiếu — xin chị / anh xếp thứ tự

| | 2.1 nói | Bản em | Cỡ |
|---|---|---|---|
| **Load more suppliers** | §3.3.1: danh sách thả xuống chỉ hiện nhà cung cấp **ưu tiên**; nút *"Load more suppliers"* dưới đáy mở thêm nhà cung cấp ngoài danh sách và broker | Danh sách thả xuống không có nút này | Vừa |
| **Bộ chọn phiên bản** | §4.3: *"Select Quotation Version"* — mỗi dòng hiện **Assembly - Rev - Part Rev - BoM Version - Qty - Total amount** | Chưa có (chị đã chốt 29/10 là **có**) | Vừa — và 2.1 cho sẵn nội dung từng dòng |
| **Gộp dòng trùng** | §3.2: cùng *Part Number + Part Rev* ở nhiều sub-assembly thì **cộng số lượng vào một dòng**, báo giá một lần cho tổng | Dữ liệu mẫu không có ca này | Nhỏ (dữ liệu) |
| **Mã part tạm** | §3.2: file không có mã part thì hệ thống tự sinh **tiền tố khách + số** (ví dụ `S_01`, `S_02`) | Chưa mô phỏng | Nhỏ (dữ liệu) |
| **Trạng thái sau Submit** | §4: Project Requirement về chế độ xem với trạng thái **Quoted** | Đóng dialog, không đổi trạng thái bản ghi | Nhỏ |

## D · 2.1 và manual mới ngược nhau — em theo bản mới

| | 2.1 (hệ thống cũ) | Manual 29/10 | Bản em theo |
|---|---|---|---|
| Tên nút step 3 | **Run Quote** / **Apply** | **Get Prices** / **Refresh Prices** / **Update Results** | Manual mới |
| Sửa Build Qty ở step 2 | *"The user can update Build Qty and Attrition Set"* — **sửa được** | Step 2 **chỉ đọc**, chỉ sửa ở step 3 | Manual mới, và chị xác nhận lại 29/10 |
| Nhà cung cấp giá | *"Currently we support **Nexar only**"* | Primary Provider hỏi trước, hết thì hỏi nhà khác | Manual mới (Nexar + Z2data) |
| Select Column Detection | Có, kèm mô tả *Part Number / Description* | Không còn | Chị chốt **bỏ** |

## E · Hai popup — giữ cách của bản em

Cả **2.1** lẫn manual mới đều mô tả hai hộp thoại xác nhận mà bản em không
dựng (*Review Excluded Parts* sau step 2, *Back to Rework / Accept and
Continue* sau step 3). An chốt 29/10: **giữ cách của bản em**. Lý do và điều
kiện để đổi ý đã ghi riêng trong [`precedence.md`](precedence.md).

Một điểm 2.1 nói thẳng và bản em cũng nói, bằng chữ ngay cạnh nút thay vì bằng
một popup:

> *"After you run the quote in Step 3, left-out lines cannot be priced in this
> quote. If you forgot a line, you must run the quote again for the whole BoM."*
