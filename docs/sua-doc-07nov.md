# Design system 1.1 → 1.2 — đã sửa những gì, và ảnh hưởng tới Decision Board

**7–9/11/2026 · Huyền** · gửi kèm `design-system.md` / `.html` / `.pdf`, bản EN và VI.

Khi đối chiếu Decision Board với file của mình, em phát hiện **file của em sai**, không
phải board đọc nhầm. Ba chỗ, đều ở mục B2 · Typography. Đã sửa xong và build lại.

Hôm sau em soi tiếp toàn bộ tài liệu theo kiểu "cái gì kiểm được bằng máy thì kiểm" và
tìm thêm bốn chỗ nữa — **mục 5**.

Ba ngày sau đó là phần lớn khối lượng: viết nốt **29 trang component** và
**8 pattern** — đủ bộ — và chính việc viết chúng tìm ra thêm **11 lỗi tương
phản viền** mà không phép kiểm nào đang nhìn (**mục 7 và 8**), rồi **6 lỗi
nữa** ở hai pattern cuối (**mục 11**). Mục 9 chấm lại đủ 43 mục của board.
**Mục 10 là bảng "còn thiếu gì" mới nhất**, thay cho 6.4. **Mục 12 là lưới
layout** — chỗ trống cuối cùng, giờ đã lấp, và viết nó ra thì lòi thêm hai
chuyện đã đúng từ ngày dựng shell.

---

## 1. Thang chữ in trong bản 1.0 là khối touch, không phải giá trị mặc định

Em so máy móc toàn bộ **179 dòng token** trong tài liệu với `src/theme/tokens.css`:
**173 dòng đúng, 6 dòng sai** — và cả 6 đều là thang chữ.

| Token | Bản 1.0 in | Code thật |
|---|---|---|
| `--vy-text-2xs` | 12px | 10px → **12px** (xem mục 3) |
| `--vy-text-xs` | 13px | **12px** |
| `--vy-text-sm` | 14px | **12px** |
| `--vy-text-base` | 15px | **13px** |
| `--vy-text-md` | 16px | **14px** |
| `--vy-text-lg` | 18px | **16px** |

Sáu giá trị đó trùng khít khối `@media (pointer: coarse)` trong `tokens.css` — tức là bản
1.0 in nhầm thang dành cho màn hình cảm ứng và gọi nó là mặc định. `xl`, `2xl`, `3xl` đúng,
vì theo B7 cỡ tiêu đề không đổi khi sang touch.

Năm dòng sửa trong tài liệu; dòng `2xs` thì sửa ở code (mục 3). Cả hai bản ngôn ngữ. Đối
chiếu lại sau khi sửa: **0 sai lệch trên 179 dòng.**

## 2. B2 vẫn mô tả hai bộ chữ — giờ chỉ còn một

Mono đã được gỡ khỏi mã định danh từ **13/10** theo yêu cầu *"do not use monotext, hard to
read"*; chỗ sót cuối cùng (các lưới MiniTable trong Run Quotation) xong ngày **22/10**. Chỉ
có tài liệu là chưa theo kịp.

Hôm nay gỡ nốt phần còn lại: token `--vy-font-mono`, webfont `@fontsource/jetbrains-mono`
(vẫn đang tải về cho mọi người dùng dù không còn gì render bằng nó), 7 rule CSS, và biến
monospace của Kendo trỏ về cùng một bộ sans.

Một chỗ suýt sót: `code`, `kbd`, `samp`, `pre` **mặc định là monospace của trình duyệt**, nên
xoá rule đi thì 13 phần tử rơi về mono của hệ điều hành — đúng cái mặt chữ khách yêu cầu bỏ.
Bắt được lúc chụp lại ảnh. Đã thêm một reset trong `base.css`.

B2 giờ ghi đúng lập luận của khách ngày 22/10: yêu cầu là **sự nổi bật, không phải một bộ
chữ** — nên mã định danh dùng semibold + mực đậm + `tabular-nums`.

## 3. Bậc duy nhất còn dưới sàn 12px

`--vy-text-2xs` vẫn là **10px**, dùng ở 10 rule (badge, avatar nhỏ, `.vy-column-req`,
`.vy-vs-required`…), trong khi 12px đã là sàn thống nhất với khách từ 22/10. Đã nâng lên
12px. Hệ quả: trên màn hình chuột, `2xs`, `xs`, `sm` cùng là 12px — ba cái tên, một cỡ. Giữ
cả ba tên vì chúng mang nghĩa khác nhau và **tách lại thành 12/13/14 dưới `pointer: coarse`**.
Tài liệu nói rõ điều này thay vì câu "+2px đều" cũ, vốn không còn đúng.

## 4. Trang mẫu và ảnh trong PDF

`/design-system` hiển thị `--vy-text-xs · 11px` — con số sai này được in thẳng vào
`type-scale.png` và theo đó vào bản PDF bàn giao. Đã sửa, thêm hai bậc còn thiếu (`3xl`,
`2xs`), và chụp lại ảnh light + dark ở 2×.

---

## Đã kiểm

| | |
|---|---|
| Đối chiếu doc ↔ `tokens.css` | 179 dòng, **0 sai lệch**, cả EN và VI |
| `npm run check:fast` | pass (lint, css:check, build) |
| `npm run render:check` | 12 route, **0 finding** |
| Mono còn sót trên màn hình chạy thật | **0 phần tử** nào resolve ra mặt chữ monospace |
| Mã định danh | Inter Variable · 600 · `tabular-nums` · 13px |
| Bundle | không còn file woff2 nào của JetBrains Mono |

---

## Ảnh hưởng tới Decision Board

**Hai mục cần đổi — vì gán nhầm cho em, và phần sai gốc là ở file em:**

- **O6 · Smallest text.** 11px là của Standard, không phải của em. Chính em đề xuất sàn 12px
  trong bản review 16/10 (mục D.2), và khách đã đồng ý ngày 22/10 — *"hệ thống mình xử lý chữ
  và dữ liệu nhiều"*. Nhãn "B · 12px · Proposal" nên đổi thành **đã chốt**, không phải đề xuất.
  Sở dĩ board ghi 11px là vì bản 1.0 của em in sai thang chữ; lỗi đó giờ đã sửa.
- **C1 · Monospace for codes** (và **O9 · option C**). Mono không phải lựa chọn của em — em
  **gỡ** nó ngày 13/10 theo chỉ đạo 8/10, và bản review 16/10 của em (mục C1) ghi rõ Standard
  14/10 mới là bên yêu cầu mono. Sau hôm nay repo không còn `--vy-font-mono`. Mục này có thể
  đóng lại: hai bên cùng một đáp án.

**Một mục em nhận là board đúng:**

- **H2 · Brand blue in the dark theme.** B1.5 của em mở đầu bằng "fill và text là hai role
  tách biệt" nhưng bảng dark lại cho cả hai cùng `#7f9ce1`. Đó là mâu thuẫn thật trong file
  em. Option B đúng với chính nguyên tắc em viết.

**Vài mục em muốn nói thêm khi mình ngồi chốt phần 1** (ghi ở đây để khỏi quên, không cần trả
lời ngay):

