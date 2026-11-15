# Sổ lệch — chỗ nào cố ý khác Atlassian, và vì sao

**Phase 0 · 14/11/2026.** Mục tiêu là *đúng cấu trúc* Atlassian, không phải
*giả vờ là* Atlassian. Mười ba chỗ dưới đây là quyết định, không phải chỗ bỏ
quên. Ghi ra trước thì là quyết định; để người khác tìm ra thì là lỗ hổng.

Cột **Đảo lại** cho biết phải sửa gì nếu An hoặc chị Huyền muốn làm theo đúng
họ — gần hết là một dòng trong `docs/ia.config.mjs`.

Mã ở đây là **DEV-NN**, cố ý khác **D1–D12** là mã *quyết định thiết kế* của
chính dự án (D1 sitemap, D3 logo, D7 depth, D8 radius, D10 showcase, D12
English only). Hai hệ mã khác nhau, đừng lẫn.

**Gốc thư viện của từng component** không viết tay ở đây — in ra bằng
`node scripts/ia-check.mjs --origins`, và `ia:check` đối chiếu từng claim với
import thật trong code, nên nó không lệch được.

---

## DEV-01 · Không dựng tầng Primitives

**Họ:** 14 trang — `Box` `Inline` `Stack` `Flex` `Grid` `Bleed` `xcss`
`Responsive` `Text` `MetricText` `Pressable` `Anchor` `Focusable` + overview.

**Mình:** không có tầng này.

**Vì sao.** Primitives là **API layout của Atlaskit** — thư viện React của
riêng họ. Mình đứng trên KendoReact cộng CSS token, không có `Box` hay `xcss`
nào tồn tại trong `src/`. Dựng 14 trang cho code không có thật là viết tài
liệu cho thứ không ai gọi được. Việc mà Primitives làm, bên mình do
`src/theme/*.css` và token làm, và đã có trang Foundations nói về nó.

**Đảo lại:** không đảo được bằng tài liệu. Phải viết một tầng primitive thật
trong `src/ui` trước.

---

## DEV-02 · Thêm foundation thứ 15: `Sizing`

**Họ:** đúng 14 foundation. Chiều cao control nằm trong tab *Examples* của từng
component (mục *Spacing*); row density và column role thì thuộc trang `Table`.

**Mình:** thêm `/foundations/sizing` — chiều cao control · row density ·
**column role** · bề rộng dialog và shell (Part B5 của tài liệu cũ).

**Vì sao.** Atlassian đẩy được mấy thứ này xuống component vì bảng không phải
sản phẩm của họ. Voyager IQ **là** sản phẩm bảng: mười sáu bề rộng tối thiểu
theo *role* của cột là một luật cắt ngang toàn hệ thống, `grid:check` và
`touch:check` đo nó trong CI, và nó được dẫn chiếu từ `renderCell`,
`column-model`, `DataGrid`, `MiniTable`. Nhét vào một trang component là chôn
luật cắt ngang xuống dưới một chi tiết.

**Đảo lại:** bỏ node `sizing` trong `ia.config.mjs`, chuyển dòng `B5` trong
split map sang `foundations/spacing` (B5.1, B5.4) và `components/data-grid`
(B5.2, B5.3).

---

## DEV-03 · Tầng pattern giữ tên `Patterns`

**Họ:** mục sidebar tên **AMP Patterns** (AMP = chương trình marketplace
partner của họ).

**Mình:** `Patterns`, 8 trang đã có + `screen-states` tách ra từ D5.

**Vì sao.** AMP là tên riêng của một chương trình của họ, không phải tên một
tầng IA. Ô trong cây thì y nguyên, chỉ cái nhãn là của mình.

**Đảo lại:** sửa `title` của node `patterns`.

---

## DEV-04 · Trang `Tools` liệt kê đúng cái mình có

**Họ:** Figma library · App provider · ESLint plugin · Storybook addon ·
Stylelint plugin · UI Styling Standard.

**Mình:** tám phép kiểm · `md-doc.mjs` · `capture-*.mjs` · `with-server.mjs` ·
`kendo-bridge.css` · `tokens-build.mjs` (Phase 5). Nói cho đúng chỗ chạy:
`contrast:check` chạy trong **pre-push hook** (184 cặp token, không cần trình duyệt, ~10s cùng lint và build); **bảy phép kiểm trình duyệt** — render · touch · mobile · focus · hover · border · grid — chạy trong **CI** (`.github/workflows/check.yml`, ~10 phút). Hook tự nói lý do: chờ 10 phút mỗi lần push là cái hook người ta tắt sau một tuần.

**Vì sao.** Luật A3.5: nói thật về cái chưa làm. Mình **không có** Figma
library, không có eslint plugin. Nhưng `css:consistency` và `css:orphans` đang
làm gần đúng việc của stylelint plugin. Và theo khảo sát trong
`chuan-design-system.md` §3.1 (đọc trực tiếp trang của họ hôm 8/11), không hệ
thống nào trong bốn hệ đã đọc công bố bộ kiểm tự động như vậy — nên trang này
là chỗ mình **mạnh hơn**, miễn là không bịa.

**Đảo lại:** không cần đảo. Khi nào có Figma library thật thì thêm node.

---

## DEV-05 · Không có `Rovo UI`

Phần riêng cho sản phẩm AI của họ. Mình không có sản phẩm tương ứng.
**Đảo lại:** không áp dụng.

---

## DEV-06 · Không có mục `Data Center apps` trong tab Usage

