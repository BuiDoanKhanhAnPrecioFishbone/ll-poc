# Dựng lại design system theo đúng cấu trúc Atlassian — plan build

**14/11/2026** · Soát `atlassian.design` trực tiếp trên trang hôm nay (không qua blog),
đối chiếu với bộ đang có trong repo, rồi chia việc.

Tài liệu này tiếp nối `docs/chuan-design-system.md` (8/11). Bản đó so cách *viết*;
bản này so cách *tổ chức* và nói rõ phải dựng những gì.

---

## 0 · Ba câu kết luận trước

1. **Nội dung đã gần đủ, cấu trúc thì chưa có.** Phần Foundation + 28 trang
   component + 8 trang pattern đã viết rồi. Thiếu là **IA** (cây điều hướng),
   **tab mỗi component**, **search / deep-link**, và **tầng meta** (get started ·
   release phases · tools · what's new).
2. **Không viết lại nội dung. Chỉ tách và sinh ra.** Một file `.md` cho một
   component, trong đó đánh dấu ranh giới tab; generator sinh 4 trang HTML. Nhờ
   vậy 45 file nguồn → **177 trang** như Atlassian mà không nhân đôi chữ nào
   (32 component × 4 tab + 49 trang còn lại, đếm từ `ia.config.mjs`).
3. **Bản handover một-file phải đảo chiều.** Hôm nay `design-system.md` là nguồn
   và các trang là nhánh. Sau phase 2 thì ngược lại: các trang là nguồn, bản
   một-file (và PDF, và bản tiếng Việt) được **sinh ra** bằng cách nối lại theo
   thứ tự IA. Đây là thứ chặn vĩnh viễn bệnh lệch giữa hai bản.

---

## 1 · Cấu trúc Atlassian — soát trực tiếp 14/11/2026

### 1.1 Điều hướng gốc

Thanh trên: `Design system` · `News` · Search · Theme toggle.
Sidebar của mục Design system, đúng thứ tự:

```
Get started · Foundations · Components · Rovo UI · Tools · AMP Patterns ·
Release phases · Contact us
```

`Rovo UI` là phần riêng cho sản phẩm AI của họ — không có cái tương ứng ở mình.
`AMP Patterns` chính là **chỗ của tầng Pattern** trong IA của họ; 8 pattern của
mình ngồi đúng vào ô này.

### 1.2 Cây đầy đủ

```
/                              trang chủ
/get-started                   overview
  /design · /develop · /with-ai · /content-design
  /about-atlassian-design-system
  /design/figma-libraries
/foundations                   overview — 14 mục
  /tokens                      + /design-tokens /use-tokens-in-code
                                 /use-tokens-in-design /migrate-to-tokens
  /accessibility
  /content                     + /voice-tone /language-and-grammar
                                 /inclusive-writing /date-time /designing-messages
  /spacing · /grid · /typography · /motion · /iconography
  /illustrations · /logos · /elevation · /border · /radius
  /color                       + /color-palette /accents
                                 /data-visualization-color /color-picker-swatches
/components                    overview — 92 mục, chia 13 nhóm
  /<component>                 4 tab: /examples /code /usage /changelog
  /<component>/<biến thể>      họ component, vd button → icon-button,
                                 link-button, split-button, filter-button,
                                 button-group, button-legacy
  /primitives/*                14 mục
  /tokens/all-tokens           bảng tra toàn bộ token
/tools                         Figma library · app provider · eslint ·
                               storybook addon · stylelint · UI Styling Standard
/release-phases                3 phase phát hành + 2 phase khai tử
/whats-new · /news · /license · /contact-us
```

### 1.3 Mười ba nhóm component (tên y nguyên của họ)

`Forms and input` · `Images and icons` · `Labels` · `Layout and structure` ·
`Loading` · `Messaging` · `Navigation` · `Overlays and layering` ·
`Primitives` · `Status indicators` · `Text and data display` · `Libraries` ·
`Tooling` — cộng các mục `Deprecated` nằm cuối.

### 1.4 Vòng đời — nguyên văn

| Phase | Nghĩa |
|---|---|
| **Early Access** | Thực nghiệm. Breaking change ngay ở minor, version 0.x. Không support. |
| **Beta** | Dùng được, đã support, stable từ 1.0+. Breaking change chỉ ở major. |
| **General Availability** | Ổn định hoàn toàn. Không bị xoá mà không có thông báo khai tử. |
| **Intent to Deprecate** (nhãn *Caution*) | Đang bị xem xét khai tử. Chưa dùng thì dùng cái khác. |
| **Deprecated** | Hết support, sẽ bị xoá, đã có đường thay thế. |

Nhãn hiện **ngay trong sidebar** cạnh tên component (`Beta`, `Caution`,
`Deprecated`). Mình có 29 component, **không cái nào có nhãn** — đây là lỗ dễ
thấy nhất khi bàn giao.

### 1.5 Khung một trang component

| Tab | Nội dung |
|---|---|
| **Examples** | Default example mở đầu, rồi Appearance (mỗi variant một mục) · States · Spacing · Full width · với icon · Truncation · Custom |
| **Code** | Installation · Props (một mục cho **mỗi** prop) |
| **Usage** | Usage · Parts · Accessibility · Best practices · Content guidelines · Data Center apps · Related |
| **Changelog** | Lịch sử theo version |

Mọi trang có: breadcrumb · sidebar trái · mục lục **Contents** bên phải ·
đáy trang *"Was this page helpful? Yes / No"*.

---

## 2 · Bộ hiện tại — đếm thật

| | Có gì | Ở đâu |
|---|---|---|
| Token | **238 token** `--vy-*` (khai 414 lần: `:root` + hai khối dark), 3 tầng (ramp → role → component) | `src/theme/tokens.css` |
| Foundation | **Part B + C** của một file 1.625 dòng: colour · type · spacing · shape/elevation · sizing · motion · responsive · layout · icon · illustration | `docs/design-system.md` |
| Component | **28 trang** `.md`, template cố định 13 mục | `docs/components/*.md` |
| Pattern | **8 trang** | `docs/patterns/*.md` |
| Component code | **29** trong `src/ui` + 4 helper | `src/ui/*.tsx` |
| Ảnh | 16 component × 2 theme, 7 illustration, ~25 ảnh foundation | `docs/assets/**` |
| Specimen sống | **1 trang** 13 mục, trong app | `src/pages/DesignSystem.tsx` |
| Generator | md → HTML đứng một mình, có mục lục riêng | `scripts/md-doc.mjs` (284 dòng) |
| Kiểm tự động | **8 phép**: contrast · render · touch · mobile · focus · hover · border · grid. `contrast:check` chạy trong **pre-push hook** (184 cặp token, không cần trình duyệt, ~10s cùng lint và build); **bảy phép kiểm trình duyệt** — render · touch · mobile · focus · hover · border · grid — chạy trong **CI** (`.github/workflows/check.yml`, ~10 phút) | `scripts/*.mjs` · `.githooks/pre-push` · `.github/workflows/check.yml` |
| Bản tiếng Việt | 1 file 1.604 dòng, dịch song song bằng tay | `docs/design-system-vi.md` |

Những thứ **hơn** Atlassian và phải giữ nguyên: mọi con số đều có nguồn đo và
ngày · quyết định ghi kèm lý do · tám phép kiểm tự động mỗi lần push (theo khảo
sát trong `chuan-design-system.md` §3.1, không hệ thống nào trong bốn hệ đã đọc
công bố bộ kiểm như vậy) · luật "specimen thắng tài liệu khi hai bên mâu thuẫn".

---

## 3 · Còn thiếu gì — bảng đối chiếu từng mục

| # | Mục của Atlassian | Mình đang có | Thiếu | Mức |
|---|---|---|---|---|
| 1 | **IA / điều hướng** | mỗi `.md` ra một HTML rời, mục lục trong trang | cây nav, breadcrumb, sidebar, trang overview mỗi tầng, deep-link | **nặng nhất** |
| 2 | **Search** | không | index JSON + ô tìm kiếm | nặng |
| 3 | **4 tab mỗi component** | 1 trang 13 mục | tách examples / code / usage / changelog | nặng |
| 4 | **14 trang foundation rời** | gộp trong Part B+C một file | tách 14 trang + 12 trang con | nặng |
| 5 | **Release phases + nhãn vòng đời** | không có nhãn nào | trang policy + nhãn cho 29 component | nặng (rẻ nhưng lộ rõ) |
| 6 | **Nhóm component** | danh sách phẳng A→Z | 13 nhóm, họ component (Button family) | vừa |
| 7 | **Bảng all-tokens** | 238 token chỉ nằm trong CSS | trang tra cứu, lọc theo nhóm/theme | vừa |
| 8 | **Token là nguồn thật** | CSS là nguồn | JSON theo chuẩn DTCG → sinh ra CSS | vừa |
| 9 | **Foundation: content design** | mục D6, một bảng | 5 trang con: voice & tone · ngữ pháp · viết bao trùm · ngày giờ · thiết kế thông báo | vừa |
| 10 | **Foundation: border · radius · logos · data-viz colour** | rải trong B4/B1; 5 token `--vy-chart-*` có mặt trong B1.6 nhưng chỉ như một phần của status vocabulary | 4 trang — data-viz cần hướng dẫn thật: loại biểu đồ, bảng màu phân loại vs tuần tự, trục, legend | vừa |
| 11 | **Get started** | README | 4 trang: cho designer · cho dev · content · about | vừa |
| 12 | **Tools** | 8 script kiểm, md-doc, capture | 1 trang liệt kê thật (xem §8 — không bắt chước danh sách của họ) | nhẹ |
| 13 | **What's new** | `docs/worklog.md`, `what-changed.md` | 1 trang feed, sinh từ git | nhẹ |
| 14 | **Primitives** | không có tầng này | **cố ý không làm** — xem §8 | — |
| 15 | **Cặp `on-` cho mọi surface** | có cho brand/danger, thiếu cho surface-selected/strong/sunken | hoàn thiện cặp → `contrast:check` chặt hơn | vừa |
| 16 | **Pattern** | 8 trang (họ gọi *AMP Patterns*) | chỉ cần đặt vào IA | nhẹ |

---

## 4 · Kiến trúc đề xuất — bốn quyết định

### 4.1 Một file md cho một component, tab đánh dấu bằng directive

Không tách 28 file thành 112 file. Trong mỗi file component, chèn mốc:

```md
<!-- ds:tab examples -->
## Variants
...
<!-- ds:tab code -->
## API
<!-- ds:tab usage -->
## When to use
<!-- ds:tab changelog -->
## Recent changes
```

13 mục của template hiện tại map sang 4 tab **không cần viết lại gì**:

| Mục đang có | → tab |
|---|---|
| Anatomy · Variants · Sizes · States | `examples` |
| API | `code` |
| When to use · When not to use · Content · Behaviour · Accessibility · Gotcha · Related | `usage` |
| Recent changes | `changelog` |

Tiết kiệm: 28 lần sửa file nhẹ, thay vì 112 lần tạo file.

### 4.2 Một manifest là nguồn duy nhất của IA

`docs/ia.config.mjs` khai: cây nav · nhóm · nhãn phase · tab của từng loại trang ·
redirect từ URL cũ · thứ tự nối cho bản handover. **Mọi agent đọc file này
thay vì tự đoán cấu trúc** — đây là chỗ tiết kiệm token lớn nhất của cả plan.

### 4.3 `md-doc.mjs` lớn lên thành `ds-site.mjs`, không thêm framework

Không Docusaurus, không Astro. Lý do: repo là Vite SPA, `md-doc.mjs` đã sinh
HTML đạt chuẩn và đang nuôi đường PDF bàn giao; thêm framework là mất đường đó
và thêm một build nữa. `ds-site.mjs` thêm: sidebar từ manifest · breadcrumb ·
tab bar · Contents bên phải · search index JSON · nhãn phase · "trang này có
giúp được không".

### 4.4 Một nguồn, ba đầu ra

```
docs/**/*.md  ──┬─→ docs/site/**         site tra cứu, có nav + search
                ├─→ docs/design-system.html + .pdf   bản handover một-file
                └─→ docs/assets/**        ảnh, do capture-*.mjs sinh
```

Bản một-file **thôi làm nguồn**, chuyển thành đầu ra. Script `ds-handover.mjs`
nối theo thứ tự trong manifest.

---

## 5 · Plan build — 10 phase

Ký hiệu: **model** · *agent* · ⏱ ước lượng (giờ người, kể cả review).

### Phase 0 · Manifest + luật tách — **Opus**, tự làm, ⏱ 1.5h — ✅ **XONG 14/11/2026**

> Đã có: `docs/ia.config.mjs` (**81 trang · 32 component · 9 pattern · 13 nhóm**,
> mỗi nhãn phase kèm **số đo** và mỗi component kèm **gốc thư viện đã được kiểm
> lại với code**) · `docs/_plan/split-map.md` (47 dòng, phủ **1.622/1.625** dòng
> tài liệu cũ — 3 dòng còn lại là dòng trống, đã in ra để chứng minh) ·
> `docs/_plan/deviations.md` (12 chỗ lệch, mã **DEV-NN**, mỗi chỗ kèm cách đảo
> lại) · `scripts/ia-check.mjs` (**11** phép kiểm) nối vào `npm run check:fast`.
> Phase 4 còn rất ít: nhãn vòng đời và 13 nhóm đã gán xong tại đây.

#### Soát lại Phase 0 — những gì bản đầu viết sai

Bản đầu của Phase 0 có **chín chỗ tự suy diễn**. Soát lại ngày 14/11 và sửa hết.
Ghi ra vì luật A3.5, và vì đây đúng là loại lỗi cả plan này phải tránh.

| Chỗ | Bản đầu viết | Thực tế trong code | Sửa |
|---|---|---|---|
| `checkbox` | "KendoReact Checkbox qua bridge" | **native `<input type="checkbox">` mang class `k-checkbox`**, cố ý *không* dùng component React của Kendo vì nó không diễn đạt được hai thứ app cần | ghi đúng, kèm lý do từ `checkbox.md` |
| `radio-group` | "Radix RadioGroup" | **native `<input type="radio">` mang class `k-radio`**. *Từng* là Radix, chuyển 15/10/2026. README vẫn còn ghi Radix — README đã cũ | ghi đúng, kèm ngày chuyển |
| `data-grid`, `mini-table`, `button`, `loader`, `select`, `tabs`, `dialog`, `file-drop` | không nói gốc | **KendoReact** (grid · buttons · indicators · dropdowns→ComboBox · layout→TabStrip · dialogs · upload) | thêm trường `origin`, 15 cái, **có phép kiểm đối chiếu** |
| `Overlays.tsx` | xếp vào "hạ tầng portal/layering" | nó **chứa 5 component thật**: Dialog · Tabs · Checkbox · RadioGroup · Select | bỏ khỏi libraries, map theo từng export |
| "8 phép kiểm chạy mỗi push" | ở 9 chỗ trong 3 file | `pre-push` **cố ý chỉ chạy** lint + css (gồm contrast, 184 cặp) + build ≈10s; **bảy phép trình duyệt chạy trong CI** ≈10 phút | nói rõ chỗ chạy ở cả 9 chỗ |
| `mini-table` | "component được dùng nhiều thứ hai" | thứ tư: Button 33 · Toast 23 · Field 14 · MiniTable 13 | bỏ xếp hạng, ghi số file |
| `spacing` | "một thang gốc 4px" | **13 token, bắt đầu 2px, bước 2px ở đáy** | ghi đúng, có đối chiếu doc ↔ code |
| `list-screen` | "chạy chín màn" | **6 file** import `useListScreen` | ghi đúng |
| `illustrations` | "bộ rocket còn đang bị xét (D10)" | D10 là **showcase screens**, không phải illustration | bỏ, thay bằng: không phép kiểm nào soi ảnh |
| `screen-states` | "`render:check` đi qua cả bốn state" | `render:check` so **màu trùng giữa các state dữ liệu**, không đi qua bốn state màn hình | bỏ claim |
| `logos` | "là bản nháp" (đoán từ tên file) | đúng, và nay có nguồn: `logo-ideas.md` 26/9 *"Nothing here is built yet"* + quyết định D3 | ghi kèm nguồn |

**Bỏ bớt, vì không cần tới:** `redirects` (docs HTML là file cục bộ, `vercel.json`
chỉ rewrite SPA — không có URL nào để vỡ) · `specimenOrigin` (hard-code cổng, mà
hai file launch.json ghi hai cổng khác nhau; việc của Phase 8) · `PHASES[].tone`
(em tự ánh xạ nhãn release phase sang từ vựng status của **dữ liệu** — đúng thứ
design system này cấm) · `handoverOrder` 24 dòng (lặp lại thứ tự nav → còn
`handoverFirst` 2 dòng, phần sau suy ra từ nav) · hai node `page-header` và
`side-navigation` (em tự nghĩ ra, không có gì đo được) · **nhãn phase cho
pattern** (Atlassian chỉ gắn phase cho *component và foundation*).

**Phép kiểm mới, và nó được thử bằng cách cố tình viết sai.** `ia:check` nay đối
chiếu mọi `origin` với code: package phải có trong `package.json` **và** được
import trong file, còn tên control (`ComboBox`, `TabStrip`…) phải xuất hiện
**trong thân đúng export đó**. Lần đầu em chỉ kiểm ở tầm file — và nó **cho qua**
claim sai "checkbox là Kendo ComboBox", vì `Overlays.tsx` có import
`kendo-react-dropdowns` thật cho Select. Thắt lại ở tầm export thì cả hai claim
sai ban đầu đều bị bắt. In bảng gốc: `node scripts/ia-check.mjs --origins`.

Làm trước mọi thứ, không song song được với gì.
- `docs/ia.config.mjs` — toàn bộ cây §1.2 đã map sang tên của mình
- `docs/_plan/split-map.md` — **bảng dòng-cho-dòng**: mỗi trang foundation đích
  ↔ khoảng dòng trong `design-system.md` (vd `B1.1 → 148–186`). Nhờ bảng này
  agent phase 1 chỉ `sed -n '148,186p'` chứ **không đọc file 1.625 dòng**
- `docs/_plan/deviations.md` — sổ ghi chỗ cố ý khác Atlassian (§8)
- Phân nhãn phase cho 29 component (xem Phase 4)

**Verify:** manifest parse được, mọi slug là duy nhất, mọi khoảng dòng cộng lại
phủ hết Part B+C không chồng lấn (script 20 dòng).

### Phase 1 · Tách foundation — **Sonnet** ×3 *agent song song* — ✅ **XONG 14/11/2026**

> **17 trang** (không phải 14: cộng 4 trang con của Color và `tokens/index`).
> Phép kiểm "mọi dòng không trống phải có đích đến" chạy trên cả 17: **sạch**.
> Toàn bộ sổ thay đổi trong 1.625 dòng là **16 dòng** — 1 câu mở đầu cố ý cắt
> làm hai (radius/elevation) và 15 neo nội bộ phải trỏ lại. Tất cả ghi trong
> bảng phán đoán của `split-map.md`.
- Agent 1A: colour (+4 con) · typography · spacing · grid · border · radius
- Agent 1B: elevation · motion · iconography · illustrations · logos ·
  accessibility · tokens overview
- Mỗi agent nhận: split-map, một trang mẫu đã làm sẵn, và **chỉ các khoảng dòng
  của mình**
- Chữ giữ nguyên tuyệt đối. Chỉ được sửa: tiêu đề cấp (h3→h2 khi lên thành
  trang), link nội bộ, thêm front-matter

**Verify:** `diff` số từ trước/sau phải khớp ±2% · link checker không có link
chết · không trang nào trống.
Vì sao Sonnet mà không Haiku: phải viết lại cross-reference và quyết định mục
nào thuộc trang nào ở ranh giới (vd z-index thuộc elevation hay layout).

### Phase 2 · `ds-site.mjs` — **Sonnet**, 1 *agent* — ✅ **XONG 14/11/2026**

> `npm run ds:site` → **81 trang**, 81 mục search, 7.871 link nội bộ, **0 chết**,
> 0 cảnh báo. `md-doc.mjs` nay export `renderMarkdown`, và bốn tài liệu cũ vẫn
> render **byte-identical** với bản đã commit — đường PDF bàn giao không xê dịch.
Spec đưa sẵn, không để agent tự thiết kế:
sidebar 3 cấp · breadcrumb · tab bar · Contents phải · phase badge · prev/next ·
search index (`title + h2 + path`, lọc client-side, không dep) · theme toggle
dùng đúng `--vy-*` · redirect map · in được (giữ đường PDF).

**Verify:** sinh toàn site, `render:check` sạch, mở 5 trang bất kỳ bằng
built-in browser, đếm link chết = 0.

### Phase 3 · 28 component → 4 tab — **Sonnet** 3 cái đầu, **Haiku** phần còn lại, ⏱ 3h
1. Sonnet làm `button`, `data-grid`, `toast` → ba bản mẫu vàng (3 loại khác nhau:
   control đơn, control phức, overlay)
2. Haiku ×4 *agent*, mỗi agent 6–7 component, brief = **3 bản mẫu + bảng map
   §4.1 + danh sách của mình**. Việc thuần cơ học: chèn 4 directive, không sửa chữ

**Verify:** script đếm — mỗi file có đúng 4 directive, thứ tự đúng, mọi h2 cũ
còn nguyên (so hash danh sách heading trước/sau).
Đây là chỗ Haiku an toàn, vì sai là script bắt được ngay, không cần model đọc lại.

### Phase 4 · Nhóm + nhãn vòng đời — **Haiku** đo, **Opus** quyết, ⏱ 1.5h
- Haiku: đếm mỗi component trong `src/ui` được import ở bao nhiêu file, xuất
  bảng. Thuần `grep`, 1 agent, rẻ
- Opus/An quyết nhãn theo luật: dùng ≥5 màn + API chưa đổi 30 ngày →
  `General Availability`; đang dùng nhưng còn đổi → `Beta`; mới hoặc chỉ 1 chỗ
  dùng → `Early Access`; helper → không lên trang
- Map 29 component vào 13 nhóm của Atlassian, và dựng **họ Button**
  (`button` → `icon-button` · `split-button`? · `button-group`?) — nếu code chưa
  có thì **không bịa trang**, ghi vào sổ deviation
- Viết `docs/release-phases.md` theo đúng 5 phase §1.4, có luật chuyển phase

**Verify:** mọi component trong `src/ui` hoặc có trang hoặc có một dòng trong
danh sách helper. Không cái nào không được nhắc.

### Phase 5 · Token: bảng tra cứu và bản xuất máy đọc được — ✅ **XONG 15/11/2026**

> **Plan này sai chiều, và chính file nói ra điều đó.** Bản đầu viết: JSON
> thành nguồn, sinh ngược ra `tokens.css`, chứng minh byte-identical. Đo trước
> khi làm: `tokens.css` có **1.055 dòng**, trong đó **544 dòng (51%) là văn
> xuôi** — độ lệch hue tính ra bằng số, tỉ lệ contrast kèm ngày đo, mã quyết
> định, cái đã thử và đã bỏ. Chỉ **414 dòng (39%)** là khai báo.
>
> Làm theo plan nghĩa là nhét 544 dòng lý lẽ đó vào chuỗi JSON, nơi không đọc
> được cũng không sửa được. Phép kiểm sẽ xanh trong khi **nửa giá trị nhất của
> file thì hỏng**. Nên đảo chiều: **CSS vẫn là nguồn, JSON là bản xuất.**
>
> Thay vào đó kiểm bằng **vòng tròn**: mỗi khai báo được dựng lại từ mô hình đã
> parse rồi so với đúng dòng nó sinh ra — **414/414 khớp từng ký tự**, kể cả
> khoảng trắng căn lề và comment cuối dòng. Cùng một đảm bảo plan muốn, áp vào
> phần máy đọc thay vì phần người đọc.
>
> Đã có: `scripts/tokens-build.mjs` · `docs/tokens/voyager.tokens.json` (chuẩn
> W3C DTCG draft) · trang `/foundations/tokens/all-tokens` (238 token, 66 nhóm,
> cả hai theme). Và **nó tìm ra một lỗi đếm của chính em**: "414 token" ghi
> trong manifest và plan là **số dòng khai báo**, không phải số token — thật ra
> là **238 token khai 414 lần**, vì mỗi cái được khai ở `:root` và ở **hai**
> khối dark.

### Phase 5b · Cặp `on-` cho mọi surface — **Sonnet**, ⏱ 1.5h — *tuỳ chọn, nên làm*
Thêm `--vy-surface-selected-on`, `-strong-on`, `-sunken-on`. Rồi `contrast:check`
chuyển từ "thử mọi tổ hợp" sang "kiểm đúng cặp đã khai" — chặt hơn, nhanh hơn.
Lý do đầy đủ đã viết ở `chuan-design-system.md` §2.3.

### Phase 6 · Foundation còn thiếu — **Sonnet** nháp, **An** sửa giọng, ⏱ 4h
`content/` 5 trang con · `logos` · `data-visualization-color` (5 token `--vy-chart-*`
đã có và đã nằm trong `contrast:check`; thiếu là hướng dẫn dùng) · `border` · `radius`.
Nháp phải lấy chất liệu từ repo (`docs/modal-patterns.md`, `motion-loading.md`,
`ui-standard-review-16oct.md`), **không được viết chung chung**. Giọng là của An
→ phải có một lượt sửa người.

### Phase 7 · Tầng meta — **Haiku** list, **Sonnet** policy, ⏱ 2h
`get-started/` 4 trang (design · develop · content-design · about) ·
`tools.md` (liệt kê **đúng cái mình có**: tám phép kiểm và chỗ chạy của từng phép, md-doc, capture,
with-server, kendo bridge) · `whats-new.md` sinh từ `git log` + `worklog.md`.

### Phase 8 · Examples sống + ảnh — **Sonnet**, ⏱ 3h
Route `/specimen/:component` trong SPA, render ví dụ thật đã cô lập. Tab
*Examples* nhúng iframe route đó → được **ví dụ sống như Atlassian**, không chỉ
ảnh. `capture-components.mjs` trỏ sang chính route đó, nên ảnh cho PDF và ví dụ
sống **cùng một nguồn**. Chạy capture **một lần duy nhất ở phase này**, không
chạy lại ở mỗi phase.

### Phase 9 · Bản tiếng Việt — ⏱ tuỳ quyết định ở §9
Chưa làm cho tới khi An chốt. Đề xuất: **không** dịch song song 177 trang.
Site tiếng Anh + bản handover PDF tiếng Việt sinh từ `ds-handover.mjs` (đường
đã có sẵn, `doc:ds-vi`).

### Phase 10 · QA + CI — **Haiku**, ⏱ 1.5h
`ds:check` = link chết · slug trùng · trang mồ côi (có trong manifest mà không
có md, và ngược lại) · directive tab đủ 4 · search index phủ hết trang ·
`tokens-build` ra CSS khớp. Nối vào `npm run check:fast`.

**Tổng ⏱ ≈ 29–32h người**, trong đó Opus ~3h, Sonnet ~20h, Haiku ~6h.

---

## 6 · Phân công agent — bảng tra

| Phase | Việc | Model | Số agent | Vì sao model đó |
|---|---|---|---|---|
| 0 | Manifest, split-map, deviation, nhãn phase | **Opus** | 0 (tự làm) | Quyết định kiến trúc, cả plan copy từ đây |
| 1 | Tách 14 foundation | Sonnet | 2 song song | Phải viết lại cross-ref ở ranh giới |
| 2 | `ds-site.mjs` | Sonnet | 1 | Code, spec đã đóng |
| 3 | Tab cho 3 component mẫu | Sonnet | 1 | Đặt chuẩn cho Haiku copy |
| 3 | Tab cho 25 component còn lại | **Haiku** | 4 | Cơ học, script verify được |
| 4 | Đếm usage | **Haiku** | 1 | `grep` thuần |
| 4 | Quyết nhãn + nhóm | **Opus** | 0 | Cần biết cái nào thật sự ổn định |
| 5 | Chép 414 token sang JSON | **Haiku** | 1 | `diff` byte-identical chứng minh đúng |
| 5 | Script build token + bảng | Sonnet | 1 | Code |
| 5b | Cặp `on-` | Sonnet | 1 | Sửa CSS + check, có rủi ro contrast |
| 6 | Viết foundation thiếu | Sonnet | 2 | Viết, cần lấy chất liệu từ repo |
| 7 | Get started / tools / what's new | Haiku + Sonnet | 2 | List thì Haiku, policy thì Sonnet |
| 8 | Specimen route + capture | Sonnet | 1 | React + script |
| 10 | `ds:check` | Haiku | 1 | Script kiểm, mẫu đã có 8 cái |

**Brief cho mỗi agent gồm đúng 4 thứ:** (1) đường dẫn `ia.config.mjs` ·
(2) khoảng dòng / danh sách file *của riêng nó* · (3) một bản mẫu vàng đã làm ·
(4) lệnh verify nó phải tự chạy trước khi báo xong. Báo về **chỉ** đường dẫn
file đã sửa + 5 dòng tóm tắt — **không paste nội dung ngược lại**.

---

## 7 · Tiết kiệm token — 8 chiến thuật cụ thể

1. **Một md một component, tab bằng directive** → 28 lần sửa nhẹ thay vì 112 file mới.
2. **Split-map có khoảng dòng** → agent `sed -n 'X,Yp'`, không agent nào đọc hết
   file 1.625 dòng. Riêng điều này tiết kiệm ~25k token/agent × 2 agent.
3. **Bản mẫu vàng** → Sonnet làm 1, Haiku copy 25. Chênh giá model ~10×.
4. **Verify bằng script, không bằng model.** `diff` byte-identical cho token ·
   đếm directive · hash danh sách heading · link checker. Model không bao giờ
   đọc lại để kiểm.
5. **Agent báo đường dẫn, không báo nội dung.**
6. **Chia lô 6–7 component/agent** → context mỗi agent chỉ chứa mẫu + lô của nó.
7. **Chụp ảnh một lần ở phase 8**, không chụp lại mỗi phase (capture là việc đắt
   nhất về thời gian máy).
8. **Không thêm framework** → không agent nào phải học dep mới.

Chống lặp việc: phase 1 và 3 **không được chạy cùng lúc** nếu cùng chạm
`design-system.md`. Thứ tự bắt buộc: `0 → (1 ∥ 2) → 3 → 4 → (5 ∥ 6 ∥ 7) → 8 → 10`.

---

## 8 · Sổ chỗ cố ý khác Atlassian

Ghi ra trước thì là quyết định; để người khác tìm ra thì là lỗ hổng.

| Mục của họ | Mình làm gì | Lý do |
|---|---|---|
| **Primitives** (14 mục: Box, Inline, Stack, xcss…) | **Không làm** | Đó là API layout của Atlaskit. Mình đứng trên KendoReact + CSS token, không có tầng này. Bịa ra là tài liệu cho code không tồn tại |
| **Tools**: eslint plugin, stylelint plugin, storybook addon, Figma library | Liệt kê **đúng cái mình có**: tám phép kiểm (một trong hook, bảy trong CI) · `md-doc` · `capture-*` · `kendo-bridge` | Luật A3.5: nói thật về cái chưa làm. `css:consistency` đã làm gần đúng việc của stylelint plugin |
| **Rovo UI** | Không có | Không có sản phẩm AI tương ứng |
| **Data Center apps** (mục trong mỗi tab Usage) | Không có | Không có bản Data Center |
| Họ component sâu (Button có 7 biến thể) | Chỉ dựng họ khi **code đã có** | Không có `SplitButton` thì không có trang `split-button` |
| **AMP Patterns** | Giữ tên **Patterns**, 8 trang hiện có | AMP là riêng của marketplace họ |
| Đổi tên token sang `color.background.*` | **Không** trong plan này | 238 token nằm rải trong 8.000 dòng CSS. Đổi tên là rủi ro mà không đổi được gì cho người đọc. Nếu muốn, đó là phase riêng, có codemod + tám phép kiểm làm lưới an toàn |

Ngược lại, **4 thứ mình giữ mà họ không có**, và phải nêu ở trang `about`:
mọi con số có nguồn đo và ngày · quyết định ghi kèm lý do · tám phép kiểm chạy
mỗi push · luật specimen thắng tài liệu.

---

## 9 · Ba quyết định cần An/chị Huyền chốt trước khi build

1. **Bản tiếng Việt.** Dịch song song 177 trang (đắt, dễ lệch) hay site tiếng
   Anh + handover PDF tiếng Việt sinh tự động? *Đề xuất: cái thứ hai.*
2. **Site ở đâu.** `docs/site/` tĩnh mở bằng file (đi kèm bàn giao, không cần
   hạ tầng) hay deploy lên Vercel cạnh mockup? *Đề xuất: sinh tĩnh trước, deploy
   sau — Vercel đã cấu hình sẵn nên thêm sau rất rẻ.*
3. **Đổi tên token.** Giữ `--vy-*` (đề xuất) hay đổi sang kiểu dotted của
   Atlassian trong một phase riêng có codemod?

Phase 0 và 1 **không phụ thuộc** ba quyết định này, nên có thể bắt đầu ngay.
