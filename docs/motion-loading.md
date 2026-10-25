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
động ngang nào ngoài shimmer, và không có gì xoay — nếu thêm spinner thì nó là
chuyển động xoay đầu tiên trong sản phẩm.

---

## 7. Xem trực tiếp

- `/design-system` — trang design system có trong prototype: màu theo ngữ
  nghĩa, ramp thô, bộ trạng thái, role của cột, nút, elevation, thang chữ.
  **Chưa có mục motion** — đó là mục anh sắp viết.
- `/engineering/part-mst` — nạp lại trang để thấy skeleton (giữ ~700ms, cố ý:
  dữ liệu là cục bộ nên nếu không giữ thì trạng thái loading không bao giờ
  thấy được — xem `useListScreen.ts:35`).