- **C5 · Colors in a grid** — hướng "chỉ tô ô có vấn đề" vốn là đề xuất của em trong review
  16/10, kèm số đo ngày 15/10: `ROCKET_PN` được tô trên 13/13 dòng. Legend cũng do em thêm
  ngày 15/10. Hai bên đang cùng một hướng chứ không đối nhau.
- **C8 · Loading/empty/error** — là **một hình, ba trạng thái** (một SVG, `data-state` đổi
  cảnh), không phải 4 hình; empty state cố ý không có minh hoạ; và skeleton thì đã có sẵn
  (dùng đúng column role và nhãn trường thật). Nửa option B đang mô tả thứ mình đã làm.
- **C3 · Read-only in edit mode** — padlock chỉ xuất hiện **trong edit mode**. Lập luận
  "27 padlock thì chẳng đánh dấu được gì" là câu em viết trong D2.
- **Zebra** đang nằm trong nhóm Confirmed là "bỏ hẳn". Của mình là zebra **theo record, không
  theo dòng**, để một part trải nhiều dòng AML đọc thành một khối — bỏ đi thì mất chức năng đó.
- **O7** mới bàn vị trí message; rule hành vi trong D2 là **báo lỗi on blur, không phải mỗi
  lần gõ** — nên giữ dù chọn A hay B.
- Mấy mục ở phần 4 bị rút gọn khi đưa vào board: **AD5** còn 8/13 bậc spacing, **AD3** còn
  6/10 surface, **AD7** thiếu role `datetime` 190px, **AD9** thiếu dòng `pointer: coarse`,
  **AD8** thiếu 4 easing và loading clock — và ghi "tắt motion thì không có animation nào",
  trong khi B6 của em nói ngược lại (reduced motion là một trạng thái: rocket giữ pose nhưng
  step bar vẫn chạy).

---

## Còn lại

**Một chỗ em cố ý chưa đụng.** `scripts/md-doc.mjs` — script dựng file HTML/PDF này — đang
style các đoạn `code` trong văn bản bằng JetBrains Mono. Đó là typography của *tài liệu*, không
phải của sản phẩm, và script đó còn dùng cho các doc khác. Nhưng một design system nói "một bộ
chữ" mà tự nó in code bằng mono thì hơi ngược, nên em để mọi người quyết định.

Chưa có check nào đối chiếu bảng token trong `.md` với `tokens.css` — đó là lý do lệch này
nằm im hai tuần mà không ai thấy. Nếu mọi người thấy cần, em thêm một
`scripts/doc-check.mjs` vào `check:fast` để lần sau build sẽ fail ngay.

---

# 5. Vòng hai, 8/11 — bản 1.2

Em tự soi lại tài liệu một lượt nữa, chỉ nhắm vào những khẳng định **kiểm chứng được
bằng máy**. Bảy nhóm sạch, bốn chỗ không đứng vững.

## Bảy nhóm đã sạch

| Kiểm | Kết quả |
|---|---|
| 179 dòng token trong tài liệu ↔ `src/theme/` | **179/179 khớp**, EN và VI |
| Luật ba khối dark (B1.8) | 85 token ở `[data-theme="dark"]`, 85 ở media query, **giá trị trùng khít** |
| Năm tỉ lệ contrast tài liệu nêu | đúng tới hai chữ số thập phân |
| Column roles · dialog · shell · z-index | khớp code tuyệt đối |
| Row tone trong dark | resolve qua chuỗi `var()` đều đúng (em nghi sai rồi kiểm lại thì không) |
| Zebra theo record · `.vy-ident` · mono | đúng như tài liệu mô tả |
| Mọi đường dẫn file tài liệu nhắc tới | đều tồn tại |

## Bốn chỗ đã sửa

**1. Số route trong C2.3.** Viết "~70 of 91" mà không nói 91 ở đâu ra — vi phạm chính
luật A3.4 của mình ("số ma thuật phải có ghi chú"). Giờ ghi rõ: **71 trên 82 đích đến**
của menu live, nguồn là `src/data/sitemap.ts` (91 mục `path`, 82 đích phân biệt), và
`App.tsx` khai báo 21 route thật cộng một catch-all.

**2. B7 ghi ba breakpoint, stylesheet có mười một.** Ba cái kia là của shell. Tám cái
còn lại là của component và **đều có số đo kèm lý do trong code** — nhưng tài liệu
không nhắc, nên đọc vào tưởng hệ thống chỉ có ba. Giờ liệt kê đủ, chia hai nhóm. Hai
cái (860, 620) chưa có ghi chú, em ghi thẳng vào tài liệu là còn thiếu.

**3. E1 nói "đo 78 tổ hợp, 0 lỗi" nhưng không ai đo lại.**
`contrast-sweep.md` đề ngày **5/9**, chạy đúng một lần, trước khi có dark theme, bộ
status và sàn 12px. Trong khi ba dòng còn lại của bảng đều dẫn check chạy mỗi lần push.
Một mục tên là *"Đo, không phải khẳng định suông"* mà dựa trên phép đo không ai lặp lại
thì không đứng được.

Em viết `scripts/contrast-check.mjs`, gắn vào `css:check` nên **nó chặn build**. Nó đọc
`tokens.css`, resolve `var()` ở cả hai theme, kiểm **114 cặp**: từng bậc chữ trên từng
nền nó có thể nằm lên, brand, danger, tám status pill, row tone, hai đường biên phi-chữ.
Mỗi lần chạy nó tự cấy `#bbbbbb` trên nền trắng và thoát lỗi nếu không bắt được 1.92:1 —
một bản quét báo "không lỗi" chỉ đáng đọc nếu chứng minh được nó sẽ tìm ra lỗi nếu có.

Tài liệu giờ nói rõ **hai phép đo trả lời hai câu khác nhau**: bản quét 5/9 đọc pixel
canvas trên trình duyệt (thấy được thứ token không nói ra); `contrast:check` chỉ đọc
token (bắt được bảng màu trôi khỏi tài liệu). Cái sau không thay cái trước.

> **Và nó bắt được một lỗi ngay hôm viết.** `on-surface-subtle` `#626d7e` trên nền
> `surface-strong` = **4.02:1**, dưới 4.5. Dark theme đã xử việc này rồi — chú thích
> trong `tokens.css` ghi "bậc subtle đặt theo nền xấu nhất của nó" — light thì chưa bao
> giờ. Cặp này hiện **chưa xảy ra** trong CSS (chỗ duy nhất dùng `surface-strong` làm
> nền chữ thì dùng `muted`, 5.62), nên là lỗ hổng chờ chứ chưa phải lỗi sống — đúng lúc
> vá là rẻ nhất. `subtle` giờ là **`#5b6575`**: giá trị thứ hai trong hệ thống chọn bằng
> đo đạc thay vì lấy từ ramp, sau `--vy-border-control` và vì cùng một lý do (grey-500
> thiếu 0.48, grey-600 vọt lên 5.62 và trùng với `muted`). Mọi nền khác đều tốt lên.

