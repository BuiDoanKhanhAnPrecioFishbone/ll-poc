# Viền ở các trạng thái — hover và focus, 9/11/2026

Bản quét 8/11 ([`vien-control-08nov.md`](vien-control-08nov.md)) đo **trạng
thái nghỉ**. Cả hai phép kiểm đều vậy: `contrast:check` đọc bảng màu,
`border:check` quét một trang không ai trỏ chuột vào. Nhưng WCAG 1.4.11 nói về
biên của control **và các trạng thái của nó** — nên một nửa yêu cầu chưa từng
được đo.

Nửa đó có lỗi, và lỗi nằm ngay trên ô input chính của sản phẩm.

## 1. Hover làm viền **mờ đi** trong dark

`.vy-input:hover` và `.vy-sup-btn:hover` vẽ viền bằng `--vy-border-heavy`.
Chú thích cạnh rule tự giải thích, và nó chỉ đúng ở light:

> *grey-500, chứ không phải grey-400. Viền lúc nghỉ giờ đậm hơn grey-400, nên
> hover cũ lại nhạt hơn chính cái trạng thái nó muốn nhấn.*

Đúng trên nền trắng. Trong dark, viền lúc nghỉ là `#707c8d` và grey-500
**đậm hơn** nó — tức là cùng một dòng khai báo vừa làm hover mờ hơn lúc nghỉ,
vừa tụt dưới ngưỡng:

| Nền (dark) | surface | app | raised | subtle | sunken | **strong** | hover | selected |
|---|---|---|---|---|---|---|---|---|
| `border-heavy` | 2.68 | 2.91 | 2.41 | 2.76 | 3.03 | **2.02** | 2.41 | 2.23 |

Cùng đúng một lỗi "đo trên nền trắng" đã làm `--vy-border-control` sai hồi
tháng 9, chỉ dịch sang một trạng thái.

**Một giá trị không làm được cả hai việc** — y như lý lẽ B1.5 đã ghi về fill
và text: *dễ thấy hơn* nghĩa là đậm hơn trên trắng và nhạt hơn trên gần đen.
Nên hover là một role riêng:

| | Giá trị | Trên panel | Nền xấu nhất |
|---|---|---|---|
| `--vy-border-control-hover` light | `var(--vy-grey-500)` → `#626d7e` | 5.24 (nghỉ 3.97) | 4.02 |
| `--vy-border-control-hover` dark | `#858f9e` | 5.23 (nghỉ 4.04) | 3.95 |

**Light không đổi gì** — grey-500 đúng là giá trị rule cũ vẫn đang vẽ ra ở
light, nên lý lẽ trong chú thích cũ còn nguyên giá trị.

Dark thì bậc ramp không có cái nào dùng được: grey-500 và `border-mid` đậm hơn
viền lúc nghỉ, còn bậc trên nó — grey-400 `#97a2b2` — lại **nhạt hơn**
`on-surface-subtle`, nghĩa là viền hover sẽ sáng hơn chữ mờ nhất trên trang.
`#858f9e` nằm trên đúng đường hue/saturation của `border-control`, lên một
nốt (H 215.2, S 11.5%, L 49.6% → 56.7%). Cách chọn giống hệt cách
`--vy-border-control` được chọn.

Kết quả: hai theme cùng cho biên hover **khoảng 4:1 trên nền xấu nhất của
mình** — lệch nhau 0.07.

## 2. Viền focus trong dark — token bị bỏ sót từ hôm trước

Đây là cái khó chịu: **phép đo chứng minh nó đã có sẵn trong file từ 8/11.**

Chú thích cạnh `--vy-brand-boundary` ghi rõ blue-400 chỉ được 2.88 trên
`surface-strong` trong dark, nên vòng focus chuyển sang blue-300. Nhưng
`--vy-brand-boundary-strong` — **viền** focus, chứ không phải vòng focus — vẫn
để blue-400, đúng con số 2.88 đó. Hai token được đo trong cùng một lượt và chỉ
một cái được sửa.

