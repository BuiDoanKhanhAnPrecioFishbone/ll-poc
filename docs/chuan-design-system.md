# Design system chuẩn được viết thế nào — và file của mình đang đứng ở đâu

**8/11/2026** · Đối chiếu `docs/design-system.md` v1.2 với cách các hệ thống
lớn đang viết. Nguồn đọc trực tiếp từ trang của họ, không qua blog trung gian;
danh sách ở cuối.

---

## 1. Trước hết: có **hai thể loại** tài liệu, và mình đang lẫn hai cái

| | **Reference site** | **Handover spec** |
|---|---|---|
| Ví dụ | Carbon, Polaris, Atlassian, GOV.UK, Material 3 | Tài liệu bàn giao cuối dự án |
| Đơn vị nội dung | **Một trang cho một component** | Một tài liệu tuyến tính, đọc từ đầu |
| Người đọc | Dev/designer đang làm một component **cụ thể** | Người tiếp quản, đọc một lần |
| Cách dùng | Tra cứu, search, deep-link | Đọc tuần tự |
| Sống thế nào | Cùng code, versioned, có changelog | Chụp một thời điểm |

`design-system.md` của mình đang là **handover spec** — A → F, đọc tuyến tính.
Mà mục F4 của chính nó lại liệt kê đúng checklist của một **reference site**:
*"component specs với mọi state và variant · usage rules có do và don't"*.
Phần D không có hai thứ đó. **Tự mình đặt ra tiêu chí rồi không đạt tiêu chí
của mình** — đây là chỗ dễ bị bắt nhất, vì nó nằm ngay trong file.

Không phải handover spec là sai. Nó sai khi **giả vờ** là reference.

---

## 2. Khung chuẩn: các hệ thống lớn chia thế nào

Gần như trùng nhau ở bốn tầng, cộng một tầng meta:

```
1 · Get started     cài đặt · cho designer · cho dev · contribution · release phases
2 · Foundations     token · màu · chữ · spacing · grid · elevation · radius ·
                    border · motion · icon · illustration · logo · content · a11y
3 · Components      MỘT TRANG MỘT COMPONENT, theo một template cố định
4 · Patterns        nhiều component ghép lại: form, filter, empty state,
                    hành động phá huỷ, thông báo, onboarding, page template
5 · Resources       changelog · versioning · status · tool · feedback
```

**Atlassian** đặt Foundations đúng 14 mục: Tokens, Accessibility, Content,
Spacing, Grid, Color, Typography, Motion, Iconography, Illustrations, Logos,
Elevation, Border, Radius — và có hẳn một mục điều hướng tên **Release
phases**.

### 2.1 Template một trang component — chỗ mình thiếu hẳn

Ba hệ thống, ba cách gọi, cùng một bộ xương:

| | **Carbon (IBM)** | **Atlassian** | **GOV.UK** |
|---|---|---|---|
| Tab | Guidelines · Specifications · Code · **Accessibility** | Examples · Code · Usage · **Changelog** | (một trang) |
| Mở đầu | Live demo | Default example | **When to use this component** |
| Dùng khi nào | **When to use / When not to use** | Usage tab | How it works |
| Biến thể | Variants (bảng, mỗi cái một mục riêng) | Appearance: primary/subtle/warning/danger/discovery | Default · Start · Secondary · Warning · Disabled |
| Cấu tạo | **Anatomy** (hình có đánh số) | — | — |
| Kích thước | Button sizes (7 cỡ, mỗi cỡ một use case) | Spacing · Full width | — |
| Chữ trong component | **Content**: nhãn, căn lề, RTL, tràn chữ | — | — |
| Trạng thái | Universal behaviors: states · interactions · loading | **States**: disabled · selected · loading | — |
| Biến thể phụ | Modifiers: có icon, chỉ icon | Button with icon · Truncation | Grouping buttons |
| Bằng chứng | **References** (dẫn nghiên cứu học thuật) | — | **Research on this component** |
| Lịch sử | — | **Changelog** tab | **Recent changes** (bảng có ngày) |
| Góp ý | Feedback → GitHub | — | **Help improve this component** |

Rút ra **template tối thiểu** cho mình:

```
<Tên component>                                    [status: stable / trial]
  Ảnh/demo thật
  Dùng khi nào · KHÔNG dùng khi nào          ← bắt buộc, quan trọng nhất
  Anatomy                                     ← hình, đánh số từng bộ phận
  Variant × State (ma trận)                   ← default/hover/focus/active/
                                                 disabled/busy/error × variant
  Nội dung chữ bên trong                      ← cách đặt nhãn, tràn chữ, RTL
  Hành vi                                     ← bàn phím, chuột, loading
  Accessibility                               ← role, aria, tab order, ngưỡng
  Token nó dùng
  Code / props
  Do / Don't (cặp ảnh)
  Liên quan · Thay đổi gần đây
```

