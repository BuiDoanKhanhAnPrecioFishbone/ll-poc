# Chấm 43 mục của Decision Board — trạng thái ngày 8/11

**Board chưa được tổng hợp**, nên đây là bản tự chấm: lấy đúng 43 mục của
`VIQ UI Decision Board Nov-05-26` làm checklist, đối chiếu với hệ thống sau
tuần này, và nói rõ mục nào **đã xong bằng bằng chứng**, mục nào **vẫn cần
người quyết**, mục nào **board nói đúng và mình đã sửa**.

Nguyên tắc chấm: chỉ ghi "xong" khi có **số đo hoặc code** chứng minh, không
ghi "xong" vì mình thấy hợp lý.

---

## Tóm tắt

| | Số mục |
|---|---|
| ✅ **Đã khép bằng bằng chứng** — không còn gì để tranh luận | **14** |
| 🔧 **Board nói đúng, đã sửa tuần này** | **5** |
| 🟡 **Vẫn cần người quyết** — hai bên đều hợp lý | **13** |
| 📄 **Đã có trong hệ thống, chỉ cần board ghi nhận** | **11** |

Bốn mục trong nhóm "Confirmed" của board (L8, L10, H5, Zebra) tính riêng ở
cuối.

---

## 1 · Đã khép bằng bằng chứng (14)

Những mục này không còn là lựa chọn. Có số đo, có ngày, có dòng code.

| Mục | Kết luận | Bằng chứng |
|---|---|---|
| **O6** Cỡ chữ nhỏ nhất | **12px**, không phải 11px | Khách chốt 22/10; `tokens.css` ghi sàn; small-text check 0 vi phạm |
| **C1** Mono cho mã | **Một bộ chữ.** Mono đã gỡ | Gỡ 13/10 theo chỉ đạo 8/10, xong 22/10, token gỡ 7/11; `monoAnywhere: 0` trên trang chạy thật |
| **O9** Bộ chữ | Inter Variable, một bộ | Như trên; webfont mono không còn trong bundle |
| **C2** Viền input | **`#758096`**, không phải `#8a94a6` *hay* `#626d7e` | Đo trên 7 nền: giá trị cũ đạt 1/7. Mới: chặt nhất 3.05 |
| **O11** Hover & focus | Ring 2px offset 2px, `:focus-visible` | `focus:check` 1305 control, 0 thiếu chỉ báo |
| **H2** Xanh brand trong dark | Fill và text **tách vai** | Board đúng; B1.5 của mình tự mâu thuẫn, đã sửa |
| **H1** Nền trang | `#F5F7FA` | Khớp code, giữ nguyên |
| **H3** Sắc đỏ | `#9E231D` trên `#FDECEB` | Khớp code, giữ nguyên |
| **O1** Chiều cao control | 34px (Kendo md) | Thang 5 bậc có chủ đích: 26/28/32/34/44 |
| **O5** Kiểu tiêu đề nhóm | UPPERCASE, gạch bên | Khớp B2 |
| **O8** Ô giá trị view mode | Nền xám + gạch chân | `--vy-vbsL` trong code |
| **O10** Ô read-only trong dark | `#2E3746` | Trong code |
| **C3** Read-only khi edit | Khoá **chỉ ở edit mode** | D2 đã viết sẵn lập luận "27 padlock thì không đánh dấu được gì" |
| **AD1–AD18** | 17 mục, Toàn duyệt Add 15 | Đã nằm trong B1–B7, E1, F1 |

---

## 2 · Board nói đúng, đã sửa tuần này (5)

Năm chỗ board chạm đúng vấn đề — dù đôi khi vì lý do khác với lý do board nêu.

| Mục | Board nói | Thực tế đo được | Đã làm |
|---|---|---|---|
| **H2** | Dark nên tách fill/text | B1.5 **tự mâu thuẫn**: viết "hai vai tách biệt" rồi cho cả hai cùng `#7f9ce1` | Sửa, và `progress` được cặp dark luôn |
| **C10** | "Hai sắc cam cạnh nhau" | ΔE 17.9 — **phân biệt được**, board hơi quá lời. Nhưng `caution` chỉ có **1** chỗ dùng và hệ thống **không có luật chọn** | Viết luật vào B1.7 |
| **C11** | "650 và 700 gần 600" | Đo: bước 600→650 là **+5.6%**, 650→700 **+5.5%** — bằng ~⅓ các bước dưới. Khác nhau thật, nhưng sát | Viết thang đo + luật chọn vào B2 |
| **O2** | "Hổ phách đọc ra cảnh báo" | Hổ phách làm **ba** việc. Nhưng chúng **không bao giờ gặp nhau** (0 cột status trên lưới hổ phách) và mỗi lưới có chú giải riêng | Viết cả hai luật vào B1.7 |
| **C5** | "Chỉ tô ô có vấn đề" | Vốn là **đề xuất của mình** 16/10, kèm số đo 13/13 dòng | Giữ hướng đó |