Nó là viền focus của `.vy-input`, `.vy-cell-input`, `.vy-richtext:focus-within`
và 10 rule khác — tức là mọi ô gõ chữ trong sản phẩm.

Thêm một chuyện nữa: *"strong"* nghĩa là **nhấn hơn** `boundary` một bậc — ở
light là đậm hơn (blue-400 → blue-500), ở dark phải là nhạt hơn. Giữ blue-400
làm cặp này bị **lộn ngược**: trong dark, "strong" đậm hơn `boundary` thường,
nên yếu hơn nó. blue-200 trả lại quan hệ đúng.

| | Trước | Sau | Nền xấu nhất |
|---|---|---|---|
| `--vy-brand-boundary-strong` dark | `var(--vy-blue-400)` | **`var(--vy-blue-200)`** | 2.88 → **7.22** |

## 3. Năm rule nữa, cùng họ

| Rule | Trước | Sau | Vì sao sót |
|---|---|---|---|
| `.vy-input:hover` | 2.68 / **2.02** dark | `border-control-hover` | Quét chỉ đo lúc nghỉ |
| `.vy-sup-btn:hover` | 2.68 / **2.02** dark | `border-control-hover` | Nằm trên dòng tiêu đề Run Quotation |
| `.vy-audit-chip:hover` | `on-surface-subtle` (5.89 / 6.01) | `border-control-hover` | **Không phải lỗi** — một token *chữ* đang vẽ viền control. Đổi lần tới bậc chữ `subtle` là viền chip đi theo |
| `.vy-density-choice[aria-checked]` | **1.37** light / **1.89** dark | `brand-boundary` (3.44 / 4.76) | Trong suốt lúc nghỉ, nên viền lúc chọn **là toàn bộ** biên. Fill không gánh nổi: `brand-subtle` trên panel chỉ 1.14 ở dark |
| `.vy-vs-dir` lúc nghỉ | **1.30** (`--vy-border`) | `border-control` | Nằm trong dialog View Setting — `border:check` không mở dialog |
| `.vy-vs-dir[aria-pressed]` | **2.08** light | `brand-boundary` | Bấm vào làm viền mờ hơn chính cái viền nó vừa thay |

Hai ca cuối là cùng một hình với `.vy-people-add` hôm 8/11: **một trạng thái
thay biên của control bằng một biên mờ hơn.**

## Phần đáng giữ: dạy phép kiểm nhìn thấy trạng thái

Sửa sáu rule là việc một buổi. Việc để lần sau không phải tìm bằng tay:

**`contrast:check`** — 142 → **174 cặp token**, thêm `border-control-hover` và
`brand-boundary-strong` trên cả tám nền, hai theme. Chặt nhất vẫn 3.05:1.

> *Cùng ngày, muộn hơn:* viết trang [`patterns/dashboard.md`](patterns/dashboard.md)
> tìm ra một loại pixel nữa chưa ai đo — **mảng màu không mang chữ**. Năm
> series của biểu đồ Home vào tiếp, **174 → 184**, và chặt nhất tụt xuống
> 3.03:1. Con số trong bảng cuối trang này là trạng thái lúc kết thúc lượt
> viền; bản mới nhất là 184.

**`border:check`** — ba lượt thay vì một. Cách đo trạng thái mà không có chuột:
không dùng `CSS.forcePseudoState` của CDP (nó theo từng node — 340 control × 12
route × 2 theme = 8160 lượt gọi), mà **đưa trạng thái về lúc nghỉ**. Mọi rule
trong mọi stylesheet có pseudo-class đó được phát lại với pseudo-class thay
bằng một cái **đang đúng**, chỉ mang theo khai báo viền, nối vào cuối:

```
.vy-input:hover       ->  .vy-input:not(:focus)      { border-color: ... }
.vy-cell-input:focus  ->  .vy-cell-input:not(:hover) { border-color: ... }
```

`:not()` có specificity bằng chính đối số, nên một pseudo-class đổi thành một
pseudo-class và thứ tự cascade không đổi.