**4. `progress` là status duy nhất chưa ai làm tối.** Bảy cái đảo cho dark, riêng nó giữ
cặp sáng `#155e75` / `#cffafe` — nên lưới dark hiện đúng một chip cyan sáng giữa bảy
chip tối. Contrast trong chip chưa bao giờ là vấn đề (6.49:1); **trông sai** mới là vấn
đề. Giờ là `#96e4ee` / `#1e3838`, dựng đúng cách bảy cái kia được dựng (chữ chạy giữa
`96`–`ee`, nền giữa `1e`–`38`, kênh giữa mang hue), 8.72:1.

> **Một điểm em muốn mọi người biết, không phải để sửa ngay:** `progress` và `review`
> cách nhau **1.5° hue ở light** và 6° ở dark — tức là hai status gần như cùng một màu,
> và vốn đã thế từ trước. Thứ tách chúng ra là **chữ**, đúng như luật B1.6 ("status là
> một chữ kèm một màu"). Nếu sau này có ai nhầm hai cái trên màn hình thì lời giải là
> đổi hue cho một trong hai, không phải làm cyan tối thêm. Liên quan trực tiếp tới **O2**.

## Hai việc kèm theo

- **Ghi chú trên trang specimen đã nói sai.** Mục Status vocabulary viết *"trong dark,
  In-Progress cố ý giữ màu xanh đặc"* — thực ra đó là mô tả một chỗ bị bỏ sót, khoác áo
  một quyết định. Đã viết lại.
- **26 hình trong tài liệu trước nay chụp tay, không script nào dựng lại được.** Đó là
  lý do chúng âm thầm cũ đi khi token đổi. Em viết `scripts/capture-design-system.mjs`
  dựng lại toàn bộ 18 hình lấy từ trang specimen (light + dark, 2×, khung đồng nhất).
  Các hình chụp từ màn hình app thật (`states-field-*`, `states-row-tones`,
  `error-state`, `responsive-*`, các trạng thái rocket) **vẫn chụp tay** — vài cái dùng
  record không có trong seed data nên script không tái tạo được mà không bịa nội dung.
  Hệ quả cần biết: mấy hình đó đang mang `subtle` cũ, lệch một sắc rất nhỏ. Đáng xử lý
  riêng bằng cách seed sẵn những record chúng đã dùng.

## Đã kiểm lại sau tất cả

| | |
|---|---|
| doc ↔ code | 179 dòng, **0 sai lệch**, EN và VI |
| `contrast:check` | 114 cặp, **0 dưới ngưỡng**, chặt nhất 3.06:1 (biên control), self-test đạt |
| Luật ba khối dark | 85/85, giá trị trùng khít |
| `check:fast` | pass |
| `render:check` | 12 route, **0 finding** |

---

# 6. Nửa sau ngày 8/11 — trang component, và một lỗi token gốc

## 6.1 Bắt đầu viết trang component theo chuẩn ngành

Đối chiếu trực tiếp Carbon, Atlassian, GOV.UK, Material 3 và bản spec token
của W3C (ghi ở `docs/chuan-design-system.md`), rồi viết ba trang đầu theo
template chuẩn: **dùng khi nào · không dùng khi nào · cấu tạo · biến thể ×
trạng thái · chữ nghĩa · hành vi · khả năng tiếp cận · API · nhật ký đổi.**

| Trang | Trạng thái | Viết ra thì tìm thấy gì |
|---|---|---|
| `components/button.md` | stable | Chỉ báo busy **1.19:1** trên `filled` — đã sửa |
| `components/badge.md` | stable | `review` có màu nhưng không có đường nào render; comment ghi sáu token, thực tế bảy |
| `components/chip.md` | trial | Viền lúc nghỉ 1.64:1 và `aria-pressed` biến mất — đã sửa |

Cả ba trang đều tìm ra một thứ. Đó là lập luận để viết nốt 26 cái còn lại.

> **Một specimen suýt nói dối.** Bản đầu của ma trận trạng thái vẽ hover và
> press bằng cách gắn class `.k-hover` / `.k-active` của Kendo. Đo lại bằng
> chuột thật trước khi chốt: Kendo **không bao giờ** gắn mấy class đó, và
> `.k-hover` làm nút tonal chuyển sang xanh đặc — một trạng thái người dùng
> không bao giờ thấy được. Đã bỏ; specimen giờ chỉ vẽ ba trạng thái đứng yên
> thật, ba cái còn lại viết thành bảng kèm token.

## 6.2 Lỗi token gốc: `--vy-border-control` chỉ đạt trên một nền

Quét mọi control focus được trên 12 route thì ra **bảy** cái viền dưới 3:1.
Nhưng năm trong bảy **không phải dùng sai token** — chúng dùng đúng, mà token
thì thiếu. `#8a94a6` chọn hồi tháng 9 là "nhạt nhất mà vẫn đạt" — **trên nền
trắng**:

| surface | subtle | app | hover | selected | sunken | strong |
|---|---|---|---|---|---|---|
| 3.06 ✓ | 2.98 | 2.85 | 2.85 | 2.78 | 2.65 | 2.35 |

Cùng y hệt lỗi của bậc chữ `subtle` hôm trước, và cùng cách sửa: **đặt theo
nền xấu nhất**. Light `#758096`, dark `#707c8d`, chặt nhất 3.05.

Rồi phép kiểm mới tìm thêm một cái nữa ngay lần chạy đầu: **vòng focus trong
dark** chỉ 2.88 trên `surface-strong`. Dark giờ dùng blue-300, chặt nhất 4.76.

Hai cái còn lại đúng là dùng sai token (`.vy-search`, `k-button-outline`,
hai `<select>`, `.vy-audit-chip`, `.vy-smart-btn`) — đã trỏ lại hết.

## 6.3 Hai phép kiểm mới, để không tái diễn

- **`contrast:check` giờ đo đường biên trên mọi nền** — 114 → **142 cặp**.
  Chặn được nửa "token thiếu giá trị".
- **`border:check`** (mới) — đo viền **như đang vẽ thật** trên trang đang
  chạy, 340 control, 12 route × 2 theme. Chặn được nửa "dùng sai token", thứ
  mà `contrast:check` không bao giờ thấy vì nó chỉ đọc `tokens.css`.
  Đã thêm vào CI như một job riêng, cạnh năm check kia.

Self-test của `border:check` đòi **đúng con số 1.61** chứ không chỉ "có bắt
được hay không" — vì bản quét tay đầu tiên đã hỏng đúng kiểu đó (canvas không
xoá giữa hai lần đọc, mọi dòng ra 1.00). Một bộ đo báo "không có lỗi" chỉ
đáng đọc nếu chứng minh được nó sẽ tìm ra lỗi nếu có.

## 6.4 Giờ còn thiếu gì — nói trước

> *Bảng dưới đây là trạng thái **tối 8/11**. Bản mới nhất ở **mục 10**.*

| | |
|---|---|
| Trang component | **3 trên 29** |
| Pattern | **1** (bốn trạng thái màn hình) |
| Trạng thái vòng đời | chỉ 3 component có |
| Changelog từng component | chỉ 3 component có |
| Lưới layout | chưa có |

Nền móng thì chặt: 179 dòng token khớp code, 142 cặp tương phản và 340 viền
control đo mỗi lần push, luật ba khối dark 85/85. Phần component mới đi được
một phần mười chặng đường, và lộ trình nằm ở `chuan-design-system.md`.

