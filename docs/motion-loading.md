# Motion & loading — những gì cần để làm animation

25/10/2026. Trả lời đúng hai câu: *prototype đã có loading chưa* và *design
system cho animation gồm những gì*.

---

## 1. Đã có loading chưa — có, nhưng chỉ ở lưới danh sách

**Có:** 6 trên 15 route — Part Master, BoM List, MPN, Manufacturer, Packing
List, Quotations. Cả 6 dùng chung một thành phần, `GridSkeleton`, qua prop
`loading` của `DataGrid`. Queues có skeleton riêng (`.vy-queue--loading`).

**Chưa có:**

| Chỗ | Vì sao nó quan trọng |
|---|---|
| **Get Prices / Refresh Prices** | `getPrices()` trong `RunQuotationDialog.tsx:252` **chạy đồng bộ, không có state chờ nào**. Trên hệ thống thật đây là một request tới Nexar cho hàng trăm dòng BoM — chỗ người dùng chờ lâu nhất trong cả luồng, và prototype hiện không hiện gì |
| Home (dashboard) | các thẻ số xuất hiện tức thì |
| Quotation Detail (hồ sơ) | mở hồ sơ không có trạng thái chờ |
| Audit, Sitemap | phụ |
| `Suspense` của KendoCheck | chỉ một dòng chữ `Loading the Kendo check…` (`App.tsx:80`) |

Quy tắc đang theo (audit finding T5): **loading / empty / error là ba trạng
thái, không phải một.** Hệ thống live gộp hai cái đầu — lưới trống kèm chữ "No
records available" trong lúc spinner còn chạy.

---

## 2. Token chuyển động — toàn bộ, chỉ có 7 cái

Khai báo ở `src/theme/md3.css:72-79`.

```css
--vy-ease-standard:    cubic-bezier(.2, 0, 0, 1);   /* mặc định */
--vy-ease-emphasised:  cubic-bezier(.2, 0, 0, 1);
--vy-ease-decelerate:  cubic-bezier(0, 0, 0, 1);    /* vào màn */
--vy-ease-accelerate:  cubic-bezier(.3, 0, 1, 1);   /* ra khỏi màn */

--vy-dur-short:  100ms;   /* state: hover, focus */
--vy-dur-medium: 200ms;   /* component nhỏ xuất hiện */
--vy-dur-long:   300ms;   /* dialog, drawer */
```

**Khoảng trống:** không có token nào cho **thời lượng vòng lặp**. Con `1.4s` của
shimmer là số viết thẳng trong CSS. Nếu anh làm animation loading, đây là chỗ
nên thêm một token — ví dụ `--vy-dur-loop: 1400ms` — để shimmer, spinner và
progress indicator cùng nhịp.

---

## 3. Công thức skeleton hiện tại — nguyên văn

`src/theme/app.css:836-838`

```css
.vy-skeleton-cell {
  height: var(--vy-space-5);              /* 10px */
  border-radius: var(--vy-radius-sm);     /* 3px */
  background: linear-gradient(90deg,
    var(--vy-surface-sunken) 25%,
    var(--vy-surface-app)    50%,
    var(--vy-surface-sunken) 75%);
  background-size: 200% 100%;
  animation: vy-shimmer 1.4s ease-in-out infinite;
}
@keyframes vy-shimmer {
  from { background-position:  200% 0 }
  to   { background-position: -200% 0 }
}
```

Ô skeleton **không** đặt chiều rộng cố định — nó nhận `flex` theo `data-role`
của cột (`ident` 18%, `text` 1 1 22%, `code`/`number` 7%, `money` 9%, `date`
11%, `status` 9%), nên bóng giả có hình dáng của chính cái lưới sắp hiện ra và
trang không nhảy khi dữ liệu về. Nguyên tắc này nên giữ cho mọi skeleton mới.

---

## 4. Hai thứ sẽ làm anh mất thời gian nếu không biết trước

**(a) Dark mode gần như không thấy shimmer.** Gradient đi từ `surface-sunken`
tới `surface-app`:

| | từ | tới | lệch |
|---|---|---|---|
| Light | `#eceff3` | `#f5f7fa` | ~9/255 ≈ 3.5% |
| Dark | `#0b0e14` | `#0f131a` | ~4/255 ≈ **1.6%** |

Ở dark mode biên độ đó gần như là không có animation. Animation mới nên lấy
hiệu số theo **độ sáng tương đối**, hoặc dùng một token riêng cho đỉnh shimmer
thay vì vay hai token surface.

