# Viền của control — quét toàn bộ, 8/11/2026

Sửa viền Chip xong thì câu hỏi tiếp theo là: **còn chỗ nào nữa không.** Nên
quét hẳn — mọi phần tử focus được, trên 12 route, đo viền của chính nó so với
nền phía sau, lọc ra những cái dưới **3:1** (ngưỡng WCAG 1.4.11 cho biên của
thứ người dùng thao tác được).

> **Bản quét đầu tiên sai và phải bỏ.** Mọi dòng đều ra đúng `1.00`. Lý do:
> hàm đọc màu vẽ lên canvas 1×1 mà **không xoá giữa hai lần đọc**, nên màu
> trong suốt để lại màu cũ và viền luôn bằng nền. Thêm
> `globalCompositeOperation = 'copy'` thì số mới đúng. Ghi lại vì đây đúng
> loại lỗi mà `contrast-sweep.md` cảnh báo: một bộ đo báo "không có lỗi" chỉ
> đáng tin nếu chứng minh được nó sẽ tìm ra lỗi nếu có.

## Đã sửa hôm nay — cả bảy

**Gốc rễ: `--vy-border-control` đo sai nền.** Năm trong bảy ca không phải
dùng sai token — chúng dùng **đúng** token, mà token thì thiếu. Giá trị
`#8a94a6` chọn hồi tháng 9 là "nhạt nhất mà vẫn đạt" **trên nền trắng**; quét
qua mọi nền thì nó đạt đúng một cái:

| surface | subtle | app | hover | selected | sunken | strong |
|---|---|---|---|---|---|---|
| 3.06 | 2.98 | 2.85 | 2.85 | 2.78 | 2.65 | 2.35 |

Nên checkbox đo ra 2.85 trong khi kendo-bridge đã trỏ đúng token từ lâu.
Cùng một lỗi với bậc chữ `subtle` bốn tiếng trước đó, và cùng một cách sửa:
**đặt theo nền xấu nhất**.

| Token | Trước | Sau | Nền chặt nhất |
|---|---|---|---|
| `--vy-border-control` light | `#8a94a6` | **`#758096`** | 3.05 trên surface-strong |
| `--vy-border-control` dark | `#6d7889` | **`#707c8d`** | 3.05 trên surface-strong |

**Và một cái nữa mà chính phép kiểm mới tìm ra.** Ngay lần chạy đầu sau khi
dạy `contrast:check` đo mọi nền, nó báo **vòng focus trong dark** chỉ được
2.88 trên `surface-strong`. `--vy-brand-boundary` dùng blue-400 ở cả hai
theme; dark giờ là blue-300, chặt nhất 4.76.

**Dùng sai token — đã trỏ lại `--vy-border-control`:**

| Control | Trước | Sau |
|---|---|---|
| `.vy-chip` lúc nghỉ | 1.64 | 3.06 / 3.83 |
| `.vy-rt-swatch` | 1.64 | 3.06 / 3.44 |
| `.vy-audit-chip` | 1.21 | đạt |
| `.vy-search` | 1.30 | đạt |
| `k-button-outline.k-button-base` | 1.30 | đạt |
| `.vy-pager-size select` | 1.27 | đạt |
| `.vy-rt-block select` | 1.27 | đạt |
| `.vy-smart-btn` | 2.71 | blue-300 → **blue-400**, 4.48 |

`k-button-outline` là cái nặng tay nhất: `outlined` là biến thể mặc định của
Button, nên nó làm đậm viền của gần như mọi nút phụ trong sản phẩm. Phạm vi
giới hạn ở `.k-button-base` — `filled` và `danger` là nút đặc, được nhận ra
bằng **nền**, nên viền của chúng không mang 1.4.11 và giữ nguyên.

## Quét lại: còn 6, và cả 6 đều cố ý

| Control | Tỉ lệ | Vì sao không tính |
|---|---|---|
| `.vy-kpi`, `.vy-queue`, `k-tabstrip-item` | 1.21 | Thẻ và tab có chữ lớn bên trong — 1.4.11 không đòi viền khi control đã nhận ra được bằng cách khác |
| `k-button-solid-*` ×3 | 1.30 | Nút đặc; **nền** là thứ cho thấy có nút, và nền đó 9.16:1 |

## Một giới hạn của bản quét này

Lượt dark **không áp được theme** — số ra giống hệt lượt light. Nguyên nhân
nhiều khả năng là `applyTheme` chạy lúc mount và ghi đè thuộc tính mà script
đặt trước khi trang tải. Các con số dark trong bảng "đã sửa" ở trên là tính
trực tiếp từ token, không phải từ bản quét.

Muốn chạy lại cho đúng thì phải đặt lại `data-theme` **sau** khi trang tải,
như `capture-design-system.mjs` đang làm.

## Đã chặn được, cả hai nửa

**Nửa "token thiếu giá trị"** — `contrast:check` giờ đo đường biên trên **mọi
nền**, không chỉ trên panel: 142 cặp thay vì 114. Chính phép kiểm mới đó tìm
ra vòng focus dark ngay lần chạy đầu.

**Nửa "dùng sai token"** — `scripts/border-check.mjs`, chạy cùng
`focus:check` và `hover:check` trong `check:visual`. Nó đo **viền như đang
được vẽ thật** trên trang đang chạy, nên nó thấy được thứ `contrast:check`
không bao giờ thấy: `.vy-search` trỏ vào token nào.

```
border:check  340 bordered controls across 12 routes x 2 themes
UNDER 3:1  0   · 4 kinds allowed by argument
```

Ba thứ đáng nói về nó:

- **Self-test kiểm cả con số, không chỉ "có bắt được hay không".** Nó cấy một
  nút viền `#cccccc` trên nền trắng và đòi kết quả đúng **1.61**. Bộ đọc màu
  hỏng theo đúng kiểu đã hỏng lần đầu sẽ trả về 1.00 và phép kiểm tự thoát
  với mã lỗi trước khi kịp báo "sạch".
- **Dark đặt theo cách người dùng đặt** — ghi `vy.theme` vào localStorage rồi
  reload, và **assert** là trang đã đổi thật. Bản quét tay trước đó stamp
  `data-theme` sau khi tải nên lượt dark ra y hệt lượt light mà không ai biết.
- **Bốn ca "không tính" nằm trong code kèm lý do**, không phải một danh sách
  im lặng. Nếu một lý do thôi đúng thì xoá dòng đó và sửa control.

Đã thử nghiệm bằng cách trả `.vy-audit-chip` về token cũ: phép kiểm báo
`1.21`, ở cả hai theme, đúng route `/audit`, và exit 1.