**Điểm quan trọng nhất và cũng rẻ nhất**: *Dùng khi nào / Không dùng khi nào*.
Carbon và GOV.UK đều đặt nó **trên cùng**, trước cả hình. Đó là thứ ngăn người
ta dùng sai component — còn màu sắc thì token đã lo rồi.

### 2.2 Vòng đời component — mình chưa có

GOV.UK dùng hai trạng thái, và quy tắc chuyển rất cụ thể:

- **Trial** — mới, hoặc vừa đổi nhiều, cần service thật thử với người dùng thật.
- **Stable** — không gắn nhãn gì.
- **Chuyển Trial → Stable**: có phản hồi cộng đồng, **hoặc** đủ **6 tháng
  trial mà không có phản hồi tiêu cực** thì tự động lên Stable.
- **Deprecated** — không còn hợp nhu cầu người dùng, nghiên cứu, hay công nghệ.

Bộ phổ biến hơn trong ngành: `experimental / beta` → `stable` → `deprecated`.

Mình có 29 component trong `src/ui` mà **không cái nào có nhãn trạng thái**.
Người tiếp quản không biết cái nào chắc chắn, cái nào còn thử.

### 2.3 Token — đã có chuẩn hẳn hoi, không phải quy ước riêng

W3C Design Tokens Community Group (bản draft, chưa khuyến nghị implement):

- Token là **một object có `$value`**; **tên là key của object cha**.
- Thuộc tính tuỳ chọn: `$type`, `$description`, `$deprecated`, `$extensions`.
- `$type` **không bắt buộc trên từng token** — kế thừa được từ group. Tool
  **không được đoán** type từ hình dạng giá trị.
- Kiểu đơn: `color`, `dimension` (px/rem), `fontFamily`, `fontWeight`,
  `duration`, `cubicBezier`, `number`.
- Kiểu ghép: `typography`, `shadow`, `border`, `transition`, `gradient`,
  `strokeStyle`.
- Tham chiếu: `{group.token}`, hoặc JSON Pointer `$ref`. Chuỗi tham chiếu
  được phép; **vòng lặp là lỗi**.
- Group chỉ để tổ chức — tool **không được suy ra ý nghĩa** từ group.
- Tên: phân biệt hoa thường, không bắt đầu bằng `$`, không chứa `{`, `}`, `.`.

Ba lớp token của mình (ramp → role → component, mục A2) **khớp đúng cách
ngành đang làm**. Material 3 làm y hệt bằng từ khác: tonal palette → color
role (`primary` / `on-primary` / `primary-container` / `on-primary-container`)
→ component.

> **Một ý đáng mượn từ Material 3**: cặp **`x` / `on-x`**. Mỗi nền có sẵn màu
> chữ đi kèm nó, đặt tên thành cặp. Mình đã có `--vy-brand` / `--vy-brand-on`,
> `--vy-danger` / `--vy-danger-on` — nhưng **không áp dụng nhất quán**:
> `--vy-surface-selected`, `--vy-surface-strong`, `--vy-surface-sunken` đều
> không có `on-` đi kèm. Đó chính là lý do `contrast:check` phải đoán bằng
> cách thử mọi bậc chữ trên mọi nền, và là lý do lỗi `subtle` trên
> `surface-strong` nằm im hai tháng. **Có cặp `on-` thì cái lỗi đó không tồn
> tại được** — nền nào cũng biết chữ của nó là màu gì.

---

## 3. Đối chiếu: file của mình

### 3.1 Những chỗ file mình **hơn** chuẩn ngành — giữ bằng mọi giá

Đây không phải lời khen xã giao. Mấy thứ này hiếm, và phần lớn design system
nổi tiếng **không có**:

1. **Mọi con số đều có nguồn đo.** Luật A3.4 *"một số ma thuật phải kèm ghi
   chú nói đã đo cái gì"*. Carbon **có** nêu ngưỡng WCAG (4.5:1 chữ thường,
   3:1 chữ lớn và UI component) và nói mình *"strives to meet WCAG AA"* —
   nhưng **không công bố giá trị đo của từng cặp token**, không có ma trận,
   không có kết quả test. GOV.UK nêu 4.5:1 trong ngữ cảnh một component,
   không nói đã đo ra sao. Mình thì mỗi giá trị đều kèm số đo và ngày.
