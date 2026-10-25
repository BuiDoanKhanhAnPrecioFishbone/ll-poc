# Brief — hình tàu bay cho trạng thái loading (Voyager IQ)

Bản này **đứng độc lập**: ai nhận nó mà không có repo vẫn vẽ được. Mọi con số
đều đo trong bản dựng thật, không ước lượng.

Sản phẩm: **Voyager IQ** — hệ ERP cho Linh Long Engineering, người dùng là nhân
viên báo giá và kỹ sư, dùng cả ngày trên máy tính để bàn. Giao diện là
KendoReact trên nền token màu riêng. Chữ: **Inter**.

---

## 1. Vẽ cái gì, và nó KHÔNG phải cái gì

**Là:** một hình minh hoạ (illustration) — có khối, có chi tiết, có thể có mảng
màu đặc.

**Không phải một icon.** Sản phẩm đã có 41 icon dùng chung một quy ước:
viewBox `20×20`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.6"`,
đầu và góc bo tròn. Hình tàu bay **phải khác hẳn bộ này** — một trong năm tiêu
chí nhận mark của dự án là *"không bị nhầm với icon của chính mình"*, và thanh
điều hướng đã có 12 icon nét mảnh. Nét nặng hơn, hoặc có mảng đặc, là cách
tách ra.

---

## 2. Ba vị trí, ba kích thước

| # | Vị trí | Trạng thái | Khung vẽ đề nghị | Nền |
|---|---|---|---|---|
| 1 | **Boot screen** — sau đăng nhập / khi nạp route nặng | **đã dựng** (`.vy-boot`) | **96 × 96** | sáng `#ffffff` |
| 2 | **Panel thương hiệu màn đăng nhập** | **đã dựng** (`.vy-login-brand`) | **240 × 240** (hoặc bố cục ngang tới 400 × 240) | **tối `#131820`** |
| 3 | **Trang lỗi / mất kết nối** | **chưa dựng** — sẽ làm sau | **120 × 120** | sáng `#ffffff` |

Ưu tiên: **làm (1) trước.** Đó là vị trí duy nhất đang chạy thật và là nơi hình
được nhìn lâu nhất.

### Bối cảnh của vị trí 1, để căn tỉ lệ

Boot screen hiện là một cột dọc, căn giữa cả màn, nền `#ffffff`, khoảng cách
giữa các phần tử **14px**:

```
┌─ ô mark 40 × 40, bo góc 4px, nền #1a419e, chữ "V" trắng 20px
│  (hình tàu bay có thể THAY ô này, hoặc đứng trên nó — nói rõ khi giao)
├─ loader của Kendo: 80 × 80, xoay
└─ dòng chữ 13px, màu #626d7e
```

Nếu tàu bay thay cho loader: **96 × 96**, và nó phải tự nói được "đang chạy",
vì loader xoay sẽ bị gỡ.
Nếu tàu bay đứng cạnh loader: giữ **64 × 64** để không lấn.

### Ngưỡng đọc được

Đo ba bậc loader của Kendo trong DOM: **small 20×20 · medium 40×40 · large
80×80**. Một chiếc tàu bay chỉ đọc được từ khoảng **64px** trở lên. Vì vậy
**không có phiên bản nhỏ** — không dùng trong nút, không dùng trong ô lưới,
không dùng làm favicon. Đừng vẽ bản rút gọn 16px, sẽ không dùng tới.

---

## 3. Màu — dùng đúng trong bảng này

Hệ màu gọi theo **ý nghĩa**. Trong SVG hãy viết dạng `var(--token, #hex)` để
lớp theme thay được về sau, ví dụ `fill="var(--vy-brand, #1a419e)"`.

### Nền sáng (vị trí 1 và 3)

| Vai trò | Token | Hex |
|---|---|---|
| **Màu chính** | `--vy-brand` | `#1a419e` |
| Đậm hơn (bóng, phần chìm) | `--vy-blue-800` | `#112960` |
| | `--vy-blue-900` | `#0d1e44` |
| Nhạt hơn (mảng phụ) | `--vy-blue-400` | `#4973d4` |
| | `--vy-blue-300` | `#7f9ce1` |
| | `--vy-blue-200` | `#b0c2ea` |
| | `--vy-blue-100` | `#dae2f3` |
| Nền rất nhạt | `--vy-blue-50` | `#f1f4fa` |
| Trung tính nhạt | `--vy-surface-app` | `#f5f7fa` |
| | `--vy-surface-sunken` | `#eceff3` |
| | `--vy-border` | `#dde2e9` |
| | `--vy-border-strong` | `#c3cbd6` |
| Trung tính đậm | `--vy-on-surface-subtle` | `#626d7e` |
| | `--vy-on-surface` | `#232a34` |
| Trắng | `--vy-surface` | `#ffffff` |

### Nền tối (vị trí 2 — panel đăng nhập, nền `#131820`)

Trên nền này dùng đầu nhạt của thang: **`#7f9ce1`**, **`#b0c2ea`**,
**`#dae2f3`**, và trắng `#ffffff`. `#1a419e` trên `#131820` gần như không thấy.

### Hai màu bị CẤM

