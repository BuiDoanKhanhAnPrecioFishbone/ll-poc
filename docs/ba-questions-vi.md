# Một số câu hỏi về bản UI Principles 16/11

Chị Huyền ơi, em đã áp bản của chị vào hệ thống và trong lúc làm có vài chỗ
em muốn hỏi lại chị. Mỗi mục dưới đây em trích nguyên văn tài liệu của chị,
và chỗ nào quyết định bằng con số thì em để số đo chứ không để ý kiến.

**Trước hết: bản của chị tốt, và chính vì thế danh sách này mới có ý nghĩa.**
Nó đủ cụ thể để kiểm được — 91 giá trị màu, có ghi tỉ lệ tương phản bên cạnh
từng cặp, có kích thước cho từng widget. Em đo lại 8 tỉ lệ chị công bố thì
**cả 8 đều trùng khít tới hai chữ số thập phân**. Những mục dưới đây là
những chỗ không qua được phép kiểm tương tự.

---

## A · Ba chỗ sẽ không qua được kiểm accessibility

### A1. Focus của nút primary chỉ là đổi nền

> *"Focus: lighter fill primary-focus #2754BC · #4A6FCC, one step lighter;
> **no ring, no border**"*

WCAG 2.4.11 yêu cầu chỉ báo focus đạt **3:1 so với trạng thái chưa focus**.
Em đo:

| | Thường → focus | |
|---|---|---|
| Sáng | `#1A419E` → `#2754BC` | **1.34:1** |
| Tối | `#3B63C4` → `#4A6FCC` | **1.18:1** |

Người dùng bàn phím sẽ không thấy mình đang đứng ở đâu. Nút secondary của chị
thì **không bị** — nó có *"border focus #2754BC at 2px"*, là một chỉ báo thật
— nên em nghĩ đây là sót một dòng chứ không phải chủ ý.

**Hỏi chị:** nút primary dùng luôn viền focus 2px giống nút secondary được
không ạ?

### A2. Hai control không có trạng thái focus

> Menu item — Focus: *"**The same as hover**; no outline"*
> Link — Focus: *"Underline, **as on hover**; no outline"*

Nếu focus trông y hệt hover thì khi con chuột đang nằm ở đâu đó trên trang,
màn hình có hai vùng sáng giống hệt nhau và không cách nào biết bàn phím đang
ở cái nào. Đây là WCAG 2.4.7, và ngoài chuyện tiêu chuẩn thì nó cũng gây
nhầm thật.

**Hỏi chị:** hai cái này có thể có cách thể hiện focus khác hover không ạ?

### A3. Ba thứ chỉ hover mới thấy được

Chỗ này em thấy rõ nhất, vì nó chọi với chính phần đầu tài liệu của chị:

> *"program managers, purchasing managers, planners, warehouse and accounting
> staff … **not tech-savvy**. Age: **30 to 60+**"*
> *"VIQ runs on office screens and on **shop-floor terminals**"* — và danh
> sách thiết bị của chị có **iPad 820** và **iPhone 390**.

Trên máy đặt ở xưởng hoặc trên tablet thì **không có hover**. Ba thứ sau đang
phụ thuộc hoàn toàn vào hover:

| Quy tắc của chị | Thứ không với tới được nếu không có chuột |
|---|---|
| *"The reason … shows in a tooltip **on hover** of the box. **Never a lock icon**"* | Vì sao field không sửa được |
| *"Field help … **Hover or keyboard focus** opens a tooltip … No help line under the field"* | Chính phần trợ giúp của field |
| *"Editable and read-only cells **look the same until hover**"* | Ô nào trong grid sửa được |

Dòng về khoá là cái em muốn hỏi trước, vì quy tắc *"never a lock icon"* **gỡ
đúng cái tín hiệu duy nhất không cần con trỏ**. Hệ thống hiện đang vẽ icon
khoá **kèm** lý do bằng chữ, theo chốt ngày 14/10 — *"read only with lock
icon and disable fill bg"* — nên nếu theo bản mới thì mình lùi lại đúng ở
những thiết bị chị nêu.

