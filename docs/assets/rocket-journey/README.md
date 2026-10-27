# Rocket journey — bản đã sửa phần cơ học

27/10/2026. Ba file ở thư mục này là bản giao gốc, đã sửa những mục **không cần
ai quyết** trong `docs/rocket-journey-review.md`. Phần nghệ thuật, hình học và
engine **không đụng tới**.

## Đã sửa

| | Trước | Sau |
|---|---|---|
| **Metadata C2PA** | 7,8 KB mỗi file | gỡ — file còn **~4.460 bytes**, gzip **~1,1 KB** |
| **`id` dùng chung `vy-plane-sp`** | một `<defs>` + ba `<use href="#...">` | ba `<path>` nội tuyến. Id biến mất hẳn thay vì đổi tên: dữ liệu path của một ngôi sao là 60 byte, ba bản rẻ hơn một id mà hai thực thể cùng trang có thể tranh nhau |
| **Chấm tiến độ trên nền sáng** | `--vy-blue-300 #7f9ce1`, cách chấm chưa qua **1.52 : 1** | `--vy-blue-500 #2754bc`, cách chấm chưa qua **3.81 : 1**, so với nền trắng 6.82 : 1 |
| **`--vy-login-bg`** | token mới, trùng nghĩa | `--vy-surface-chrome`, vốn đã trỏ tới `--vy-grey-900 #131820` |
| **Tiền tố `vy-plane`** | hình là tên lửa | `vy-rocket` |
| **Lõi ngọn lửa** | `--vy-surface` — token này **lật sang `#161c25` ở dark** | `--vy-grey-0`. Lõi phải trắng vì nó là chỗ nóng nhất của ngọn lửa, không phải vì nó là một mặt nền. Đo lại trong dark: lõi vẫn `rgb(255,255,255)`; trước khi sửa nó sẽ thành một lỗ tối giữa ngọn lửa |

Bản tối **không đổi màu chấm**: ở đó chấm đã qua là `--vy-blue-100 #dae2f3`
trên lộ trình mờ, đo được **13.7 : 1** — vốn đã đạt.

Kiểm sau khi sửa: 3 ngôi sao nội tuyến mỗi file · không có `href` treo ·
`clip-path` khớp id · không còn chuỗi `vy-plane`, `login-bg` hay `c2pa` ·
cả ba file dựng lại đúng hình.

## CÒN LẠI — phải sửa lúc đưa vào React

`clipPath` vẫn còn **một** id mỗi file (`vy-rocket-clip-h-light`,
`-h-dark`, `-v-dark`). Một file tĩnh thì không thể có id duy-nhất-theo-thực-thể,
nên đây là việc của component:

```tsx
const uid = useId();                       // "vy-rocket-clip-" + uid
```

Hai bản **cùng layout cùng theme** trên một trang sẽ tranh id nếu không làm
việc này. Trường hợp thật: panel đăng nhập ở trạng thái `idle` và boot screen
cùng hiện.

## CHƯA sửa — vì cần quyết định

Xem mục 3 của `docs/rocket-journey-review.md`:

1. Tên lửa hay tàu bay (chị ấy xin tàu bay; tên lửa đụng quyết định **D2**)
2. Năm trạm chưa có bước boot thật nào để gắn vào trong bản dựng này
3. Dòng chữ chưa đổi theo trạm, nên tiến độ vẫn là thông tin chỉ-bằng-màu
4. Kích thước: ở khung 240 thì mắt chỉ **2.7px** — hoặc sàn khung lên 288, hoặc
   tăng `scale` tên lửa từ `0.42` lên ~`0.6`
5. Engine không được giữ mốc dừng mà ứng dụng phụ thuộc (rAF không chạy ở tab ẩn)

## Bản dọc-sáng — đã dựng

Bản giao thiếu nó. File `vy-rocket-journey-vertical-light.svg` dựng từ hình học
của *dọc-tối* với bộ màu của *ngang-sáng*.

**Không thể tìm-thay màu một cách mù quáng**, và đây là lý do: ánh xạ sáng↔tối
**không đơn trị**. Cùng một `--vy-blue-100` ở bản sáng ra ba token khác nhau ở
bản tối tuỳ nó đang tô cái gì; `--vy-blue-800` ra ba token khác nữa. Nên phép
thay phải theo **vị trí**, không theo tên màu.

Việc đó an toàn vì đã kiểm: cả bốn file có **đúng 29 tham chiếu màu, cùng một
trình tự phần tử**. Thay theo vị trí thứ *i* là chính xác.

Sửa kèm cho đúng một bản "đang tải, chưa đi đâu", giống *ngang-sáng*:

| | |
|---|---|
| `data-step` / `data-state` | `0` / `loading` (bản gốc là `2` / `idle`) |
| Tên lửa | về trạm đầu, `translate(48 106)` |
| Hành tinh | cả hai về `scale(1)` |
| Năm chấm đoạn | `opacity` về `0` |
| Nền lộ trình | bỏ `opacity=".4"` — độ mờ đó chỉ hợp trên nền tối |

Kiểm sau: bộ token của *dọc-sáng* **trùng khớp từng vị trí** với *ngang-sáng*,
không `href` treo, `clip-path` khớp id riêng (`vy-rocket-clip-v-light`), mọi
hex dự phòng đúng giá trị token giải ra.

## Màu — đã đối chiếu với lớp token

Quét cả bốn file: **8 token**, mỗi hex dự phòng **khớp đúng** giá trị mà token
thật sự giải ra, và **không có một mã màu viết thẳng nào**.

| Token | Giải ra | Dùng cho |
|---|---|---|
| `--vy-brand` | `#1a419e` *(qua `--vy-blue-600`)* | thân tên lửa, bản sáng |
| `--vy-blue-800` | `#112960` | vây, ô cửa, bóng đổ, bản sáng |
| `--vy-blue-500` | `#2754bc` | **chấm đã qua**, bản sáng |
| `--vy-blue-300` | `#7f9ce1` | lửa ngoài, hành tinh B |
| `--vy-blue-200` | `#b0c2ea` | chấm chưa qua, sao, vành đai |
| `--vy-blue-100` | `#dae2f3` | lửa giữa, mắt, dải thân |
| `--vy-grey-0` | `#ffffff` | **lõi lửa** — xem bảng trên |
| `--vy-surface-chrome` | `#131820` *(qua `--vy-grey-900`)* | lỗ ô cửa, bản tối |