---

## 3 · Vẫn cần người quyết (13)

Không bên nào sai. Đây là chỗ cần một buổi 30 phút, không phải thêm một phép đo.

| Mục | Hai phương án | Ghi chú của mình |
|---|---|---|
| **O3** App shell | Window form ↔ breadcrumb trong shell | Toàn chọn C. Ảnh hưởng lớn nhất trong cả board |
| **O7** Vị trí báo lỗi | Sau nhãn ↔ dưới trường | Dù chọn gì cũng **phải giữ** luật D2: báo lỗi **on blur** |
| **C4** Trợ giúp trường | In nghiêng dưới ↔ `?` sau nhãn | Phương án `?` dựa trên lời hứa "sau này hover hiện mô tả" — chưa có trong scope |
| **C6** Mật độ dòng | 28/40/48 ↔ 34/40 | 28px là **tuỳ chọn**, mặc định vẫn 40 |
| **C7** Tổng | Dòng total trong lưới ↔ field dưới lưới | Luật D3 là **có điều kiện** ("lưới nào người dùng cộng bằng mắt") |
| **C9** Loại nút | 5 loại ↔ 4 loại | `tonal` đã có lập luận đầy đủ trong `components/button.md` |
| **C8** Màn chờ/rỗng/lỗi | Rocket ↔ text + skeleton | Là **một hình ba trạng thái**, không phải 4 hình; skeleton đã có sẵn |
| **L4** Chữ nút trong popup | Cancel ↔ nêu tên hành động | Vốn đã là cách viết trong discard dialog của mình |
| **H4** Cỡ popup | md/lg/xl ↔ có thêm cỡ nhỏ | Phương án C hợp lý; nhớ giữ "lg và xl mở maximised" |
| **O2** Màu status pill | 5 màu ↔ stage families ↔ 8 status | Mình có 7 token + 1 không render được (`review`) |
| **AD4** Sáu bậc màu chữ | Add ↔ Discuss | Toàn để Discuss. Cảnh báo 2.58:1 là của chính mình |
| **AD7** Vai trò cột | Add ↔ Discuss | Toàn để Discuss. Board thiếu mất role `datetime` 190px |
| **Tab đặt ở đâu** | — | **Board không có mục nào cho việc này**, dù ảnh annotate hỏi thẳng |

---

## 4 · Đã có, chỉ cần board ghi nhận (11)

Board liệt kê là "cần thêm" hoặc "cần bàn", nhưng hệ thống đã có và chạy được:
AD2 (5 rule), AD3 (surface roles), AD5 (spacing), AD6 (radius/shadow/z-index),
AD8 (motion), AD9 (breakpoints), AD10 (icon set), AD12 (busy button),
AD13 (Esc lớp trong cùng), AD14 (skeleton), AD16–AD17 (honest writing, a11y).

> Lưu ý khi đưa vào: bản trong board **bị rút gọn**. AD5 còn 8/13 bậc spacing,
> AD3 còn 6/10 surface, AD7 thiếu `datetime`, AD9 thiếu `pointer: coarse`, và
> AD8 ghi "tắt motion thì không có animation nào" — **ngược** với B6, nơi
> reduced motion là một *trạng thái* chứ không phải công tắc.

---

## 5 · Nhóm "Confirmed" của board

| | Board chốt | Của mình |
|---|---|---|
| L8 Amount / With Markup | mọi dòng, ẩn được qua Columns ▾ | khớp |
| L10 👁 trên mọi dòng | khớp | khớp |
| H5 | bỏ | khớp |
| **Zebra** | **bỏ hẳn** | ⚠️ Của mình là zebra **theo record**, để một part trải nhiều dòng AML đọc thành một khối — `MiniTable.tsx` có lập luận. Bỏ hẳn là mất chức năng đó, và nó đang nằm trong nhóm "đã chốt" nên sẽ không ai bàn lại |

---

## 6 · Chỗ board không phủ, mà mình thấy nặng hơn vài mục trong board

| | |
|---|---|
| **`mobile:check` đang đỏ** | 198 lỗi cuộn trang ở tablet 768 và breakpoint 820. Có từ trước tuần này (đã kiểm bằng cách chạy lại trên commit gốc) |
| **Trang component 3/29** | Board bàn màu và khoảng cách; thứ thiếu nhất lại là "component này dùng khi nào, không dùng khi nào" |
| **Pattern: 1** | Form record, filter, hành động phá huỷ, thông báo — chưa có |
| **`review`** | Có màu trong token, không có đường nào render ra |
| **Vị trí tab** | Ảnh annotate hỏi thẳng, board không có mục |
