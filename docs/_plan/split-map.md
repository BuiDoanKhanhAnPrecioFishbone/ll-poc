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
| B1.8 | foundations/color | 501-526 | → H2 *How dark mode is wired* — **giữ nguyên chữ của mình**, chỉ bỏ mã `B1.8`. Atlassian gọi mục này là *Designing in dark mode*, nhưng mình copy **cấu trúc** của họ, không copy câu chữ |
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

## Hợp đồng một trang — chốt 14/11/2026

Đo từ `scripts/md-doc.mjs` chứ không phải quy ước em tự đặt:

1. **Mở đầu bằng `# <Title>`**, đúng chữ `title` trong `ia.config.mjs`.
   `md-doc.mjs` lấy dòng `# ` đầu tiên làm tiêu đề trang.
2. **Không front-matter.** `md-doc.mjs` đọc thẳng từng dòng, không hiểu YAML —
   front-matter sẽ **hiện ra thành chữ** trên trang. Metadata (phase, basis,
   group, origin) nằm ở `ia.config.mjs`, không lặp lại trong file md.
3. **Bỏ mã `B6`, `C2`, `B1.4`… khỏi tiêu đề.** Đó là số thứ tự của một tài
   liệu đọc tuyến tính, không phải tên của thứ gì. Bản đồ chuyển đổi là chính
   bảng trên.
4. `###` trong tài liệu cũ → `##` khi tiểu mục đó lên thành mục của trang.
5. **Đường ảnh thêm `../` theo độ sâu**: trang ở `docs/foundations/` dùng
   `../assets/...`; trang ở `docs/foundations/color/` dùng `../../assets/...`.
6. **Bỏ dấu `---` phân cách** ở cuối mỗi mục. Nó là vách giữa hai mục của một
   file dài; một trang không cần vách.
7. **Không tự viết mục lục.** Generator dựng từ các `##`.
8. Link `.md` để nguyên dạng `.md` — `md-doc.mjs` tự đổi sang `.html` khi file
   đích có thật trên đĩa.
9. **Link `.md` tương đối cũng phải thêm `../` theo độ sâu**, y như ảnh ở luật 5.
   Trang ở `foundations/` trỏ về `docs/` bằng `../ten-file.md`; trang ở
   `foundations/color/` bằng `../../ten-file.md`. Bỏ sót luật này thì link chết
   mà không ai thấy, vì `md-doc.mjs` im lặng để nguyên link khi file không có.

## Phán đoán đã dùng trong Phase 1 — ghi lại để kiểm được

Ba chỗ cả phase phải quyết thay vì chép. Không chỗ nào thêm một thông tin mới.

| Chỗ | Nguồn | Đã làm gì |
|---|---|---|
| Câu mở `B4` dòng 665 | *"Four radii, three shadows. Elevation is for things that float…"* | Cắt làm hai nửa của chính nó: `radius.md` lấy **"Four radii."**, `elevation.md` lấy **"Three shadows."** cộng phần còn lại nguyên văn. Đây là **dòng duy nhất** trong 1.625 dòng bị viết lại |
| Ảnh `elevation.png` | specimen tiêu đề *Elevation*, năm bậc shadow | Chỉ nằm ở `elevation.md`. Agent 1B ban đầu đặt ở cả hai trang và **tự báo là không chắc**; mở ảnh ra xem thì nó vẽ shadow, không vẽ bo góc. `radius.md` do đó không có ảnh — và đúng là không có specimen radius nào trong `docs/assets/` |
| Bảng `B4` dòng 674-681 | một bảng, hai chủ đề | Tách: 4 dòng `--vy-radius-*` sang radius, 3 dòng `--vy-shadow-*` + `--vy-overlay-scrim` sang elevation. Header 672-673 chép nguyên văn vào cả hai |
| Bảng `B1.6` dòng 407-426 | status và chart xen kẽ | Tách: dòng 425 (`--vy-chart-cancelled`) sang data-viz, dòng 426 (`--vy-status-slot-w`) ở lại status. Header 407-408 chép nguyên văn vào cả hai |
| Đường dẫn `.md` tương đối | 7 link trong 3 trang | Hợp đồng chỉ nói độ sâu cho **ảnh**, quên nói cho **link** — thiếu sót của bản hợp đồng. Agent 1A báo đúng chỗ này thay vì tự sửa. Đã thêm `../` / `../../` cho cả 7, và bổ sung luật 9 |
| Neo nội bộ `#b7--responsive` | 15 link trong 6 trang | **Hệ quả không ai lường của luật 3.** Bỏ mã khỏi heading làm chết mọi neo trỏ theo mã. Agent Phase 2 phát hiện khi dựng site. Đã trỏ lại cả 15 — và **đổi cả chữ của link**: `[B1.5]` trỏ tới một mã không còn tồn tại ở đâu nữa, nên nó thành `[Brand and danger]`, tức là dùng chính chữ của heading đích. Đây là lần duy nhất chữ trong câu bị đổi, và danh sách đủ 15 chỗ nằm trong git |
| `color` ở đâu | manifest ghi `color/index.md` | Brief của Phase 1 lại ghi `color.md` — **mâu thuẫn do người viết brief**. Theo manifest: file đã chuyển sang `docs/foundations/color/index.md`, ảnh đổi sang `../../` |