## 6.5 Một lỗi **không phải của đợt này**, nhưng nên biết

Chạy đủ bộ sáu check thì `mobile:check` **fail**, với **198 phát hiện
`unreachable`**: hàng lưới và thanh pager nằm dưới mép màn ở `tablet 768` và
ở breakpoint 820, mà không có gì cuộn tới được — chủ yếu trên
`/inventory-management/packing-list` và `/sales-management/quotation`.

Đã kiểm xem có phải do mấy thay đổi mấy hôm nay không: stash toàn bộ `src`,
chạy lại trên đúng commit `c79fe66`. Kết quả **198 phát hiện, giống hệt nhau
từng loại một** — 144 `tr.k-table-row`, 19 `div.vy-pager`, 6
`span.vy-truncate`, … Vậy nó đã hỏng từ trước.

> **Lần đo đầu suýt kết luận ngược.** Baseline đầu tiên báo "pass" ở HEAD, tức
> là lỗi do mình. Nhưng lúc đó `@fontsource/jetbrains-mono` đã bị gỡ khỏi
> `node_modules` (đúng việc cần làm ở bản 1.1), trong khi `main.tsx` của HEAD
> vẫn import nó — app không tải được, `mobile:check` đo một trang trắng và báo
> 0 lỗi. Một baseline "sạch" vì **không có gì để đo**. Phải cài lại gói rồi
> mới stash thì con số mới có nghĩa.

Việc cần làm tiếp là riêng: đây là lỗi **cuộn trang trên tablet**, không liên
quan màu hay token. Cần người quyết định hành vi mong muốn ở 768px.

---

# 7. 8–9/11 — viết nốt 29 trang component và 6 pattern

Lập luận ở 6.1 là: ba trang đầu, mỗi trang đều tìm ra một thứ, nên đáng viết
hết. Đã viết hết. **29/29 trang component**, và pattern từ 1 lên **6 trên 8**.
*(Hai cái cuối viết sau, ở **mục 11**.)*

Và lập luận đó đúng tới trang cuối cùng — **không trang nào không tìm ra gì**.
Những cái đáng nói nhất:

| Trang | Viết ra thì tìm thấy gì |
|---|---|
| `field.md` | **91 call site**, nhiều nhất sản phẩm. Và luật hint/error — không bao giờ hiện cả hai cùng lúc |
| `error-state.md` | `app.css` có nguyên một khối chú thích đề `--- Error state ---`, dưới nó **không có một rule nào**. Tuyên bố suốt nhiều tuần, chưa bao giờ vẽ |
| `dialog.md` | Ba tầng dialog chồng nhau đúng **chỉ nhờ thứ tự mount**, không nhờ luật nào |
| `pager.md` | Thay cho infinite scroll trên 21.941 record — đánh đổi đã ghi rõ |
| `more-menu.md` | Cancel RFQ nằm cách nút Save **69px**, khách yêu cầu 8/10 và phép đo độc lập ra cùng kết luận |
| `data-grid.md` | "Chọn tất cả" nghĩa là **trang này**. Trên 2.000 dòng, một chữ "all" trần xuất ra thứ người dùng không định xuất |
| `column-chooser.md` | **6 trên 11 cột là bắt buộc** — một hộp chọn cột mà đa số dòng bị khoá thì cần nói lý do |
| `people-picker.md` | Danh bạ live có "Linh 4 Tran", "Linh Tran 5", "Linh Tran 1" — **email không phải trang trí**, nó là thứ duy nhất phân biệt được |
| `grid-skeleton.md` | Bản live ghi "No records available" **trong khi** spinner của chính nó còn quay |
| `rich-text.md` | Dấu "?" trên bản live **không phải** nút trợ giúp — nó là avatar rỗng. Nên cố tình không làm nút trợ giúp |
| `view-setting.md` | Hai lỗi chữ trong bản live, sửa chứ không chép lại |
| `checkbox.md` | Dùng class của Kendo chứ không dùng component của Kendo: `indeterminate` không có prop |

**Bốn trang để `trial`** chứ không `stable`, và mỗi cái có lý do kỹ thuật:
chip, file drop, rich text, support ticket. Ví dụ `file-drop.md` — nó trả về
**tên file**, không phải `File`, nên phần đọc bảng tính vẫn chưa có; ghi
`stable` là nói quá.

**Pattern (6/8 lúc này):** record form · destructive action · list screen ·
wizard · feedback · file upload. Dashboard và search viết ở **mục 11**.

> **Ba trang suýt bị viết theo trí nhớ.** `grid-skeleton`, `record-skeleton`
> và `file-drop` — bản nháp đầu dẫn một file `src/ui/Skeletons.tsx`
> **không tồn tại** và một loạt prop em tự nghĩ ra. Đọc lại code rồi viết lại
> cả ba. Bản viết lại tốt hơn hẳn, vì nó mang số thật: bảng bề rộng theo
> `data-role`, và lịch sử đo `RecordSkeleton` lệch **92px** rồi còn **24px**.
>
> Đây đúng là thứ mục 1 nói: **tài liệu mô tả một hệ thống không còn đúng**.
> Nên từ đó mọi trang đều viết bằng cách mở code ra đọc trước.

## 7.1 Năm lỗi viền nữa, do chính việc viết trang lộ ra

`border:check` ở 6.3 báo sạch. Nhưng khi viết trang cho từng control và tự
kiểm lại từng câu mình viết, ra thêm **năm chỗ dưới 3:1** — và lý do chúng
lọt lưới đều có cấu trúc, không phải may rủi:

| Chỗ | Trước | Vì sao phép quét không thấy |
|---|---|---|
| `.vy-people-add` lúc nghỉ | **1.64** | Chỉ hiện khi record **vào chế độ sửa** — bản quét không bấm vào đâu cả |
| `.vy-people-add:hover` | **2.58** | Hover làm viền **mờ hơn** lúc nghỉ, mà quét chỉ đo lúc nghỉ |
| `.vy-search:hover` | **1.64** | Đang **phá** chính bản sửa lúc nghỉ làm cùng ngày, với bất kỳ ai để chuột lên |
| `.vy-btn--outlined` | **1.64** | Chỉ ra DOM qua `asChild` (một router Link mặc áo nút), nên bản sửa trong kendo-bridge không với tới |
| `.vy-cell-input:hover` · `.vy-header-select select:hover` | **1.64** · **1.30** | Trong suốt lúc nghỉ — **hover chính là** thứ nói cho người dùng biết ô đó gõ được |

Hai cái cũng đã kiểm và kết luận **không phải lỗi**: `.k-button.vy-funnel:hover`
là khai báo chết (bridge thắng về specificity), còn `.vy-queue` / `.vy-kpi`
là thẻ card đã nằm trong danh sách miễn trừ có lập luận.

---

# 8. 9/11 — viền ở các trạng thái, và lỗ hổng chung của cả hai phép kiểm

