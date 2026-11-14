# Split map — `design-system.md` → các trang của site

**Phase 0 · 14/11/2026.** Bảng này tồn tại để **không agent nào phải đọc hết
1.625 dòng** của `docs/design-system.md`. Mỗi dòng cho một khoảng dòng và một
trang đích; agent chỉ `sed -n 'X,Yp' docs/design-system.md` phần của mình.

`npm run ia:check` kiểm bảng này: **mọi dòng không trống** trong tài liệu cũ
phải được đúng một dòng ở đây nhận. Mất chữ im lặng là không thể xảy ra.

## Cách đọc cột `lines`

| Dạng | Nghĩa |
|---|---|
| `148-186` | khoảng liền, thuộc độc quyền trang đích |
| `384-424,426` | nhiều khoảng rời — bảng gốc bị **xen kẽ**, phải tách theo đúng dòng |
| `(663-673)` | **ngữ cảnh dùng chung**: đọc, nhưng không thuộc riêng trang nào. Phải *viết lại* mở đầu cho từng trang, không copy hai lần |
| `—` ở cột đích | **cố ý không chuyển**. Lý do ở cột ghi chú |

Ba chỗ phải **tách bảng** (`TABLE SPLIT`) — đây là chỗ duy nhất trong Phase 1
cần phán đoán, phần còn lại là chuyển nguyên văn.

<!-- ia:split-map:begin -->

| id | → trang đích | lines | ghi chú |
|---|---|---|---|
| X0 | — | 1-38 | Tiêu đề và lời mở của tài liệu cũ. Không chuyển: site có trang chủ và trang `about` riêng |
| X1 | — | 39-81 | Mục lục viết tay. Không chuyển: nav sinh từ `ia.config.mjs` |
| PA | — | 82-83 | Header `Part A`. Cấu trúc, không phải nội dung |
| A1 | get-started/about | 84-109 | *What this is* — mở đầu trang About |
| A2 | foundations/tokens | 110-126 | *The three layers* — thành Tokens overview |
| A3 | get-started/develop | 127-143 | *Five rules before you build* — mở đầu trang For developers |
| PB | — | 144-145 | Header `Part B` |
| B1.0 | foundations/color | 146-147 | Câu mở của mục Colour |
| B1.1 | foundations/color/color-palette | 148-186 | Các ramp — tầng 1, không dùng trực tiếp trong component |
| B1.2 | foundations/color | 187-208 | → H2 *Surfaces* |
| B1.3 | foundations/color | 209-248 | → H2 *Text color* (sáu bậc) |
| B1.4 | foundations/border | 249-330 | *Lines* thành trọn trang Border. 82 dòng |
| B1.5 | foundations/color | 331-383 | → H2 *Brand and danger* |
| B1.6a | foundations/color/status-vocabulary | 384-424,426 | **TABLE SPLIT.** Giữ các dòng `--vy-status-*`. Dòng **426** (`--vy-status-slot-w`) ở lại đây — nó là bề rộng ô status, không phải chart |
| B1.6b | foundations/color/data-visualization-color | 425,428-440 | **TABLE SPLIT.** Dòng **425** (`--vy-chart-cancelled`) là giá trị chart-only duy nhất. 428-440 là ghi chú đã đo về năm fill chart |
| B1.7 | foundations/color/accents | 443-500 | Row tones và accent |
| B1.8 | foundations/color | 501-526 | → H2 *Designing in dark mode* — đúng tên heading Atlassian dùng |
| B2 | foundations/typography | 527-620 | Gồm *Casing* (từ 606) |
| B3 | foundations/spacing | 621-662 | Thang, và khe nào giữa hai control |
| B4a | foundations/radius | (663-673),674-677,682-683 | **TABLE SPLIT.** Bốn radius. 663-673 là mở đầu dùng chung với elevation — **viết lại**, đừng copy |
| B4b | foundations/elevation | (663-673),678-681 | **TABLE SPLIT.** Ba shadow + scrim |
| B4c | foundations/elevation | 684-705 | *Z-index* — một danh sách phẳng |
| B5 | foundations/sizing | 706-783 | Foundation thứ 15, lệch có ghi — xem DEV-02 |
| B6 | foundations/motion | 784-823 | Gồm loading clock và reduced motion |
| B7 | foundations/grid | 824-874 | Breakpoint thành H2 đầu của trang Grid, đúng cách Atlassian xếp |
| B8 | foundations/grid | 875-1044 | Thân trang Grid. 170 dòng |
| PC | — | 1045-1046 | Header `Part C` |
| C1 | foundations/iconography | 1047-1074 | |
| C2 | foundations/illustrations | 1075-1180 | Bảy asset, kèm cách sinh lại |
| D0 | components | 1181-1188 | Câu mở `Part D` |
| D0a | components | 1189-1240 | Bảng chỉ mục component. **Sinh lại từ `ia.config.mjs`**, không copy — bảng cũ sẽ lệch ngay |
| D0b | patterns | 1241-1259 | Bảng chỉ mục pattern. Sinh lại, như trên |
| D1 | merge-check → components/button.md | 1260-1291 | Đọc một lần, xác nhận không có gì riêng, ghi xác nhận vào §Merge-check, rồi bỏ |
| D2 | merge-check → components/field.md | 1292-1341 | như trên |
| D3 | merge-check → components/data-grid.md | 1342-1364 | như trên |
| D4 | merge-check → components/dialog.md | 1365-1377 | như trên |
| D5 | patterns/screen-states | 1378-1401 | *The four screen states* thành một pattern riêng |
| D6 | foundations/content | 1402-1415 | *Words* — một bảng, thành hạt nhân của foundation Content |
| PE | — | 1416-1417 | Header `Part E` |
| E1 | foundations/accessibility | 1418-1469 | |
| E2 | tools | 1470-1495 | KendoReact thành mục đầu của trang Tools |
| PF | — | 1496-1497 | Header `Part F` |
| F1 | get-started/about | 1498-1514 | File map |
| F2 | get-started/develop | 1515-1536 | *How to change something* |
| F3 | release-phases | 1537-1554 | Governance — lớn lên thành trang Release phases |
| F4 | get-started/about | 1555-1606 | *What a handover should contain* |
| F5 | get-started/about | 1607-1625 | Source index, và dòng cuối về ảnh |