**Hỏi chị:** trên cảm ứng thì cái gì thay cho hover ở ba chỗ này ạ?

---

### A4. Lưới sửa lớn — chỗ duy nhất trong tài liệu em chưa dựng được

Đây là **mục cuối cùng trong bản của chị em chưa làm**, và nó dừng đúng ở câu
hỏi trên chứ không phải ở việc khó làm.

Mục *Large editable grid* của chị (em diễn đạt lại, không phải trích nguyên
văn): lưới trên khoảng **200 dòng** thì ô sửa được **không vẽ viền gì cả**
cho tới khi hover, chỉ ô đã đổi mới giữ viền xanh cho tới lúc Save; còn lưới
nhỏ nằm trong form thì mọi ô sửa được đều có viền thấy ngay.

Em hiểu vì sao chị chia làm hai, và em đồng ý với lý do: lưới báo giá của hệ
này có **22 cột**, và chỉ **4 ô** trong đó gõ được. Vẽ viền cho cả 22 cột thì
ra một bức tường hộp, mà bốn ô gõ được lại chìm trong đó. Chính vì vậy
`.vy-cell-input` hiện **đã trong suốt lúc nghỉ** và viền chỉ hiện khi hover —
tức là chế độ của chị, hệ này đã chạy sẵn ở lưới nhỏ.

Vấn đề chỉ còn là: **viền hover đang là thứ duy nhất nói rằng ô đó gõ được.**
Không chuột thì không còn gì.

#### Em đề xuất một cách, chị chốt giúp em

Hệ này đã có sẵn một tầng `@media (pointer: coarse)` và nó được dựng đúng cho
loại quyết định này — sàn chạm 44px chỉ áp ở nơi có ngón tay, còn trên chuột
thì giữ nguyên mật độ, vì mật độ mới là thứ khiến người ta làm việc được
trong ERP.

Cùng một cách chia đó, áp cho bốn chỗ hover ở trên:

| Trên chuột | Trên cảm ứng |
|---|---|
| Đúng như chị viết: ô sửa được không viền cho tới khi hover | Vẽ viền sẵn lúc nghỉ, chỉ ở ô sửa được |
| Lý do khoá hiện trong tooltip, không icon khoá | Giữ icon khoá |
| Field help hiện khi hover hoặc focus | Giữ nguyên — focus bàn phím vẫn với tới được, nhưng cần một cách mở bằng chạm |

Giá phải trả của cách này: trên iPad, lưới báo giá sẽ có 4 ô viền giữa 22 cột
— **không** phải bức tường 22 hộp mà chị muốn tránh, và cũng không phải màn
hình trống trơn.

Hai lựa chọn khác, để chị so:

- **Vẽ viền sẵn ở mọi nơi.** Bỏ hẳn hai chế độ. Mất đúng cái chị đang giữ.
- **Để người dùng bật/tắt.** Thêm một thiết lập, và thêm một quyết định cho
  người mà chính tài liệu của chị mô tả là *not tech-savvy*.

**Hỏi chị:** chốt giúp em cách ở bảng trên — chuột giữ nguyên bản của chị,
cảm ứng vẽ viền sẵn — được không ạ? Chị gật là em dựng được mục này ngay.

---

## B · Bốn chỗ tài liệu tự mâu thuẫn

### B1. Icon đang là emoji

Mục Icons của chị viết rất rõ:

> *"One set, drawn the same way: a **20 × 20 box, strokes only, no fill**, one
> stroke width (1.5px), round ends. **Icons take the color of the text around
> them**."*

Nhưng phần ví dụ dùng **11 emoji khác nhau** — 👁 ×13, 🔍 ×5, 📅 ×5, 🗑 ×4,
✏ ×4, ☰ ×3, 🔗 ×2, 📎 ×2, 📄, 🧾, 🔔. Mà emoji thì **được tô, nhiều màu, do
font của hệ điều hành vẽ** chứ không phải mình vẽ, và hiện khác nhau trên
Windows, macOS, Android. Nó ngược lại từng vế trong câu trên.