Bảng 7.1 có một điểm chung mà lúc đầu em không thấy: **ba trong năm là lỗi ở
trạng thái**, không phải lúc nghỉ. WCAG 1.4.11 nói về viền của control **và
các trạng thái của nó** — mà cả hai phép kiểm đều chỉ đo lúc nghỉ:
`contrast:check` đọc bảng màu, `border:check` quét một trang không ai trỏ
chuột vào. Nửa yêu cầu đó **chưa từng được đo**.

Nửa đó có lỗi, và nằm ngay trên ô gõ chữ chính của sản phẩm.

## 8.1 Hover trong dark làm viền **mờ đi**

Chú thích cạnh `.vy-input:hover` tự giải thích, và nó chỉ đúng ở light:

> *grey-500, chứ không phải grey-400. Viền lúc nghỉ giờ đậm hơn grey-400, nên
> hover cũ lại nhạt hơn chính cái trạng thái nó muốn nhấn.*

Đúng trên nền trắng. Trong dark viền lúc nghỉ là `#707c8d` còn grey-500
**đậm hơn** nó — nên một dòng khai báo vừa làm hover mờ hơn lúc nghỉ, vừa tụt
dưới ngưỡng: **2.68** trên panel, **2.02** trên `surface-strong`.

**Đây đúng y lỗi "đo trên nền trắng" của mục 6.2**, chỉ dịch sang một trạng
thái. Và cách sửa cũng cùng họ: **một giá trị không làm được cả hai theme**,
vì *dễ thấy hơn* nghĩa là đậm hơn trên trắng và nhạt hơn trên gần đen. Nên
hover thành một role riêng, `--vy-border-control-hover`:

| | Giá trị | Trên panel | Nền xấu nhất |
|---|---|---|---|
| light | grey-500 `#626d7e` | 5.24 (nghỉ 3.97) | 4.02 |
| dark | `#858f9e` | 5.23 (nghỉ 4.04) | 3.95 |

**Light không đổi một pixel nào** — grey-500 đúng là giá trị rule cũ vẫn đang
vẽ ra ở light. Chỉ dark được sửa.

## 8.2 Viền focus trong dark — token bị bỏ sót từ chính mục 6.2

Cái này khó chịu hơn, vì **phép đo chứng minh nó đã nằm sẵn trong file từ
8/11**.

Mục 6.2 kể: phép kiểm mới tìm ra vòng focus trong dark chỉ 2.88 trên
`surface-strong`, nên chuyển sang blue-300. Nhưng `--vy-brand-boundary-strong`
— **viền** focus, chứ không phải vòng focus — vẫn để blue-400, **đúng con số
2.88 đó**. Hai token đo trong cùng một lượt, chỉ một cái được sửa.

Nó là viền focus của `.vy-input`, `.vy-cell-input`, `.vy-richtext` và 10 rule
khác — **mọi ô gõ chữ trong sản phẩm**.

Thêm nữa, *"strong"* nghĩa là nhấn hơn `boundary` một bậc: ở light là đậm hơn,
ở dark phải là nhạt hơn. Giữ blue-400 làm cặp này **lộn ngược** — trong dark
"strong" đậm hơn `boundary` thường, nên yếu hơn nó. blue-200 trả lại quan hệ
đúng: **2.88 → 7.22**.

Đo trên `.vy-input`, bản đang chạy, đã tắt transition:

| | nghỉ | hover **trước** | hover **sau** | focus **trước** | focus **sau** |
|---|---|---|---|---|---|
| light | 3.97 | 5.24 | 5.24 | 4.48 | **6.82** |
| dark | 4.04 | **2.68** | **5.23** | 3.82 | **9.58** |

Nhìn bằng mắt ở dark thì thấy ngay: dòng "hover cũ" **mờ hơn** dòng "lúc
nghỉ" ngay phía trên nó.

## 8.3 Bốn rule nữa

| Rule | Trước | Vì sao sót |
|---|---|---|
| `.vy-sup-btn:hover` | **2.02** dark | Cùng lỗi với `.vy-input` |
| `.vy-density-choice[aria-checked]` | **1.37** light · **1.89** dark | Trong suốt lúc nghỉ, nên viền lúc chọn **là toàn bộ** biên. Fill không gánh nổi: `brand-subtle` trên panel chỉ 1.14 ở dark |
| `.vy-vs-dir` lúc nghỉ | **1.30** | Nằm trong dialog View Setting — `border:check` không mở dialog |
| `.vy-vs-dir[aria-pressed]` | **2.08** light | Bấm vào làm viền mờ hơn chính cái viền nó vừa thay |

Thêm một chỗ **không phải lỗi nhưng sai token**: `.vy-audit-chip:hover` đang
dùng một token **chữ** để vẽ viền control. Nó đạt (5.89 / 6.01), nhưng lần
tới đổi bậc chữ `subtle` là viền chip đi theo. Đã trỏ lại đúng role.

## 8.4 Phần đáng giữ: dạy phép kiểm nhìn thấy trạng thái

Sửa sáu rule là việc một buổi. Việc để lần sau không phải tìm bằng tay:

- **`contrast:check`** — 142 → **174 cặp token**, thêm viền-lúc-hover và
  viền-focus trên cả 8 nền × 2 theme.
- **`border:check`** — **ba lượt** thay vì một: nghỉ, hover, focus.
  **1122 lượt đo** trên 12 route × 2 theme.

Cách đo trạng thái mà không có chuột: không dùng `forcePseudoState` của
DevTools (`hover:check` dùng, và hợp lý ở đó, nhưng ở đây là 8.160 lượt gọi
mạng), mà **đưa trạng thái về lúc nghỉ** — phát lại mọi rule có pseudo-class,
với pseudo-class đổi thành một cái đang đúng, chỉ mang theo khai báo viền.

> **Self-test bắt được hai lỗi trong chính bộ đo mới, và nếu không có nó thì
> cả hai đều trông y hệt một bản quét sạch.**
>
> *Một.* Từ khi CSS nesting có mặt, một `CSSStyleRule` thường **cũng** có
> `cssRules` — danh sách rỗng, nhưng truthy. Phép kiểm nhóm viết trước phép
> kiểm selector nên nó **nuốt sạch** mọi style rule và không phát ra rule nào.
>
> *Hai.* Chrome tách `border-color` thành bốn longhand, và khi giá trị là
> `var()` thì `getPropertyValue('border-top-color')` trả về **chuỗi rỗng**.
> Bản đầu phát ra 51 rule `border-top-color: !important` — đúng cú pháp,
> không tác dụng gì, và báo cáo ba trạng thái sạch bong. Nó **qua** self-test
> vì lỗi gài dùng mã hex cố định. Giờ lỗi gài dùng `var()`, như mọi rule thật
> trong app.
>
> Cùng một nguyên tắc đã nói ở 6.3, và lần này nó cứu đúng hai lần.

Bằng chứng phép ghi lại chạy thật: **lúc hover đo 442 control, lúc nghỉ đo
340**. 102 cái chênh ra là những control **trong suốt cho tới khi có chuột
trỏ vào** — ô bảng sửa được, select trên header, nút chọn MPN.

Chi tiết đầy đủ: `docs/vien-state-09nov.md`.

---

# 9. Chấm lại đủ 43 mục của Decision Board