**(b) `prefers-reduced-motion` hiện đang ĐÓNG BĂNG skeleton, không phải tắt nó.**
`src/theme/app.css:822`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
```

`iteration-count: 1` làm shimmer chạy một vòng rồi dừng — ô skeleton đứng lại ở
một vị trí gradient bất kỳ và **không còn nói "đang tải"** nữa. Với người bật
reduce-motion, trạng thái chờ phải được nói bằng thứ khác: nhịp opacity rất
nhẹ, hoặc đơn giản là chữ. Chỗ này cần một ngoại lệ có chủ ý, không phải quét
sạch bằng `*`.

---

## 5. Màu, hình, nhịp — những token animation sẽ dùng tới

| Việc | Token | Light | Dark |
|---|---|---|---|
| Nền ô skeleton | `--vy-surface-sunken` | `#eceff3` | `#0b0e14` |
| Đỉnh shimmer | `--vy-surface-app` | `#f5f7fa` | `#0f131a` |
| Mặt thẻ / dialog | `--vy-surface` | `#ffffff` | `#161c25` |
| Viền giữa các dòng | `--vy-border-faint` | `#eceff3` | `#212936` |
| Màu nhấn (progress) | `--vy-brand` | `blue-600` | `blue-300` |
| Bán kính | `--vy-radius-sm` / `-md` | 3px / **4px (chuẩn nhà)** | như light |
| Chiều cao control | `--vy-control-row` / `-dense` / `-md` | 26 / 32 / 34px | như light |
| Chiều cao dòng lưới | `--vy-row-h-compact` / `-comfortable` / `-relaxed` | 28 / 40 / 48px (compact đo thực tế 30, cộng viền) | như light |

Mọi token khai báo ở `src/theme/tokens.css`; **không dùng mã màu trực tiếp** —
dark mode và yêu cầu "cho user tự chỉnh palette" của client đều dựa vào việc
màu được gọi theo tên.

---

## 6. Animation đã có trong hệ thống — để animation mới không lạc nhịp

| Keyframes | Dùng ở | Thời lượng |
|---|---|---|
| `vy-shimmer` | ô skeleton | 1.4s vòng lặp |
| `vy-fade` | nội dung tab | `--vy-dur-medium` |
| `vy-rise` | dialog vào | `--vy-dur-long` |
| `vy-toast-in` / `-out` | toast | `--vy-dur-medium` |
| `vy-mode-read` / `-edit` | đổi giữa đọc và sửa hồ sơ | `--vy-dur-medium` |

Tất cả đi lên/xuống theo trục Y và dùng `--vy-ease-standard`. Không có chuyển
động ngang nào ngoài shimmer, và trong *prototype của mình* không có gì xoay.
(~~Nếu thêm spinner thì nó là chuyển động xoay đầu tiên trong sản phẩm.~~ Sai —
xem mục 8: hệ thống live đã xoay bằng Kendo `Loader`.)

---

## 7. Xem trực tiếp

- `/design-system` — trang design system có trong prototype: màu theo ngữ
  nghĩa, ramp thô, bộ trạng thái, role của cột, nút, elevation, thang chữ.
  **Chưa có mục motion** — đó là mục anh sắp viết.
- `/engineering/part-mst` — nạp lại trang để thấy skeleton (giữ ~700ms, cố ý:
  dữ liệu là cục bộ nên nếu không giữ thì trạng thái loading không bao giờ
  thấy được — xem `useListScreen.ts:35`).

---

## 8. Hệ thống live đã có gì — đọc từ bundle, 25/10

Chuỗi trong `assets/lib-bundle-B_5Gimit.js` của `erp.linhlongengineering.com`.
Đây là tier 2 theo `precedence.md`: hành vi của hệ thống thật, trên cả phán
đoán của mình.

**Chị ấy đã có hai bộ chỉ báo loading, và mình đang không ship cái nào:**

| | Bằng chứng trong bundle |
|---|---|
| **KendoReact `Loader`** | `k-loader`, `k-loader-sm/md/lg`, `k-loader-primary/secondary/tertiary/info/success/warning/error/dark/light/inverse`, `k-loader-canvas`, và ba kiểu `type`: `pulsing` (2 đoạn) · `infinite-spinner` (3) · `converging-spinner` (4) |
| **Một `Skeleton` riêng** | `className: "skeleton relative overflow-hidden"` + `animate-wave before:absolute before:inset-0`, prop `animate` mặc định `true` |

**Và ba tầng state chờ trong store:**

| State | Nghĩa |
|---|---|
| `isLoading` trong auth | `LOGIN_REQUEST → isLoading: true`, `LOGIN_SUCCESS` / `LOGIN_FAILURE → false`, `MFA_REQUIRED`, `FORGOT_PASSWORD_REQUEST → true` |
| `apiLoading` + action `API_LOAD` + `setApiLoading()` | cờ loading toàn cục cho mọi request, tách khỏi auth |
| `LoadingProvider` / `useLoading` → `{ isLoading, setLoading }` | context bọc toàn app. Lần re-check 10/9 gặp `useNavigationLoading must be used within a NavigationLoadingProvider`; bundle hôm nay là `useLoading` / `LoadingProvider` — app đã rebuild và tên đổi, cơ chế thì vẫn đó |