2. **Ghi lại quyết định kèm ngày và lý do.** "mono bỏ 13/10 vì *do not use
   monotext*", "sàn 12px chốt với khách 22/10". GOV.UK có *Recent changes* và
   *Research on this component* — nhưng ở cấp component, không ở cấp token.
   Mình đang làm ở cấp token, **chi tiết hơn họ**.
3. **Nói thật về cái chưa làm.** Luật A3.5, mục D6, và câu *"hai cái 860 và
   620 chưa có ghi chú, mà luật 4 nói là phải có"*. Rất ít hệ thống dám in
   lỗi của mình vào tài liệu.
4. **Đo tự động mỗi lần push.** `contrast:check` · `render:check` ·
   `touch:check` · `mobile:check` · `focus:check` · `hover:check`. **Không
   một hệ thống nào trong số đã đọc công bố điều này.**
5. **Trang specimen thắng tài liệu khi hai bên mâu thuẫn** (F3). Đây là câu
   trả lời đúng cho đúng bệnh mà tài liệu design system hay chết vì nó.

### 3.2 Những chỗ thiếu — theo thứ tự nặng dần

| # | Thiếu gì | Mức |
|---|---|---|
| 1 | **Component: 29 cái trong `src/ui`, tài liệu có 4** (Buttons, Fields, Grids, Dialogs) | nặng nhất |
| 2 | **Không có template component.** Không "dùng khi nào / không dùng khi nào", không anatomy, không ma trận variant × state, không props, không do/don't | nặng |
| 3 | **Không có tầng Patterns.** Không có: form, filter & search, hành động phá huỷ, thông báo/toast, page template, điều hướng. (D5 "bốn trạng thái màn hình" là pattern duy nhất đang có) | nặng |
| 4 | **Không có trạng thái vòng đời** cho component, không deprecation policy | vừa |
| 5 | **Không có changelog per component.** F3 có nói versioning nhưng không có bảng thay đổi ai cũng tra được | vừa |
| 6 | **Thiếu foundation: layout grid.** Atlassian có Grid riêng; mình có breakpoint (B7) nhưng không có hệ lưới/cột/máng | vừa |
| 7 | **Content/writing quá mỏng.** D6 dài 1 bảng. Polaris và Atlassian để Content thành **một foundation ngang hàng với màu** | vừa |
| 8 | **Chưa có cặp `on-` cho mọi surface** (xem mục 2.3) | vừa |
| 9 | **Không có data-visualisation.** Code đã có token `--vy-chart-*`, tài liệu không nhắc | nhẹ |
| 10 | **Không search được, không deep-link theo component.** Một file `.md` 1100 dòng | nhẹ, nhưng khó chịu khi dùng thật |

### 3.3 Hai câu trong file đang tự mâu thuẫn

- **F4** liệt kê *"component specs với mọi state và variant"* và *"usage rules
  có do và don't"* là thứ một bản handover phải có — **Phần D không có**.
- **A1** nói đây là file *"để một người dựng màn hình Voyager IQ mới mà không
  cần hỏi ai"*. Với 4/29 component được mô tả, câu đó chưa đúng.

Sửa hai câu này là việc của 10 phút, và nó chặn đúng loại câu hỏi khó nhất.

---

## 4. Nên làm gì — theo thứ tự

**Bước 1 · Vá hai câu tự mâu thuẫn (hôm nay).** Sửa A1 và F4 để nói đúng phạm
vi hiện tại: đây là *foundation* đã đầy đủ và *một phần component*. Không đội
mũ to hơn đầu.

**Bước 2 · Dựng template component, làm mẫu 1 cái.** Lấy `Button` làm mẫu vì
nó đã có sẵn nhiều nhất (D1 + specimen). Viết đủ: dùng khi nào / không dùng
khi nào / anatomy / variant × state / nội dung nhãn / hành vi bàn phím /
accessibility / token / props / do-don't. **Một trang mẫu tốt có giá trị hơn
29 trang sơ sài** — nó là cái để cả nhóm copy.

**Bước 3 · Phân loại 29 component thành ba nhóm**, mỗi cái gắn nhãn trạng
thái:
- *Stable* — đã dùng trong màn hình thật, API ổn → viết đủ template.
- *Trial* — có dùng nhưng còn đổi → viết gọn: dùng khi nào + state + token.
- *Internal* — helper, không phải component cho người dùng cuối
  (`kendoDomProps`, `useResetOn`…) → chỉ cần một dòng, không cần trang.

Việc này **tự nó đã là deliverable**, kể cả chưa viết chữ nào thêm.

