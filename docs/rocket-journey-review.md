# Rà soát bản "rocket journey" — 27/10/2026

Chạy thật, không chỉ đọc: mở demo qua dev server, đo hình học bằng cách dựng lại
engine cho từng `step`/`state`, tính tương phản bằng công thức WCAG, cân file.

Kết luận ngắn: **ý tưởng và phần lớn thi công là đúng.** Có **một lỗi làm hỏng
chính điều concept hứa**, bảy mục phải sửa trước khi dùng, và năm câu cần quyết
— trong đó hai câu không phải lỗi kỹ thuật mà là quyết định.

---

## 1. Đã kiểm và ĐÚNG

| | Đo được |
|---|---|
| **Trục bay giữ nguyên** | Ngang: `y = 48` ở **mọi** step và state. Dọc: `x = 48`. Kể cả lúc hạ cánh (`rotate(270)`) và lúc lỗi. Acceptance check 1 đạt trên trục ngang |
| **Chuỗi trạm** | `38.66 → 59.67 → 73.67 → 87.67 → 94.67 → 108` (hạ cánh). Lệch 0.6–0.7 là biên độ lơ lửng, đúng thiết kế |
| **Chấm lộ trình** | `00000 → 10000 → 11000 → 11100 → 11110 → 11111` khi xong |
| **Hành tinh** | A co `1 → 0.75`, B nở `1 → 1.25`, đúng 5% mỗi trạm |
| **Bốn trạng thái** | `loading` lửa bật/mắt mở · `done` hạ cánh `rotate(270) scale(0.3)`, lửa tắt, mắt cười · `error` dừng ở trạm vừa qua, lửa tắt, mắt ×, khói hiện, hành tinh B mờ còn `0.5` · `idle` tĩnh, không lơ lửng |
| **Màu** | Chỉ dùng thang blue + brand + trắng + nền tối. **Không có đỏ, không có hổ phách** — đúng ràng buộc |
| **Trợ năng** | `aria-hidden="true"`, `focusable="false"`, không có `<title>` — đúng |
| **Dạng màu** | `var(--token, #hex)` xuyên suốt — đúng |
| **Reduced motion** | Mã làm **đúng hơn** mô tả: spec viết "nhảy tới tư thế cuối", mã thực ra snap về **trạm hiện tại** và bỏ lơ lửng. Nhảy tới tư thế cuối khi đang loading sẽ là nói dối |

---

## 2. PHẢI SỬA

### 2.1 Chấm tiến độ gần như không nhìn thấy trên nền sáng — **lỗi lớn nhất**

Thông tin tiến độ nằm ở chỗ chấm đã qua đổi màu. Đo tương phản:

| | |
|---|---|
| Chấm **đã qua** `#7f9ce1` vs **chưa qua** `#b0c2ea` | **1.52 : 1** |
| Chấm chưa qua trên nền trắng | 1.79 : 1 |
| Chấm đã qua trên nền trắng | 2.71 : 1 |

Ngưỡng WCAG 1.4.11 cho thành phần đồ hoạ **mang thông tin** là **3 : 1**. Cả ba
số đều trượt. Nghĩa là trên theme sáng, thứ mà cả concept dựa vào — *"các chấm
sau lưng tên lửa chuyển sang đặc"* — người dùng gần như không thấy.

Trên nền tối thì ổn: `#dae2f3` trên `#131820` = **13.7 : 1**.

**Sửa:** chấm **đã qua** đổi sang `--vy-blue-500 #2754bc`, chấm **chưa qua** giữ
`--vy-blue-200 #b0c2ea`:

| | giữa hai chấm | đã qua / nền trắng |
|---|---|---|
| blue-500 / blue-200 *(đề nghị)* | **3.81 : 1** | 6.82 : 1 |
| brand #1a419e / blue-200 | 5.12 : 1 | 9.16 : 1 |

Chọn blue-500 để thân tên lửa (brand) vẫn là vật đậm nhất trên khung.

### 2.2 Khung to ra nhưng nhân vật nhỏ đi

Đo trên màn hình, ở đúng ba cỡ mà bản sizing đề nghị:

| Khung | Tên lửa trên màn | Ô cửa | **Mắt** | Nét lộ trình |
|---|---|---|---|---|
| 240 × 160 *(đề nghị cho 1366 và 1440)* | 32 × 59px | 13.2px | **2.7px** | 4px |
| 288 × 192 | 39 × 71px | 15.8px | **3.2px** | 4.8px |
| 320 × 213 | 43 × 78px | 17.5px | **3.5px** | 5.3px |

Brief đặt ngưỡng ~64px để một hình vẽ "đọc được". Khung thì vượt xa ngưỡng đó,
nhưng **nhân vật** chỉ 59px ở cỡ 240 — và **mắt chỉ 2.7px**. Ở DPR 1 đó là
khoảng ba điểm ảnh cho một con mắt: chi tiết "thân thiện" mà cả concept dựa vào
sẽ thành vết mờ, và animation chớp mắt sẽ không ai thấy.

**Sửa:** hoặc sàn khung lên **288**, hoặc giữ 240 và tăng `scale` của tên lửa từ
`0.42` lên khoảng `0.6` rồi rút ngắn lộ trình. Cách thứ hai tốt hơn — nó giữ
khối hình gọn và làm nhân vật thành vật chính.

### 2.3 File giao nặng gấp ba lần con số trong spec

| | |
|---|---|
| File như đã giao | **12.209 bytes** mỗi file |
| Sau khi bỏ khối `<metadata>` C2PA | **4.435 bytes** (gzip ~1,1 KB) |

Spec ghi "~4.4 KB" là đúng — **sau khi gỡ**. Mỗi file đang mang 7,8 KB metadata
nguồn gốc. Phải gỡ trước khi đưa vào mã nguồn.

### 2.4 Trùng `id` — đã dựng lại và thấy thật

Mở trang demo, quét toàn bộ `id`: **`vy-plane-sp` xuất hiện trùng.** Trên demo
thì vô hại vì bốn hình giống nhau, nhưng trong React, hai thực thể cùng trang
(ví dụ panel đăng nhập `idle` và boot screen) sẽ tham chiếu nhầm. `clipPath`
cũng đặt tên theo *layout + theme* chứ không theo *thực thể*, nên hai bản cùng
layout cùng theme sẽ tranh nhau.

**Sửa:** sinh id theo thực thể (`useId()` của React), không hard-code.

### 2.5 `--vy-login-bg` là token trùng

Panel đăng nhập **đã** được tô bằng `--vy-surface-chrome`, vốn trỏ tới
`--vy-grey-900 = #131820`. Thêm `--vy-login-bg: #131820` là đặt tên thứ hai cho
một màu đã có tên — đúng thứ mà lớp token sinh ra để ngăn.

**Sửa:** dùng `var(--vy-surface-chrome, #131820)`.

### 2.6 Mã màu hổ phách trong spec sai

Spec ghi cấm `#b0b509`. Hổ phách của hệ thống là **`#b45309`**. `#b0b509` không
tồn tại ở đâu trong dự án. Ràng buộc đúng, con số chép nhầm — sửa kẻo nó lan
sang bản brief sau.

### 2.7 `--vy-ease-loop` là token chết

Spec khai báo `--vy-ease-loop: cubic-bezier(.37,0,.63,1)` rồi nói ngay rằng
lơ lửng và chớp mắt dùng hàm sin trong engine. Vậy không ai đọc token này. Bỏ,
hoặc dùng nó thật.

### 2.8 Tên gọi

Mọi id và class đều mang tiền tố `vy-plane-`, nhưng hình là **tên lửa**. Tiền tố
đến từ bản brief của mình, lúc đó đang giả định tàu bay. Đổi sang `vy-rocket-`
hoặc trung tính `vy-journey-`.

---

## 3. Cần quyết — không phải lỗi

### 3.1 Chị ấy xin tàu bay, bản vẽ là tên lửa

Yêu cầu là *"hình tàu bay"*. Bản giao là tên lửa có vây và lửa đẩy. Và đúng điều
brief đã cảnh báo: quyết định **D2** đặt bản sắc **Rocket EMS** ra ngoài phạm vi
Voyager IQ — một con tên lửa làm linh vật sẽ kéo thương hiệu mẹ trở lại.