Board chưa được tổng hợp, nên em tự chấm: lấy đúng 43 mục của
`VIQ UI Decision Board Nov-05-26` làm checklist, đối chiếu với hệ thống sau
tuần này. Nguyên tắc: **chỉ ghi "xong" khi có số đo hoặc code chứng minh**,
không ghi "xong" vì mình thấy hợp lý. Bản đầy đủ ở `docs/cham-board-08nov.md`.

| | Số mục |
|---|---|
| ✅ Đã khép bằng bằng chứng — không còn gì để tranh luận | **14** |
| 🔧 Board nói đúng, mình đã sửa tuần này | **5** |
| 🟡 Vẫn cần người quyết — hai bên đều hợp lý | **13** |
| 📄 Đã có trong hệ thống, chỉ cần board ghi nhận | **11** |

**Một chỗ em muốn bàn lại trong nhóm board đã chốt:** mục **Zebra — "bỏ
hẳn"**. Của mình là zebra **theo record**, để một part trải nhiều dòng AML
đọc được thành một khối; lập luận nằm trong `MiniTable.tsx`. Bỏ hẳn là mất
chức năng đó. Vì nó đang nằm trong nhóm "đã chốt" nên sẽ không ai bàn lại
nữa — nên em nêu ở đây.

**Ba chỗ board không phủ mà em thấy nặng hơn vài mục đang có trong board:**
`mobile:check` đang đỏ (mục 6.5) · trạng thái `review` có màu nhưng không có
đường nào render ra · vị trí tab thì ảnh annotate hỏi thẳng mà board không có
mục nào.

---

# 10. Còn thiếu gì — bảng mới nhất (thay cho 6.4)

| | Tối 8/11 | **Hôm nay** |
|---|---|---|
| Trang component | 3 / 29 | **29 / 29** |
| Pattern | 1 | **8 / 8** — đủ bộ |
| Trạng thái vòng đời (trial/stable) | 3 component | **mọi trang**, 4 cái đang `trial` |
| Changelog từng component | 3 component | **mọi trang**, dạng bảng có ngày |
| Lưới layout | chưa có | **mục B8**, đo bằng `grid:check` — xem mục 12 |
| Mảng màu không mang chữ | không ai đo | **5 series biểu đồ** vào `contrast:check` |

Nền móng, đo mỗi lần push: **184 cặp tương phản** × 2 theme · **1122 lượt đo
viền** trên 12 route × 2 theme × 3 trạng thái · **72 lượt đo hộp nội dung**
trên 6 route × 12 bề rộng · 1305 control cho focus bàn phím · luật ba khối
dark **86/86** (thêm token hover mới, hai khối vẫn trùng khít từng giá trị).
Chặt nhất 3.05:1, **0 chỗ dưới ngưỡng**.

## Cần người quyết, không phải việc của em

| | |
|---|---|
| **`mobile:check` đỏ, 198 lỗi** | Cuộn trang ở tablet 768 và breakpoint 820. Đã chứng minh có từ trước tuần này (chạy lại trên commit gốc ra đúng 198 phát hiện giống hệt từng loại). Cần quyết hành vi mong muốn ở 768px |
| **13 mục board** | Hai bên đều hợp lý — danh sách ở `cham-board-08nov.md` mục 3 |
| **Zebra** | Nêu ở mục 9 |
| **Bậc âm 112px ở 1180** | Không phải lỗi mà là đánh đổi, và nó là của chị chứ không phải của em: rail có nhãn đáng 192px hay không. Số đo ở mục 12.2 |

## Hai chỗ đã kiểm và cố ý **không** sửa

| | |
|---|---|
| `.k-button.vy-funnel` | `:hover` và `[aria-expanded]` có đặt `border-color`, nhưng selector của kendo-bridge ở (0,3,1) thắng (0,3,0) — **cả hai là khai báo chết**. Sửa đúng là bỏ đi hoặc nâng selector, và việc đó thuộc về một lượt dọn bridge riêng |
| `boundary-soft` / `boundary-light` | Vẫn dưới 3:1 và **là có chủ ý**: chúng vẽ viền banner, khung verdict, một đường kẻ ngang — thứ 1.4.11 không quản. Hai control trỏ sai vào chúng đã được sửa ở 8.3 |

Và một chỗ **vẫn ngoài tầm phép kiểm**, nói rõ để không ai tưởng là đã phủ:
trạng thái mang bởi thuộc tính — `[aria-pressed]`, `[aria-checked]`,
`[data-on]` — thì app phải thật sự ở trạng thái đó mới đo được. Ba ca trong
mục 8.3 tìm ra bằng cách đọc bảng màu, chứ không phải bằng quét.

---

# 11. 9/11 — hai pattern cuối, và 5 lỗi nữa

Dashboard và search là hai cái còn thiếu ở 6.4. Viết xong thì đủ **8/8**. Và
đúng như sáu trang trước, viết tới đâu lòi ra tới đó — lần này **6 chỗ**. Ba
trong sáu là cùng một kiểu: **chữ trên màn hình nói khác thứ code thật sự
làm** — 11.3, 11.4 và 11.6.

## 11.1 Series "In-Progress" của biểu đồ Home — vô hình ở **cả hai** theme

Nặng nhất trong năm cái, và đáng kể vì nó là **một bản sửa sống lâu hơn con
bọ nó sửa**.

Token trạng thái đi theo cặp: `-fg` là mực, `-bg` là nền chip nhạt. Một mảng
biểu đồ không phải chip — nó là hình khối không có chữ, và việc của nó là nổi
trên tấm card.

| | Chuyện gì xảy ra |
|---|---|
| **Lần đầu** | Biểu đồ đọc `-fg` cho cả năm. Hồi đó `--vy-status-progress-fg` là `#ffffff`, nên **In-Progress vẽ trắng trên card trắng** — 39 record, vô hình, ô chú giải bên cạnh cũng trắng |
| **Bản sửa** | Riêng series đó chuyển sang `--vy-status-progress-bg` |
| **Rồi token đổi** | Bộ cặp được dựng lại theo đúng quy ước trên. `progress-fg` thành `#155e75` — nửa đậm, giống bốn anh em — nhưng cái ngoại lệ kia **không ai soi lại** |
| **Đo ngày 9/11** | `#cffafe` trên card light = **1.12:1**. Ở dark là `#1e3838` trên `#161c25` = **1.37:1** |

Cùng một series, cùng một kiểu vô hình, nguyên nhân ngược nhau. Nó sống sót
chín tuần vì **chưa phép đo nào chạm tới một mảng màu không mang chữ** — mọi
cặp trong `contrast:check` đều là *mực trên nền* hoặc *viền trên nền*.

> Một bản sửa sống lâu hơn con bọ còn tệ hơn không sửa: nó đọc ra như một
> quyết định, nên không ai mở lại.

Giờ cả năm series đều đọc `-fg` của chính nó — hết ngoại lệ để mà mốc.

| Series trên card | Light | Dark |
|---|---|---|
| New | 7.32 | 8.17 |
| In-Progress | **7.27** *(trước 1.12)* | **11.92** *(trước 1.37)* |
| Quoted | 7.09 | 9.66 |
| Completed | 7.68 | 12.62 |
| Cancelled | 10.78 | **3.03** — cặp chặt nhất của cả bảng màu |