Thành phần notification cũng đã nhận `{ items, isLoading, isError, showUnreadOnly }`
— **loading và error là hai prop riêng**, đúng quy tắc ba trạng thái.

`k-loading-mask` = **0 lần**: overlay loading dựng sẵn của Kendo Grid không
được dùng.

**Hệ quả cho mình.** Ghi chú ở mục 6 rằng "thêm spinner thì nó là chuyển động
xoay đầu tiên trong sản phẩm" là **sai** — sản phẩm thật đã xoay, bằng Kendo
`Loader`. Việc đúng là **thêm `@progress/kendo-react-indicators`** (mình đang
có 8 package Kendo, không có package này) rồi dùng `Loader` của Kendo, chứ
không tự viết spinner. Giống hệt lý do bậc `xs` hôm nay lấy của Kendo.

---

## 9. Chỗ nào nên có loading motion

Nguyên tắc trước danh sách: **mỗi chỉ báo trả lời một câu khác nhau.**

| Chỉ báo | Trả lời | Dùng khi |
|---|---|---|
| **Skeleton** | *"nó sẽ trông như thế nào"* | biết trước hình dáng: lưới, form hồ sơ, thẻ |
| **Spinner trong nút** (Kendo `Loader` `pulsing`, `sm`) | *"việc tôi vừa bấm đang chạy"* | một hành động, phần còn lại của trang vẫn dùng được |
| **Thanh progress mảnh dưới header** | *"trang đang đổi"* | đổi route, chưa biết sắp ra gì |
| **Overlay chặn cả màn** | *"đừng chạm gì lúc này"* | đăng nhập, boot app. Dùng tiết kiệm |

Và ngưỡng thời gian — thứ quyết định *có* hiện hay không:

| Thời gian | Hiện gì |
|---|---|
| < 150ms | **không gì cả.** Chỉ báo nhấp nháy làm app chậm đi trong cảm nhận |
| 150–400ms | khoá control, không spinner |
| 400ms – 1s | spinner / skeleton |
| > 1s | spinner **kèm chữ nói đang làm gì** |
| > 5s | tiến độ xác định nếu đếm được (*"đang hỏi giá 142/318 dòng"*) |

### Danh sách, theo mức quan trọng

| | Chỗ chờ | Live có sẵn | Nên là |
|---|---|---|---|
| 1 | **Get Prices / Refresh Prices** | — | **Quan trọng nhất.** Request Nexar cho hàng trăm dòng. Spinner trong nút + chữ đếm dòng; lưới giữ dữ liệu cũ mờ đi chứ không trống. `getPrices()` hiện đồng bộ, chưa có gì |
| 2 | **Đăng nhập** | `LOGIN_REQUEST → isLoading` | Spinner trong nút *Sign in* + khoá form. MFA và *Forgot password* dùng lại y vậy — store đã có state cho cả ba |
| 3 | **Boot app sau đăng nhập** | `isInitialized`, `isAuthInitialized` | Overlay toàn màn: logo + Kendo `Loader`. Đây là lúc app lấy navigation và permission — chưa có gì để vẽ skeleton theo |
| 4 | **Đổi route** | `LoadingProvider` | Thanh progress mảnh dưới header. **Không** skeleton: chưa biết route đích là lưới hay hồ sơ |
| 5 | **Mở hồ sơ** (Quotation Detail, Part) | — | Skeleton theo hình form — nhãn và ô ở đúng chỗ, để trang không nhảy |
| 6 | **Lưới danh sách** | `Skeleton` + `animate-wave` | **Đã có.** Giữ nguyên |
| 7 | **Phân trang / filter phía server** | — | Overlay mờ **trên dòng cũ**, không thay bằng skeleton: người dùng vừa thấy dữ liệu, xoá đi là bước lùi |
| 8 | **Save / Confirm RFQ / Generate Quotation** | — | Nút khoá + spinner, toast sau khi xong. Khoá là phần quan trọng hơn spinner — nó chặn bấm hai lần |
| 9 | **Export Excel** | — | Spinner trong nút. Lưới 300 dòng × 21 cột không tức thì |
| 10 | **Nexar MPN lookup trong ô** | — | Spinner nhỏ trong chính picker, không chặn hàng |
| 11 | **Upload BoM / attachment** | Kendo Upload | Dùng progress sẵn của Kendo Upload, đừng viết lại |
| 12 | **Notification panel** | `isLoading` + `isError` | Skeleton 3 dòng |