> **Hai lỗi trong chính bộ đo này, và self-test là thứ duy nhất lộ ra chúng.**
>
> *Một.* Kể từ khi CSS nesting có mặt, một `CSSStyleRule` thường **cũng** có
> `cssRules` — danh sách rỗng, nhưng truthy. Phép kiểm nhóm viết trước phép
> kiểm selector nên nó **nuốt sạch** mọi style rule trong tài liệu và không
> phát ra rule nào.
>
> *Hai.* Chrome tách `border-color` thành bốn longhand, và khi giá trị là
> `var()` thì nó giữ một placeholder mà `getPropertyValue('border-top-color')`
> trả về **chuỗi rỗng**. Bản đầu đọc theo cách đó, phát ra 51 rule
> `border-top-color: !important` — cú pháp đúng, không tác dụng gì, và báo
> cáo ba trạng thái sạch bong. Nó qua được self-test vì lỗi gài dùng mã hex
> cố định. **Giờ lỗi gài dùng `var()`, như mọi rule thật trong app.**
>
> Bốn lỗi gài, mỗi trạng thái một cái, mỗi cái phải bị bắt **đúng ở 1.61:1**:
> yếu-lúc-nghỉ, đạt-lúc-nghỉ (phải im), yếu-chỉ-khi-hover, yếu-chỉ-khi-focus.

Bằng chứng là phép ghi lại chạy đúng: **hover đo 442 control, lúc nghỉ đo
340.** 102 cái chênh ra là những control trong suốt cho tới khi có chuột trỏ
vào — `.vy-cell-input`, `.vy-header-select select`, `.vy-mpn-pick`.

## Đo trên bản đang chạy

`.vy-input`, tắt transition, nền panel:

| | nghỉ | hover **trước** | hover **sau** | focus **trước** | focus **sau** |
|---|---|---|---|---|---|
| light | 3.97 | 5.24 | 5.24 | 4.48 | **6.82** |
| dark | 4.04 | **2.68** | **5.23** | 3.82 | **9.58** |

> Lúc đầu bảng này ra số y hệt nhau ở cả ba trạng thái, và tôi tưởng phép ghi
> lại không chạy. Hoá ra script đo tay thiếu đoạn tắt transition mà `PROBE`
> thật vẫn chèn đầu tiên: `border-color` có transition, nên `getComputedStyle`
> đọc ngay sau khi đổi style trả về **giá trị cũ**. Bộ đo thật không sai; cái
> script chẩn đoán mới sai.

## Còn lại

**Trạng thái mang bởi thuộc tính** — `[aria-pressed]`, `[aria-checked]`,
`[data-on]` — vẫn ngoài tầm `border:check`: muốn thấy chúng thì app phải thật
sự ở trạng thái đó. Ba ca trong bảng trên tìm được bằng cách đọc bảng màu, chứ
không phải bằng quét. Chú thích ngoại lệ trong `contrast:check` ghi rõ cái nào.

**`boundary-soft` và `boundary-light` vẫn dưới 3:1, và là có chủ ý**: chúng vẽ
viền banner, khung verdict và một đường kẻ ngang — thứ 1.4.11 không nói tới.
Không có gì chặn một control trỏ sai vào chúng, và đó là việc của
`border:check`, vì nó đọc DOM thật.

**`.k-button.vy-funnel`** — `:hover` và `[aria-expanded]` của nó đặt
`border-color`, nhưng selector bridge `html[data-kendo-bridged]
.k-button-outline.k-button-base` ở (0,3,1) thắng (0,3,0), nên cả hai là khai
báo chết. Không sửa ở đây: sửa đúng là bỏ chúng đi hoặc nâng selector, và việc
đó thuộc về lượt dọn bridge.

## Kiểm lại

| | |
|---|---|
| `check:fast` | lint + `css:check` + build — **EXIT 0** |
| `contrast:check` | **174 cặp**, hai theme, self-test qua · 0 dưới ngưỡng · chặt nhất 3.05:1 |
| `border:check` | **1122 lượt đo** / 12 route × 2 theme × 3 trạng thái · 4 lỗi gài đều bị bắt ở 1.61:1 · 51 state rule ghi lại mỗi trang · **0 dưới 3:1** |