| | |
|---|---|
| **Đỏ `#c62d26`** | Dành riêng cho hành động phá huỷ (xoá, huỷ). Một hình thương hiệu màu đỏ sẽ tiêu mất nghĩa đó. Đây là quyết định đã chốt của dự án, không phải sở thích |
| **Hổ phách `#b45309`** | Dành riêng cho cảnh báo |

Giới hạn: **tối đa 4–5 màu riêng biệt** trong cả hình. Càng ít càng dễ đưa vào
token về sau.

---

## 4. Chuyển động

Hệ thống hiện có 7 token chuyển động. Dùng đúng chúng:

```css
--vy-ease-standard:    cubic-bezier(.2, 0, 0, 1);   /* mặc định, dùng cái này */
--vy-ease-decelerate:  cubic-bezier(0, 0, 0, 1);
--vy-ease-accelerate:  cubic-bezier(.3, 0, 1, 1);
--vy-dur-short:  100ms   --vy-dur-medium: 200ms   --vy-dur-long: 300ms
```

**Chưa có token cho vòng lặp.** Animation này sẽ tạo ra nó — đề nghị
`--vy-dur-loop: 1400ms`, khớp với shimmer của skeleton hiện tại (1.4s) để hai
chuyển động trên cùng một màn không đánh nhau về nhịp.

Quy tắc:

| | |
|---|---|
| **Vòng lặp liền mạch** | Khung cuối phải nối lại khung đầu, không giật |
| **Biên độ nhỏ** | Dịch chuyển **dưới 8%** chiều khung (≈ 8px trên khung 96). Đây là màn chờ của phần mềm kế toán vật tư, không phải màn hình chờ game — tàu bay *lơ lửng*, không bay ngang qua |
| **Không xoay cả thân** | Cả sản phẩm không có gì xoay ngoài loader của Kendo. Nghiêng nhẹ ±2–3° thì được |
| **Mỗi lúc một thứ chuyển động** | Nếu cánh quạt quay thì thân đứng yên, và ngược lại |
| **`prefers-reduced-motion: reduce`** | **Hiện hình TĨNH.** Hình vẫn phải nói được "đang tải" khi đứng im — đây là ràng buộc bắt buộc, không phải tuỳ chọn |

Kỹ thuật: ưu tiên **CSS animation** trên các phần tử trong SVG (`transform`,
`opacity`). Nếu phải dùng SMIL thì nói rõ, vì nó không chịu ảnh hưởng của
`prefers-reduced-motion` và phải tắt bằng cách khác.

---

## 5. Giao file như thế nào

| | |
|---|---|
| **Định dạng** | **SVG nội tuyến** — dán thẳng vào JSX được |
| **Không dùng** | GIF, Lottie, PNG, WebP, `<img>` trỏ CDN. Màn đăng nhập của sản phẩm đã từ chối `<img>` tới CDN cho logo Microsoft, vì màn đăng nhập không nên phụ thuộc mạng ngoài. Hình này chịu cùng luật |
| **Dung lượng** | **≤ 8 KB** markup cho bản 96px. Nếu phải dùng path sinh tự động dài hàng chục KB thì hình đang quá chi tiết cho kích thước này |
| **Thuộc tính gốc** | `viewBox="0 0 96 96"`, **không** đặt `width`/`height` cứng — để CSS định kích thước |
| **Trợ năng** | `aria-hidden="true"` và `focusable="false"` trên thẻ `<svg>`. **Không** thêm `<title>` — dòng chữ trạng thái đã nằm ngoài SVG và đã được đọc lên; một `<title>` nữa là đọc hai lần |
| **Màu** | `var(--token, #hex)` như mục 3, không hex trần |
| **Đặt tên class** | Tiền tố `vy-plane-` cho mọi class bên trong, để không đụng 563 class đang có |

---

## 6. Nơi nó sẽ được gắn vào (cho người lập trình)

| | |
|---|---|
| Component | `src/ui/Loader.tsx` → hàm `BootScreen()` |
| CSS | `src/theme/app.css` → `.vy-boot`, `.vy-boot-mark` |
| Màn đăng nhập | `src/pages/Login.tsx` → `.vy-login-brand` |

---

## 7. Một câu chưa có lời đáp

Quyết định **D2** của dự án: *"Màu của Rocket EMS nằm ngoài phạm vi — Voyager
IQ là bản sắc riêng."* Rocket EMS là thương hiệu mẹ.

Vì vậy:

- **Tên lửa** sẽ kéo bản sắc của thương hiệu mẹ trở lại, đi ngược D2.
- **Tàu bay** thì bảo vệ được: *"Voyager"* tự nó là một từ về hành trình, nên
  máy bay là hình của **Voyager IQ**, không phải của Rocket.

Brief này đang giả định **tàu bay, không phải tên lửa**. Nếu khách hàng thực sự
muốn tên lửa thì đó là một câu hỏi thương hiệu cần hỏi lại trước khi vẽ, không
phải một lựa chọn hình.

Gợi ý hướng, không bắt buộc: *"Voyager"* nghiêng về **hành trình và định
hướng** hơn là tốc độ. Một chiếc tàu bay nhìn từ trên xuống, hình học, trên một
đường bay mảnh, sẽ hợp với một hệ thống mà việc của nó là cho người ta biết một
đơn hàng đang ở đâu — hợp hơn một chiếc phản lực đang lao đi.