### Chỗ **không** nên thêm

| | Vì sao |
|---|---|
| **Update Results** | Cùng phép tính, không request. Đo được là dưới 50ms. Spinner ở đây là nói dối và làm app có cảm giác chậm hơn |
| Lọc / sắp xếp / đổi cột phía client | Cục bộ, tức thì |
| Mở dialog | Không có gì phải nạp |
| 700ms giữ skeleton ở các lưới của prototype | Chỉ là giả lập để trạng thái loading nhìn thấy được (`useListScreen.ts:35`). Trên hệ thống thật nó đến từ request, không phải `setTimeout` |

---

## 10. Hình tàu bay — nên đặt ở đâu

Trước hết, một dữ kiện: **hệ thống live không có hình tàu bay nào.** Tìm trong
bundle: `plane` / `airplane` / `aircraft` / `lottie` = 0 lần. `rocket` 4 lần là
dữ liệu nghiệp vụ (`/BomSetups/rocket-columns`, `NET_ROCKET_INVENTORY`), không
phải hình. Nên đây là ý mới của chị ấy, không phải thứ mình đang thiếu.

### Nguyên tắc: **tần suất quyết định, không phải chỗ nào cũng được**

Một hình minh hoạ có tính cách chỉ "lời" ở nơi người dùng **hiếm khi** gặp và
**không có gì khác để nhìn**. Ở nơi gặp mỗi ngày vài chục lần, nó chuyển từ
duyên sang phiền — và không rút lại được, vì lúc đó nó đã là thương hiệu.

### Nên đặt

| Chỗ | Vì sao hợp |
|---|---|
| **Boot screen sau đăng nhập** | Một lần một phiên, vài giây, cả màn hình trống. Đây là chỗ đúng nhất — và nó đã dựng sẵn (`BootScreen`) |
| **Panel thương hiệu ở màn đăng nhập** | Không phải loading, mà là *khoảnh khắc thương hiệu*: một lần một phiên, đã có 45% màn hình dành cho nó |
| **Trang lỗi / mất kết nối** | Hiếm, và là lúc đáng làm dịu. Tàu bay đã hạ cánh / đang đỗ — hình nói đúng trạng thái |
| **Màn trống lần đầu** (chưa có RFQ nào) | Cùng khe "không có gì để nhìn", dù không phải loading |

### Không nên đặt

| Chỗ | Vì sao |
|---|---|
| Skeleton của lưới | Mỗi lần mở một màn danh sách. Vài chục lần một ngày |
| Spinner trong nút | **20px** — xem số đo dưới. Một chiếc tàu bay ở 20px là một vết mực |
| Thanh progress khi đổi route | Vài lần một phút |
| **Get Prices** | Nghe thì hợp nhất — nhưng đây là thao tác lặp lại suốt ngày của người báo giá. Giữ Kendo `Loader` |
| Bất kỳ chờ nào dưới 1 giây | Hình chưa kịp chạy hết một vòng đã biến mất, thành ra nhấp nháy |

### Ràng buộc kỹ thuật cần biết trước khi vẽ

Đo trong DOM — ba bậc của Kendo `Loader`:

| | `small` | `medium` | `large` |
|---|---|---|---|
| Kích thước | **20×20** | **40×40** | **80×80** |

Một chiếc tàu bay chỉ đọc được từ khoảng **64px trở lên**, tức là chỉ ở bậc
`large` — đúng bằng boot screen và trang lỗi, và không phải trong nút.

Ba điều nữa:

1. **SVG nội tuyến, không GIF/Lottie, không CDN.** Màn đăng nhập của mình đã từ
   chối `<img>` tới CDN cho logo Microsoft vì đúng lý do này: một màn đăng nhập
   không nên phụ thuộc mạng ngoài. Hình tàu bay chịu cùng luật.
2. **`prefers-reduced-motion`: hiện tàu bay *tĩnh*, đừng cho bay.** Hình vẫn
   nói được "đang tải" mà không chuyển động.
3. **Phải sống trên cả nền sáng và nền tối** — panel đăng nhập là nền tối, boot
   screen là nền sáng.

### Một câu nên hỏi lại chị ấy

`logo-ideas.md` quyết định **D2: "Rocket EMS colours are out — Voyager IQ là
bản sắc riêng."** Một hình tàu bay / tên lửa mượn từ thương hiệu mẹ sẽ đi ngược
quyết định đó. Ngược lại, chính chữ **"Voyager"** là một từ về hành trình, nên
tàu bay hoàn toàn bảo vệ được *như hình của Voyager IQ*, không phải của Rocket.
Xin chị xác nhận chị đang nghĩ theo hướng nào — nó đổi cả hình lẫn màu.