## Luật cho agent Phase 1

1. **Chỉ đọc khoảng dòng của mình.** `sed -n '249,330p' docs/design-system.md`.
   Không `cat` cả file. Không đọc khoảng dòng của agent khác.
2. **Không sửa một chữ nào** trong nội dung. Được sửa đúng năm thứ: cấp heading
   (luật 4) · đường ảnh (luật 5) · dấu phân cách (luật 6) · tiêu đề trang
   (luật 1, 3) · và mở đầu của những trang dùng chung ngữ cảnh `(…)`.
3. **Số đo và ngày là bất khả xâm phạm.** Mọi giá trị trong tài liệu này đều
   kèm nguồn đo (luật A3.4). Làm tròn, bỏ ngày, hay "viết cho gọn" là làm hỏng
   thứ giá trị nhất của bộ tài liệu.
4. **KHÔNG sửa `docs/design-system.md`.** Nó vẫn là bản đang chạy cho tới khi
   `ds-handover.mjs` sinh lại được nó (Phase 2). Agent khác đang đọc nó cùng lúc.
5. **Chỉ ghi vào file của mình.** Không chạm `ia.config.mjs`, `docs/_plan/*`,
   `scripts/*`, `README.md` — mỗi file có một chủ, và chủ của những file đó
   không phải agent Phase 1.

## Cách tự chứng minh không mất chữ

Chạy cho **từng trang** trước khi báo xong. Khác biệt duy nhất được phép là
dấu `---` phân cách (luật 6):

```bash
A=249; B=330; PAGE=docs/foundations/border.md; DEPTH=..
sed -n "${A},${B}p" docs/design-system.md \
  | sed "s|](assets/|](${DEPTH}/assets/|g" \
  | sed 's/^### /## /' > /tmp/src.md
sed -n '2,$p' "$PAGE" > /tmp/page.md
diff /tmp/src.md /tmp/page.md     # chỉ được còn dòng --- và dòng trống của nó
```

Rồi:

```bash
node scripts/md-doc.mjs <trang mới> /tmp/x.html   # phải chạy không lỗi
npm run ia:check                                   # phải OK
```

Nếu `md-doc.mjs` báo lỗi: **báo lại, đừng sửa nó.** File đó đang có chủ khác
(agent Phase 2) làm việc trên nó cùng lúc.

## Trang mẫu vàng

`docs/foundations/motion.md` — đã làm xong 14/11, từ B6 (784-823). Mở ra xem
trước khi bắt đầu: nó thể hiện cả tám luật của hợp đồng, và `diff` của nó chỉ
còn đúng hai dòng `---` và dòng trống.

## Báo về

Đường dẫn các file đã tạo + 5 dòng tóm tắt + kết quả `diff` của từng trang.
**Không paste nội dung trang.**