<!-- ia:split-map:end -->

## Trang đích nhận chữ từ nhiều nguồn

Bốn trang được nối từ nhiều mảnh. Thứ tự nối là thứ tự trong bảng trên.

| Trang | Nhận từ | Việc thêm |
|---|---|---|
| `foundations/color` | B1.0 · B1.2 · B1.3 · B1.5 · B1.8 | Năm mảnh thành một trang. Heading cấp 3 → cấp 2 |
| `foundations/elevation` | B4b · B4c | Mở đầu viết lại (dùng chung với radius) |
| `foundations/grid` | B7 · B8 | Breakpoint lên trước, layout sau |
| `get-started/about` | A1 · F1 · F4 · F5 | Trang dài nhất của tầng meta |
| `get-started/develop` | A3 · F2 | |

## Merge-check — ghi kết quả vào đây

Phase 1 đọc D1–D4 một lần rồi điền bảng này. **Chưa điền thì chưa được bỏ.**

| id | Trang component tương ứng | Có gì riêng không? | Xử lý | Ngày |
|---|---|---|---|---|
| D1 | `components/button.md` | *chưa soát* | | |
| D2 | `components/field.md` | *chưa soát* | | |
| D3 | `components/data-grid.md` | *chưa soát* | | |
| D4 | `components/dialog.md` | *chưa soát* | | |

## Luật cho agent Phase 1

1. **Chỉ đọc khoảng dòng của mình.** `sed -n '249,330p' docs/design-system.md`.
   Không `cat` cả file.
2. **Không sửa một chữ nào** trong phần nội dung. Được sửa đúng bốn thứ:
   cấp heading (h3 → h2 khi một tiểu mục lên thành trang) · link nội bộ ·
   front-matter · mở đầu của những trang dùng chung ngữ cảnh `(…)`.
3. **Số đo và ngày là bất khả xâm phạm.** Mọi giá trị trong tài liệu này đều
   kèm nguồn đo (luật A3.4). Làm tròn hay bỏ ngày là làm hỏng thứ giá trị nhất
   của bộ tài liệu.
4. **Chạy verify trước khi báo xong:** `npm run ia:check`, rồi
   `node scripts/md-doc.mjs <trang mới> /tmp/x.html` phải chạy không lỗi.
5. **Báo về: đường dẫn file + 5 dòng tóm tắt.** Không paste nội dung.