Mỗi tab *Usage* của họ có một mục cho bản Data Center. Voyager IQ chỉ có một
bản triển khai. **Đảo lại:** thêm vào template tab `usage` khi nào có bản thứ hai.

---

## DEV-07 · Họ component chỉ dựng khi code đã có

**Họ:** `Button` có 7 thành viên (`icon-button` `link-button` `link-icon-button`
`split-button` `filter-button` `button-group` `button-legacy`).

**Mình:** `button` đứng một mình — `src/ui/Button.tsx` không có 7 biến thể đó.
Ngược lại mình dựng **họ `data-grid`** với 5 thành viên (`column-chooser`
`filter-toolbar` `view-picker` `view-setting` `pager`), vì năm cái đó tồn tại
chỉ để phục vụ grid và slug nên nói ra điều đó.

**Vì sao.** Không có `SplitButton` thì không có trang `split-button`. Cấu trúc
phải mô tả code đang có, không phải code của người khác.

**Đảo lại:** thêm `children` vào node `button` khi nào code có thành viên mới.

---

## DEV-08 · Không đổi tên 238 token sang kiểu dotted

**Họ:** `color.background.accent.blue.subtler`.

**Mình:** giữ `--vy-surface-selected`, `--vy-status-done-bg`…

**Vì sao.** 238 token (khai 414 lần) nằm rải trong ~8.000 dòng CSS cộng `kendo-bridge`. Đổi
tên là rủi ro lớn mà **người đọc tài liệu không được thêm gì** — ba tầng
ramp → role → component của mình đã khớp đúng cách ngành làm (đã đối chiếu
W3C DTCG và Material 3 ở `chuan-design-system.md` §2.3). Phase 5 làm JSON
thành nguồn thật nhưng **sinh ra đúng tên CSS cũ**, và chứng minh bằng `diff`
byte-identical.

**Đảo lại:** một phase riêng, có codemod + tám phép kiểm làm lưới an toàn. Không
gộp vào việc này.

---

## DEV-09 · Bản tiếng Việt là handover sinh ra, không phải site song song

**Họ:** một thứ tiếng.

**Mình:** site tiếng Anh + bản bàn giao một-file tiếng Việt, **sinh** bằng
`ds-handover.mjs` theo `handoverOrder`.

**Vì sao.** Dịch song song ~160 trang là nhân đôi chi phí và bảo đảm lệch —
`design-system-vi.md` là một file riêng 1.604 dòng, có đường build riêng (`doc:ds-vi`), nên mọi sửa ở bản Anh phải lặp lại ở đó.
Đường PDF tiếng Việt (`doc:ds-vi`) đã chạy, nên giữ đúng đường đó.

**Đảo lại:** `site.locales = ['en','vi']` trong `ia.config.mjs` — nhưng đọc §9
của `plan-atlassian-ia.md` trước, đây là quyết định chi phí, không phải kỹ thuật.

---

## DEV-10 · `Status vocabulary` là trang con thứ 5 của Color

**Họ:** Color có 4 trang con — `color-palette` `accents`
`data-visualization-color` `color-picker-swatches`.

**Mình:** thêm `status-vocabulary`.

**Vì sao.** Tám status là **từ vựng cắt ngang** của sản phẩm: dùng bởi `Badge`,
`Priority`, row tone, và năm fill chart. Luật *"một status là một chữ và một
màu, không bao giờ chỉ là màu"* là luật a11y, không phải một bảng màu. Để chìm
trong trang Color thì mất.

**Đảo lại:** gộp node đó vào `foundations/color` như một H2.

---

## DEV-11 · Không có `color-picker-swatches`

Trang đó dành cho tính năng **người dùng cuối tự chọn màu** (label trong Jira).
Voyager IQ không có tính năng đó. **Đảo lại:** thêm node khi nào có.

---

## DEV-12 · Một trang `What's new`, không có `News`

**Họ:** `/whats-new` (changelog sản phẩm) **và** `/news` (blog, talk, team story).

**Mình:** chỉ `/whats-new`, **sinh từ `git log` + `docs/worklog.md`**.

**Vì sao.** `/news` là marketing của một tổ chức. Changelog thì có thật và sinh
được tự động.

**Đảo lại:** thêm node `news` trỏ vào một file md viết tay.

---

## Ngược lại — bốn thứ mình có mà họ không có

Phải nêu ở trang `get-started/about`, vì đây là chỗ bộ này **hơn** mặt bằng
chung, và nói trước thì mạnh hơn để người khác tìm ra.

| | Mình | Carbon · Atlassian · Polaris · GOV.UK |
|---|---|---|
| 1 | **Mọi con số kèm nguồn đo và ngày** (luật A3.4) | nêu ngưỡng WCAG, không công bố giá trị đo từng cặp token |
| 2 | **Quyết định ghi kèm lý do và ngày** ở cấp token | GOV.UK có ở cấp component, không ở cấp token |
| 3 | **Tám phép kiểm tự động** — contrast trong pre-push hook, bảy phép trình duyệt trong CI, mỗi lần push | không hệ thống nào trong bốn hệ đã đọc công bố (khảo sát `chuan-design-system.md` §3.1) |
| 4 | **Specimen thắng tài liệu khi hai bên mâu thuẫn** (F3) | không có luật tương đương |

Thêm một thứ Phase 0 này tạo ra mà họ cũng không có: **nhãn phase của mọi
component đều kèm bằng chứng** (`basis` trong `ia.config.mjs`) — số màn đang
dùng, ngày sửa cuối, câu hỏi còn treo. Atlassian gắn nhãn `Beta` mà không nói
vì sao.