Em đoán đây là ký hiệu tạm cho 19 icon mà mục *"Open for design"* của chị ghi
là còn phải vẽ. Nhưng **tài liệu không chỗ nào nói vậy**, nên ai làm đúng
theo chữ sẽ ship emoji thật.

**Hỏi chị:** xác nhận giúp em đây là ký hiệu tạm, và danh sách 19 icon kia
mới là bộ thật ạ?

### B2. Chữ 9px, dưới chính sàn chị đặt

> *"Nothing below 12px on desktop"* — mà chip loại file trong file row là
> *"9px 700"*.

Em đã dựng đúng 9px, vì một nhãn ba chữ cái trong khung cố định 30×20 là thứ
người ta **nhận ra** chứ không **đọc**, và em đặt tên nó là `--vy-text-chip`
để ngoại lệ này nhìn thấy được chứ không chôn trong một rule nào đó. Nhưng
dù sao đó vẫn là sàn của chị bị vượt bởi chính spec của chị.

### B3. Hai con số của file row không cùng đúng được

> *"Row **34px** · padding **6px** 10px"* — mà nút tải xuống trong hàng của
> chính chị là **26px**.

26 + 6 + 6 = 38. Em giữ **chiều cao**, bỏ padding dọc, vì một danh sách file
được đọc dọc theo mép trái, mà hàng nào có nút thì cao hơn 4px sẽ làm cả
danh sách trông so le.

### B4. Checkbox bo 3px, mà thang radius của chị không có bậc 3px

> Checkbox (bare): *"radius **3px**"* — trong khi mục Shape and elevation ghi
> bốn bán kính: **4 · 6 · 8 · pill**.

Cùng kiểu với mục 9px ở trên: một giá trị lẻ nằm ngoài chính cái thang chị
đặt. Hệ thống đang vẽ 4px, tức bậc gần nhất trên thang của chị.

### B5. Thang chữ định nghĩa hai bậc rồi cấm dùng

> `2xs` 10px, `xs` 11px — cột Role ghi: *"**Not used on desktop** (below the
> 12px floor)"*

Một cái thang có bậc không được đứng lên thì sớm muộn sẽ có người đứng nhầm.
Hệ thống hiện đặt cả hai thành 12px luôn — kết quả trên màn hình như nhau,
mà phần lý do chị viết thì rõ hơn của mình.

---

## C · Năm chỗ tài liệu chưa nêu

| | |
|---|---|
| **Giá trị dark của chip loại file** | Chị cho sáng cho PDF, XLS, DOC và gọi tên IMG teal, ZIP gray. Dark thì không có. Em đang lấy giá trị dark của họ màu gần nhất mà chị đặt tên |
| **Bề rộng status pill** | Không thấy nêu. Hệ thống đang cố định một ô 104px, vì badge dài ngắn khác nhau trong cột status làm mép phải so le |
| **12 giờ hay 24 giờ** | Ví dụ Datetime của chị là `10:30 AM`; app này đang đọc `10:30` và ghi log `10:56:15`. Danh sách mở của chị vẫn còn để date format là chưa chốt |
| **`control-row` nằm ở bậc Kendo nào** | Chị ghi *"26px (Kendo sm)"*; trang sizing của hệ thống ghi đúng 26px đó là bậc `xs` của Kendo. Giá trị thì khớp, tên bậc thì không, và một trong hai sẽ làm người cấu hình thang Kendo hiểu sai |
| **Tên token icon** | → **C1 ngay dưới đây**: đo ngày 24/11 xong thì mục này không còn là chuyện đặt tên nữa |

### C1. Icon đang dùng 5 cỡ, mà hệ thống chỉ khai 1