## 11.2 Và một đường kẻ, vì hai mảng màu không tạo thành một ranh giới

Tương phản là tỉ số **độ sáng**, mà năm series này phân biệt nhau bằng **sắc
độ** ở độ sáng gần bằng nhau: cặp gần nhất là 1.01:1 ở light và 1.06:1 ở dark.
Đó là cố ý — một series tối hơn hẳn sẽ lấn cả cột — nhưng nó nghĩa là in đen
trắng, hoặc với người không phân biệt được màu, ba trạng thái dính thành một
khối.

Nên giữa các mảng giờ có **đường kẻ 1px màu card**: ranh giới được **vẽ ra**,
chứ không suy ra từ hai mảng màu hai bên.

> Và không đủ nếu chỉ kiểm bốn cặp liền kề. Một tháng không có In-Progress thì
> New chạm Quoted; một tháng chỉ có hai trạng thái thì cặp nào cũng có thể kề
> nhau. **Cả mười cặp đều xảy ra được**, nên lời giải phải là cấu trúc, không
> phải chỉnh màu.

## 11.3 Ba lời hứa của ô tìm kiếm mà nó không giữ

Cả ba đều đang chạy trên bản build sáng 9/11.

| | Đo được |
|---|---|
| Chú thích trong code nói ⌘K khớp cả **tên cũ**, để người quen hệ thống live tìm được màn đã đổi tên | **0 trên 47** đích sống có `wasCalled`. **0** có `hint`. Hai trường đó chỉ được điền trên `proposedNav` — bản đề xuất đổi tên mà D1 đã từ chối. Tức **2 trong 4 tầng chấm điểm không bao giờ chạy** |
| Placeholder của chính nó mời *thử "What If", "RMA", hoặc **"so-mst"*** | `so-mst` ra **rỗng**. Nó là một route, mà palette không đọc route |
| Nút trên header ghi *Search screens, **orders, parts**…* | Chỉ mục là 47 đích điều hướng. Không order, không part — **A3 luật 5** bị chính ô tìm kiếm phá |

> **Một tầng không khớp gì trông y hệt một câu truy vấn không có đáp án.** Đó
> là lý do nó sống lâu: mọi lần thất bại đều không phân biệt được với việc
> người dùng gõ một thứ không tồn tại.

**Route chính là cái tên thứ ba, và nó là cái còn thiếu.** Finding C1 ghi: nav
gọi *Project Requirements*, tiêu đề trình duyệt gọi *Request for Quotation*,
route gọi `quotation`. C1 từ chối chọn một cái, vì chọn là làm hỏng hai cái
còn lại mà người dùng đang tìm theo. Lời giải không phải là chọn — mà là
**khớp cả ba**. Nên route thành một tầng chấm điểm, nằm dưới hai tầng tiêu đề.

| Gõ | Trước | Sau |
|---|---|---|
| `so-mst` | — | Sales Orders |
| `quotation` | — | Project Requirements |
| `part-mst` · `cust-mst` · `po-mst` · `mpn` | — | đúng màn của route đó |

`rfq` vẫn ra rỗng, và **cố ý để vậy**: không nhãn nav nào, không route nào
chứa nó. Cho nó khớp nghĩa là bịa ra cái tên thứ tư cho 47 màn hình — đúng
thứ C1 đã từ chối.

## 11.4 Giấu một cột thì giấu luôn bản ghi

Ô tìm kiếm trên lưới đọc các cột **đang hiện**, nên bỏ tick một cột trong hộp
chọn cột sẽ âm thầm thu hẹp thứ danh sách tìm được. Đo trên Manufacturers:

| | Số dòng cho `SEMCO` |
|---|---|
| Còn cột Aliases | **1 / 18** — Samsung Electro-Mechanics, chỉ khớp ở Aliases |
| Giấu cột Aliases | **0**, dưới dòng chữ *Nothing matches "SEMCO"* |

Bản ghi vẫn nằm trong danh sách. Ô tìm kiếm vẫn đề *Search name, website or
alias*.

Hai lý do đây là sai chứ không phải đánh đổi: trang `list-screen.md` định
nghĩa **Columns** là *cột nào bạn chọn hiện cho riêng mình*, lưu trong trình
duyệt — **một tuỳ chọn hiển thị không được đổi câu trả lời**; và
`searchPlaceholder` là chuỗi cố định người viết trang đặt, nó không thể biết
bạn vừa giấu gì.

Giờ tìm kiếm đọc toàn bộ bộ cột. **Cái giá, nói rõ:** một dòng có thể khớp ở
cột bạn không nhìn thấy. Đó là tổn hại nhỏ hơn — một kết quả phải mở rộng
bảng mới giải thích được, so với một bản ghi mà danh sách bảo là không tồn tại.

## 11.5 Một mép trái

Trong ⌘K, tên nhóm đứng đầu dòng, trong một cột đặt bề rộng **tối thiểu**
66px — tức một cột không canh được gì. Đo thật: tám nhãn nhóm live chạy từ
88px tới 199px, nên tám tiêu đề đang hiện bắt đầu ở **năm vị trí x khác
nhau**, còn *Home* — nhóm lá, không có nhãn — bắt đầu ở vị trí thứ sáu.

Nới cột lên 199px là lối ra kia, và nó tiêu một phần ba của palette 620px cho
một thứ bổ nghĩa chỉ cần cho tám dòng có nhãn trùng (*Configuration* xuất hiện
5 lần trong menu này, *Reporting* 3 lần). Nên nhóm chuyển xuống cuối dòng và
canh phải. Tám tiêu đề giờ bắt đầu ở **một** vị trí x.

> Một danh sách người ta quét bằng tên chỉ có một việc cho mắt: chạy dọc một
> mép trái.

## 11.6 Và một câu chữ đi sau phép tính của chính nó

Ô đếm **Waiting on a document** ghi kèm câu giải thích *"a checklist task is
**started** but its document has not arrived"*. Đó là mô tả của phép thử
`status === 'In progress' && !documentName` — phép thử mà chính chú thích
ngay dưới nó gọi là **mâu thuẫn** và đã thay từ lâu, vì nó dựa vào một status
mà guideline không còn suy ra như vậy nữa.

Phép thử đã sửa. Câu chữ ở lại. Nên ô đếm tự giải thích bằng một luật nó không
còn chạy — **và câu đó còn đi theo link**: bấm vào ô là danh sách Quotations
hiện đúng câu ấy trên banner.

> Một predicate ở một chỗ mới chỉ là nửa luật. **Chữ nằm cạnh nó phải đi
> cùng nó.**

Giờ là *"A checklist task with no document attached yet"* — đúng thứ nó đếm.

## 11.7 Phép kiểm học thêm một loại pixel

`contrast:check` **174 → 184 cặp**: năm mảng màu biểu đồ, hai theme, so với
tấm card. Và nó tự chứng minh là bắt được — cắm lại đúng token cũ thì báo

```
light  chart series In-Progress on the card   #cffafe on #ffffff   1.12:1  needs 3
dark   chart series In-Progress on the card   #1e3838 on #161c25   1.37:1  needs 3
```