Đây là câu hỏi thương hiệu, phải hỏi chị ấy, không phải thứ mình tự đổi.

### 3.2 Bản dựng hiện tại **không có** bước boot nào để tên lửa đi

Spec nói đúng: *"chỉ tăng `step` khi một bước boot thật kết thúc; không bịa tiến
độ."* Nhưng `BootScreen` của mình đang là một `Suspense` fallback — **không có
bước nào cả**. Dùng nguyên như vậy thì tên lửa đứng ở trạm 0 và chỉ lơ lửng,
mãi mãi.

Hệ thống **live** thì có thật. Đếm trong bundle:

| Chuỗi trong store | Số lần |
|---|---|
| `navigation:` | 14 |
| `isInitialized` | 11 |
| `isAuthInitialized` | 9 |
| `getPermission` | 2 |
| `MFA_REQUIRED` | 2 |
| `LOGIN_SUCCESS` / `LOGIN_REQUEST` / `INITIALIZE` | 1 mỗi cái |

Tức là năm trạm là **đúng cho production** và **sai cho bản dựng hôm nay**. Phải
chọn: hoặc gắn trạm vào các mốc thật đó, hoặc trong prototype chạy một chế độ
không trạm (chỉ lơ lửng + lửa) và nói rõ đó là bản demo.

### 3.3 Dòng chữ không đổi theo trạm, nên tiến độ thành thông tin chỉ-bằng-màu

Spec lấy ví dụ nhãn *"Loading your workspace…"* — một câu cho cả năm trạm. Nhưng
chấm thì đổi theo trạm. Thành ra tiến độ chỉ được nói bằng màu (WCAG 1.4.1).

**Sửa:** dòng chữ gọi tên đúng bước đang chạy — *"Đang nạp danh mục điều
hướng…"*, *"Đang nạp quyền truy cập…"*. Việc này cũng làm 2.1 bớt nghiêm trọng.

### 3.4 Engine không được giữ bất kỳ mốc thời gian nào mà ứng dụng phụ thuộc

Đo được: trong một trang ẩn, **`requestAnimationFrame` không chạy một nhịp nào**
(`document.hidden = true`, 0 nhịp trong 700ms). Engine chạy hoàn toàn bằng rAF —
đúng cho phần vẽ, vì trang ẩn thì không ai nhìn.

Nhưng `JOURNEY_DONE_HOLD_MS` (giữ 1,8s để thấy cảnh hạ cánh) nghe như đang do
engine giữ. Nếu người dùng chuyển tab đúng lúc boot xong, mốc đó sẽ không bao
giờ tới. **Mốc dừng phải là timer của React, engine chỉ sở hữu điểm ảnh.**

### 3.5 240 × 160 thay cho 96 × 96 — vậy mark và loader hiện tại thì sao?

Brief cũ đặt 96 × 96 cho boot screen; một hành trình có hai hành tinh thì không
thể gói trong 96px, nên 240 là hợp lý và thay thế con số cũ. Nhưng boot screen
hiện đang là: **ô mark 40 × 40 + loader Kendo 80 × 80 + dòng chữ**. Cần chốt:
tên lửa **thay** loader Kendo (và lúc đó nó phải tự nói được "đang chạy"), mark
giữ hay bỏ.

---

## 4. Một chi tiết nhỏ

Spec nói các trạm *"thưa dần về phía B để bước cuối chậm không làm đứng cạnh
đích"*. Khoảng cách thật: **21, 14, 14, 7, 14**. Không đơn điệu — chặng cuối
(94 → 108) dài hơn chặng trước nó. Có thể cố ý vì đó là đoạn hạ cánh, nhưng câu
mô tả không khớp với con số.

---

## 5. Chưa kiểm được

- **Safari và Firefox.** Spec tự ghi là chưa kiểm, và em cũng chưa — engine đặt
  `transform-box: view-box`, chỗ đó lịch sử hay lệch giữa các trình duyệt.
- **Chuyển động thật.** Pane của em chạy như trang nền nên rAF không hoạt động;
  mọi phép đo trên là hình học tĩnh dựng qua constructor. Nhịp lơ lửng, chớp mắt
  và cảnh hạ cánh cần xem trên màn hình thật.