Mục này em tách riêng ra, vì sau khi đo thì nó trả lời được chứ không còn
là ghi chú.

Bộ icon vẽ trên khung 20×20 và nhận cỡ bằng một con số. Em đếm trong code
đang chạy:

| Cỡ | Số chỗ dùng |
|---|---|
| 16px | 2 |
| 15px | 4 |
| 14px | 5 |
| 13px | 5 |
| 11px | 1 |

Cộng thêm **4 chỗ không ghi cỡ**, tức ăn mặc định 16. Vậy là **năm cỡ, một
token** — và cái token duy nhất ấy (`--vy-icon-sm`) đang là **16px**.

Bản của chị chốt **hai** bậc, và chốt cả chỗ đứng của từng bậc:

> *icon-md **16px*** — thanh công cụ, banner, menu
> *icon-sm **14px*** — bên trong nút icon và hàng lưới

Em thấy luật của chị đúng và muốn áp nguyên: hai bậc, chia theo **chỗ đứng**
chứ không theo cỡ gần nhất. Vướng đúng một chỗ: `--vy-icon-sm` của hệ thống
đang mang giá trị 16px, nên đổi theo chị là phải đổi tên token, mà tên đó
đang nằm trong chính rule của app shell.

**Hỏi chị:** xác nhận giúp em hai bậc 16 / 14 và chỗ đứng của từng bậc —
em sẽ đưa cả 17 chỗ ghi cỡ về đúng hai bậc đó và đặt lại tên token cho khớp.
Nếu chị thấy cần bậc thứ ba thì cho em số và chỗ dùng của nó.

---

## D · Hai chỗ số của chị đúng, nhưng nền đo thì nên xem lại

Hai mục này em không gọi là lỗi.

### D1. `border-input` chỉ đạt 3:1 trên nền trắng

Chị ghi 3.06:1 cho `#8A94A6` — đúng, nếu nền là trắng. Nhưng chính spec của
chị đặt input lên những nền không trắng:

| Nền | Của chị `#8A94A6` | Của mình `#758096` |
|---|---|---|
| `surface` `#FFFFFF` | 3.06:1 đạt | 3.97:1 đạt |
| `ground` của chị `#F5F7FA` | **2.85:1 không đạt** | 3.70:1 đạt |
| `section-bg` của chị `#F1F4FA` | **2.78:1 không đạt** | 3.61:1 đạt |
| `value-box` của chị `#F1F3F6` | **2.75:1 không đạt** | 3.57:1 đạt |

WCAG 1.4.11 yêu cầu 3:1 cho viền của một control. Em đề nghị giữ giá trị hiện
tại và báo chị biết lý do.

### D2. Dot priority

Của chị là High đỏ `#C62D26`, Medium hổ phách `#C27A12`. Đó đúng là hai màu
mà sản phẩm này đã dành cho *"có chuyện rồi"*. Trên một danh sách hiển thị cả
Priority lẫn Status, một dòng ưu tiên cao và một dòng bị chặn đều đỏ. Hệ
thống hiện vẽ ba bậc của **một** sắc mực, để thứ hạng vẫn còn khi in đen
trắng — cũng chính là quy tắc *"không bao giờ chỉ dùng màu"* của chị, áp cho
một thứ tự.

**Hỏi chị:** trên danh sách hiện cả hai cột, người đọc phân biệt dòng ưu tiên
cao với dòng bị chặn bằng cách nào ạ?

---

## Danh sách này không phải là gì

Không phải bất đồng về hướng đi. Cấu trúc, bảng màu, kích thước và bộ từ vựng
status của chị em đã lấy nguyên: **79 trong 91 giá trị màu** của chị đã vào
hệ thống, **toàn bộ widget trong mục Input widgets** đã dựng xong, và 8 tỉ lệ
tương phản chị công bố em đo lại đều đúng. Đây chỉ là những chỗ mà nếu làm
đúng từng chữ thì ra một kết quả em nghĩ chị cũng không muốn.