Hai con số đó trùng khít với số đo trên trình duyệt ở 11.1 — hai phép đo độc
lập, cùng một kết quả.

Tiện thể `scripts/capture-components.mjs` nhận thêm `COMP_SHOTS_ONLY`: bộ ảnh
lên 15 hình, thêm một hình mà phải chụp lại cả 30 thì diff không đọc được nữa.

---

# 12. 9/11 — lưới layout, chỗ trống cuối cùng

Trong bảng đối chiếu với các design system khác, **lưới layout** là mục duy
nhất còn để trống, và nó xếp cuối với lập luận: lưới layout là thứ ít dùng
nhất, cho tới khi các màn hình thôi đổi hình dạng.

Viết ra thì thấy **ngược lại**. Hai chuyện dưới đây đã đúng từ ngày dựng shell
và không chuyện nào lộ ra nếu không đo đủ mọi bề rộng. Em quét **6 route × 12
bề rộng** để tìm chúng.

## 12.1 Bốn dạng trang, và chỉ hai dạng khai báo bề rộng

| Dạng | Dùng ở | Trần (trước 9/11) |
|---|---|---|
| `.vy-page--record` | Bản ghi RFQ | 1180px |
| `.vy-page--doc` | Design system, Audit, Sitemap | 1180px |
| `.vy-page--grid` | Mọi màn danh sách | **không có** |
| `.vy-page` | Home, My Queues, Placeholder | **không có** |

Với màn **danh sách** thì không có trần là đúng, và đó là quyết định chứ không
phải bỏ sót — em đo để chắc:

| | Bề rộng tự nhiên của lưới |
|---|---|
| Project Requirements, view mặc định, 12 cột | **1806px** |
| Part Master, bật hết cột, 16 cột | **2106px** |

Bất kỳ trần nào thấp hơn hai số đó đều tạo cuộn ngang trên một cửa sổ vốn đủ
rộng để khỏi phải cuộn. (Và bề rộng cột theo role của B5.3 thì đúng ở mọi
width: đo ở 2560px bảng vẫn là 1806px, mỗi cột vẫn đúng số đã khai.)

Nhưng với **Home và My Queues** thì không có trần là một lỗi đo được. Ở
viewport 1920, hộp nội dung rộng **1624px**:

| Ở 1920 | Trước | Sau |
|---|---|---|
| Cột biểu đồ | 127px, chứa thanh 28px — **99px khoảng không giữa hai thanh** | 85px, cách 57px |
| Ô hàng đợi | **397px** cho một con số một chữ và hai dòng ngắn | 274px |

Mười hai thanh rải trên 1600px thôi đọc ra thành một chuỗi — nhìn thành mười
hai cái que rời nhau, và so tháng Một với tháng Tám là một quãng mắt rất dài.

Sửa: **luật gốc `.vy-page` giờ có trần, dạng danh sách khai báo xin miễn.** Phép
đảo mới là điểm chính — trước đây một trang không khai báo gì sẽ nhận bề rộng
**vô hạn**; giờ nó nhận bề rộng dè dặt, và muốn tràn thì phải nói ra.

Ba trần đều là 1180px, nên hai token cũ giờ trỏ về một token duy nhất
`--vy-page-max` — một giá trị, thay vì ba giá trị tình cờ bằng nhau.

## 12.2 Rộng cửa sổ ra thì trang **hẹp lại** — 112px, ở đúng 1180

Đây là cái đáng nói nhất, và nó không phải lỗi em gây ra tuần này.

> Ở **1180px** hộp nội dung rộng **1096px**. Ở **1280px** nó còn **984px**.
> Cửa sổ rộng thêm 100px và trang **mất 112px**.

Vượt 1180 đi lên, rail từ 56 → 248 và máng từ 14 → 24: **lấy đi 212, cho lại
100**. Hệ quả thật: một laptop **1366** — loại máy mọi người ở đây dùng — hiện
**1070px** nội dung, trong khi một terminal **1180** được **1096px**.

Em **không sửa**, và nói rõ vì sao: đây là đánh đổi mà quyết định D1 và buổi
review 25/8 đã mua — rail có nhãn là phần định hướng. Breakpoint xoá hẳn được
bậc này là **1392px** chứ không phải 1180, và dời tới đó nghĩa là mọi màn 1366
mất rail có nhãn. Người dùng vẫn có lối thoát đáng **192px**: nút thu gọn.

Cái em làm là **khai báo** nó, và `grid:check` sẽ đỏ nếu xuất hiện một bậc âm
thứ hai ở bất kỳ đâu. Nếu chị thấy đánh đổi này nên đổi chiều thì đó là quyết
định của chị, không phải của em — em đã để nó ở bảng "cần người quyết".

## 12.3 Không có lưới 12 cột, và đó là chủ đích

Một số cột cố định giả định hộp nội dung có bề rộng ổn định. Hộp này đổi
**640px** trong dải đo được, **mất 112px** ở một bậc, và bị chặn trần ở bốn
trên năm dạng.

Thực tế trong code đã có đúng **một** lối viết, dùng **16 lần**:

```css
grid-template-columns: repeat(auto-fit, minmax(var(--some-min), 1fr));
```

16 lưới đó mang **11 giá trị tối thiểu** khác nhau (140px → 320px) và **6
máng cột** khác nhau. Em **không** ép chúng về một thang, vì giá trị tối thiểu
là "bề rộng mà dưới đó nội dung thôi đọc được" — tính chất của **nội dung**,
không phải của lưới. Một ô đếm và một nhóm trường form không cùng ngưỡng đó.

Thay vì ép, B8 công bố **danh mục cả 16 dòng**: lưới mới chọn một dòng trong
đó, hoặc tự đo và ghi lý do — đúng luật 4 của A3, luật mà B7 đang áp cho
breakpoint. Thứ phép kiểm bắt buộc là giá trị tối thiểu phải là **token**, để
giá trị thứ 17 không lọt vào dưới dạng số trần.

## 12.4 `grid:check`

**72 lượt đo**, 6 route × 12 bề rộng, nằm trong `check:visual` mỗi lần push.
Nó kiểm bốn thứ: đẳng thức *rail + máng + nội dung = viewport*; dạng có trần
không vượt trần; **dạng danh sách vẫn không có trần** (để quyết định ở 12.1
không thoái hoá thành chỗ bỏ sót); và **đúng một bậc âm**.

Mỗi lần chạy gài sẵn hai lỗi — một cái trần ép lên dạng danh sách, một giá trị
tối thiểu viết trần — và hỏng nếu bỏ sót cái nào. Gỡ thử luật trần ra thì nó
báo đúng bốn dòng:

```
/ @1440          base shape is 1192px wide, over the 1180px cap
/ @1920          base shape is 1672px wide, over the 1180px cap
/my-queues @1440 base shape is 1192px wide, over the 1180px cap
/my-queues @1920 base shape is 1672px wide, over the 1180px cap
```

Nó **cố ý không** kiểm tràn ngang của trang: `mobile:check` giữ việc đó cùng
198 phát hiện tablet còn mở, nhân đôi vào đây chỉ làm phép kiểm này đỏ vì một
lý do chẳng liên quan tới lưới.