**Bước 4 · Viết tầng Patterns.** Bốn cái đáng viết trước, vì chúng là chỗ
người ta làm sai nhiều nhất và là chỗ board đang tranh luận:
form record (view/edit), lưới + filter + cột, hành động phá huỷ + confirm,
và bốn trạng thái màn hình (đã có D5, chỉ cần nâng lên thành pattern).

**Bước 5 · Cặp `on-` cho mọi surface.** Việc token, không phải việc viết. Làm
xong thì `contrast:check` chuyển từ "thử mọi tổ hợp" sang "kiểm đúng cặp hệ
thống đã khai báo" — chặt hơn và nhanh hơn.

**Bước 6 · Khi nội dung đủ, đổi thể loại.** Lúc đó mới tách `.md` một file
thành site tra cứu được (`md-doc.mjs` đã dựng HTML sẵn; thêm mục lục theo
component và anchor là đủ dùng). **Đừng làm bước này trước bước 2–4** — một
site đẹp với 4 component vẫn là 4 component.

---

## 5. Một câu để trả lời nếu có ai hỏi "file này có chuẩn không"

> Phần **Foundation** của mình đầy đủ và chặt hơn mặt bằng chung — mọi giá trị
> đều có nguồn đo, và sáu phép kiểm tự động chạy mỗi lần push, điều mà Carbon,
> Atlassian, Polaris và GOV.UK đều không công bố. Phần **Component** mới có
> 4/29 và chưa theo template chuẩn của ngành (*dùng khi nào / không dùng khi
> nào* · anatomy · variant × state · do-don't). Phần **Pattern** và **vòng đời
> component** thì chưa có. Đó là lộ trình, đã viết ra, không phải chỗ bị bỏ
> quên.

Nói trước như vậy mạnh hơn nhiều so với để người khác tìm ra.

---

## Nguồn (đọc trực tiếp 8/11/2026)

- [Carbon Design System — Button, usage](https://carbondesignsystem.com/components/button/usage/) — template trang component, tab Guidelines/Specifications/Code/Accessibility
- [Atlassian Design System — Foundations](https://atlassian.design/foundations) — 14 mục foundation, mục Release phases
- [Atlassian Design System — Button, examples](https://atlassian.design/components/button/examples) — tab Examples/Code/Usage/Changelog
- [GOV.UK Design System — Button](https://design-system.service.gov.uk/components/button/) — *Research on this component*, *Recent changes*
- [GOV.UK Design System — Component lifecycle statuses](https://design-system.service.gov.uk/community/component-lifecycle-statuses/) — Trial / Stable, quy tắc 6 tháng
- [W3C Design Tokens Community Group — Format spec (draft)](https://www.designtokens.org/tr/drafts/format/) — `$value`, `$type`, alias, group, quy tắc đặt tên
- [Material Design 3 — Color roles](https://m3.material.io/styles/color/roles) — cặp base / on / container / on-container

---

## Phụ lục · 29 component trong `src/ui`, phân loại nháp cho Bước 3

Đây là **đề xuất để sửa**, không phải kết luận — Huyền là người biết cái nào
đã ổn định. Bốn cái đã có trong Phần D được đánh dấu ✓.

**Đã có trong tài liệu (4)**
`Button` ✓ (D1, và là component duy nhất có specimen sống) · `Field` /
`FieldRow` ✓ (D2) · `DataGrid` / `MiniTable` ✓ (D3) · `ConfirmDialog` ✓ (D4)

**Nên viết đủ template trước — xuất hiện trên hầu hết màn hình (9)**
`Badge` · `Chip` · `MoreMenu` · `Pager` · `Toast` · `FilterToolbar` ·
`ColumnChooser` · `Stepper` · `Priority`

**Viết gọn — dùng ít hơn, hoặc API còn có thể đổi (9)**
`FileDrop` · `PeoplePicker` · `RichText` · `ViewPicker` · `ViewSetting` ·
`Loader` · `GridSkeleton` · `RecordSkeleton` · `SupportTicket`

**Trạng thái màn hình — thuộc pattern D5 hơn là component riêng (3)**
`ErrorState` · `RocketLaunch` · `BootGate`

**Hạ tầng, không phải component cho người dùng cuối — một dòng là đủ (4)**
`ErrorBoundary` · `Overlays` · `icons` · `prefs`

**Helper, không cần trang (4)**
`renderCell` · `useExcelExport` · `kendoDomProps` · `useResetOn` (và các hook
`use*` khác trong cùng thư mục)

> Con số đáng nói ra khi trình bày: **29 component, 4 được mô tả, 1 có
> specimen sống.** Nói ra trước thì đó là lộ trình; để người khác đếm thì đó
> là lỗ hổng.
