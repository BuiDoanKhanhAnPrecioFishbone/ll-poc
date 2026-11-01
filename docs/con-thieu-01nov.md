# Còn thiếu gì — soát lại toàn bộ nguồn của chị, 01/11/2026

Em mở lại **tất cả** những gì chị gửi và đối chiếu từng cái với bản đang chạy:
prototype 16/10 và 27/10 · UI Standard 14/10 · guideline 2.1 · user manual
29/10 · file launch redesign 29/10 · và **năm ảnh chụp hệ thống live** chị gửi
ngày 29/10 lúc 20:26–20:32.

**Năm ảnh đó là phần em soát chưa kỹ.** Trước nay em mới dùng một ảnh (nút con
mắt ở cột đầu). Mở hết ra thì chúng là **ảnh hệ thống thật**, không phải
mockup — và hai trong số đó chở thông tin mà không tài liệu nào có.

---

## A · Màn **Other Quoted Cost** — em dựng theo mô tả, giờ có ảnh thật

`image (1).png` là chính màn đó trên hệ thống live. Bản em dựng 29/10 theo lời
chị kể, nên khác khá nhiều. Tám điểm:

| | Ảnh của chị | Bản em |
|---|---|---|
| 1 | Nút **Edit** ở góc trên trái — màn **chỉ đọc** cho tới khi bấm Edit | Sửa được ngay |
| 2 | Khối đầu màn có **4 trường + Notes**: *Part Number - Part Rev · Description · **Markup (%)** · **Quantity*** và ô **Notes** | Chỉ có tên assembly ở subtitle, không có Markup, Quantity, Notes |
| 3 | **REFERENCE COST nằm bên PHẢI**, trong khung riêng | Nằm trên, chiếm hết bề ngang |
| 4 | Cột so sánh là **phần trăm kèm mũi tên**: `↓ 100.00%` | Em bịa ra số tuyệt đối `−$1.691` |
| 5 | Tên dòng: **Standard price · Target price** · Highest cost · Lowest cost · **Last PO cost** | Em viết *Standard cost · Target cost · … · Last PO price* — sai 3 chữ |
| 6 | Nút **`Add a line`** nằm **trên** bảng | *Add cost line*, nằm dưới |
| 7 | Bảng có cột **NO** (số thứ tự), sale type đầu là **"Materials"** | Không có cột NO |
| 8 | **SUBTOTAL · MARKUP (18%) · TOTAL QUOTED** xếp **ngang** dưới phải, markup hiện `+$1,231.070000` màu xanh | Ba dòng trong tfoot |

Và tiền hiện **6 chữ số thập phân** (`$6,839.290000`) — khớp định dạng trong
guideline 2.1, bản em đang để 2.

**→ Đã dựng lại xong 01/11**, theo ảnh chứ không theo mô tả. Cả tám điểm.
Thêm hai điều ảnh không nói mà màn cần: nút **Edit** đổi thành **Discard
Changes** khi đang sửa (chữ của chính standard chị: *"Discard Changes, not
Cancel, in edit mode"*), và **Quantity ở đầu màn điều khiển dòng Materials** —
một số lượng cho cả báo giá, không phải mỗi dòng một số tình cờ bằng nhau.

## B · Bảng **Quotation Result** — thiếu một cột

`image.png` là tab Quotation Result trên live. Cột của nó:

> (mắt) · PART NUMBER · PART REV · **BOM VERSION** · DESCRIPTION · BUILD QTY ·
> COST/BOARD · TOTAL AMT · TOTAL W-MARKUP · LAST RUN BY · LAST RUN DATE ·
> LAST RUN VERSION

- **BOM VERSION là một cột** (giá trị `0.1`). Bản em **không có cột này** —
  em có hàm `bomVersionOf()` nhưng chỉ dùng trong dropdown chọn version.
- **LAST RUN VERSION ghi `6`** — số trần, không có chữ `v`. Bản em ghi `v3`
  kèm thẻ *3 runs*. Đúng như chị nói hôm 29/10 ("cột Last Run Version ghi 6").

**→ Việc: thêm cột BOM VERSION, bỏ tiền tố `v`.** Nhỏ.

## C · Bản 27/10, bước 3 — đã khớp, em đối chiếu lại cho chắc

`image (2).png` và `image (3).png` là bước 3 trước và sau khi lấy giá. Em soát
từng thứ: **ba bộ lọc** (*Unselected Supplier · Not Enough Qty · Missing
Attrition*) ✓ · **dropdown nhà cung cấp ghi `G1 Digi-Key · 2,650.00 in stock ·
$…`** ✓ · **Order Qty gõ được** ✓ · *Not selected* ở dòng AML phụ ✓ · nút
**Get Prices / Refresh Prices / Update Results / More** ✓ · legend 4 mục ✓.

Một điểm còn khác: **bản của chị gộp ô** (Part · Rev · Description · Qty ·
Attrition · Total Qty trải qua 2 dòng AML). Bản em dùng **sọc màu theo
record** thay vì gộp ô — đã giải thích đủ lợi hại trong tài liệu gửi chị hôm
28/10, và **chờ chị chốt**, không phải việc đang treo.

## D · Bản 27/10, bước 1 — ba khác biệt nhỏ

| | Của chị | Của em |
|---|---|---|
| Thứ tự **Select Action** | *Existing Assembly* → *Quick Quote from BoM File* → *Import Completed Quote* | *Quick Quote* đứng trước — và đây là **thứ tự của UI Standard 14/10**, không phải em tự đặt |
| Tiêu đề panel trái | **RFQ & Quote Strategy** kèm số `RFQ0000000329` | *Quote Strategy*, không có số RFQ |
| Link dưới Template | **Create Custom Template** | *Create a new template* |

Cả ba đều nhỏ. Mục đầu là **hai nguồn của chị chọi nhau** (prototype vs
standard) nên em không tự đổi.

## E · Vẫn đang chờ chị — không phải chờ việc

1. **Danh sách Sale type** — chị mới nói *nhân công* và *tư vấn*; ảnh live cho
   thêm **"Materials"**. Em đang đoán tám giá trị.
2. **Helpdesk nào nhận ticket** — nút Send đang giả.
3. **Gộp ô ở bước 3** — gộp như Excel hay giữ sọc theo record.
4. **Export to PDF** và **Import Completed Quote** — chị chốt tạm gác.
5. **Nửa sau của B5**: đổi *chữ* nhãn sang Title Case. Chọi với chính prototype
   của chị (*"Reload this screen"*, *"Accept & continue"* là sentence case).
6. **`Customer Special Need` hay `Customer specific needs`** — panel của chị
   một đằng, hệ thống live một nẻo. Một trường, hai tên.

## F · Còn nợ từ guideline 2.1

*Load more suppliers* dưới dropdown · gộp số lượng một part dùng ở nhiều
sub-assembly · mã part tạm (`S_01`) · trạng thái **Quoted** sau Submit.
