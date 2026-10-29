# Soát bản *Loading screen – launch redesign* của chị — 29/10/2026

Nguồn: `Voyager IQ loading screen – launch redesign.html` (chị gửi 29/10, 22:04).
Em chạy thật cả năm kịch bản trong file (Normal · Slow · Fast · Screen error ·
Under development) rồi đối chiếu với bản đang có.

**Một điểm xác nhận ngay:** năm bước trong file của chị —
*Signing you in · Loading your menu · Checking your permissions · Restoring
your settings · Opening your workspace* — **trùng từng chữ** với `BOOT_STAGES`
bản em. Câu tiêu đề lỗi *"This screen stopped loading"* và nút *"Reload this
screen"* cũng vậy. Tức là hai bên đang nói cùng một ngôn ngữ; phần dưới chỉ là
những thứ file của chị **có thêm**.

---

## A · Màn chờ — bản của chị đổi phép ẩn dụ

| | Bản của chị | Bản em đang có |
|---|---|---|
| Chuyển động | **Phóng thẳng lên**: tên lửa leo, hành tinh chìm xuống, vệt sao rơi ngược — nên cái leo đọc ra thành tiến triển | Hành trình **ngang** qua 5 trạm giữa hai hành tinh, đáp xuống kèm mặt cười |
| Tiến độ | **Thanh 5 đoạn** dưới dòng chữ | 5 trạm trên đường bay |
| Chữ | **Một dòng** duy nhất *"Launching your mission…"* | Gọi tên từng bước (*Signing you in*…) |
| Chậm | Sau **5 giây** đổi thành *"Still climbing…"* | Không có trạng thái chậm |
| Hiện khi nào | **Chỉ khi load lâu hơn 0,4 giây** | Hiện ngay |
| Thoát | Tên lửa **bay khỏi mép trên 0,4 giây** rồi mới mở workspace | Đổi màn thẳng |
| Xong | *"Welcome aboard"* | Không có |
| Giảm chuyển động | Có | Có |

**Luật 0,4 giây đáng giá nhất trong bảng này, và nó vá đúng một lỗi bản em đã
tự ghi ra.** `bootStages.ts` của em viết: *"bốn trong năm bước xong ngay lập
tức… màn boot **loé lên** chứ không kể được câu chuyện nào"*. Bản em chọn cách
"không giữ màn lại cho đẹp" — đúng về nguyên tắc, nhưng để nguyên cái loé.
Luật của chị giải quyết từ đầu kia: **load dưới 0,4 giây thì không hiện màn
chờ gì cả**. Hai luật này không chọi nhau, ghép vào là hết loé.

**Một dòng chữ thay vì gọi tên từng bước** — em đồng ý. Năm cái nhãn chạy qua
trong 0,8 giây là năm cái không ai đọc kịp; thanh 5 đoạn chở đúng phần thông
tin đó mà không bắt mắt đọc chữ.

---

## B · Màn lỗi — chị thêm hẳn một đường thoát

Tranh và chữ bản em đã khớp. Bảy thứ dưới đây **bản em chưa có**:

| | |
|---|---|
| 1 | Nút thứ hai **Back to Home** — bản em có sẵn chỗ cắm (`children`), chưa ai truyền vào |
| 2 | Dòng **"Still not working? Send a support ticket"** |
| 3 | **Hộp thoại gửi ticket**: *Subject\** (điền sẵn tên màn), *What were you doing?* |
| 4 | Khối **"Added for you"** tự đính kèm: Error ID · Screen · Time · Browser |
| 5 | Xác nhận **"✓ Ticket HD-1056 sent. You'll get updates by email."** |
| 6 | **Error ID** `VIQ-7F3A2C` kèm nút **Copy** |
| 7 | Tên lửa **nằm nghiêng trên bệ, nứt thân, rụng một cánh, bốc khói** — bản em là tên lửa đứng im, mắt hai dấu nhân |

Mục 3–6 là phần đáng làm nhất: nó biến một màn báo lỗi thành một màn **xử lý
được**. Error ID tự đính kèm nghĩa là người dùng không phải tả lại lỗi, và bên
mình nhận được đúng mã để tra.

---

## C · *Under development* — bản em **chưa có màn này**

Chị dựng hẳn một trạng thái thứ tư: tên lửa **nguyên vẹn** đứng trên bệ, cánh
tay máy đang hàn, cạnh đó là bảng vẽ thiết kế có checklist đang tick dần.

> **Still on the launch pad**
> Our crew is assembling this module. It lifts off in an upcoming release.
> `Back to Home`

Và luật đi kèm rất đúng: **không có nút Reload, vì không có gì hỏng**.

Bản em đang là một trang chữ — *"Not yet mocked"* kèm hai đoạn giải thích.
Không sai, nhưng nó nói bằng giọng người làm prototype chứ không phải giọng sản
phẩm.

**Đây là mục đòn bẩy lớn nhất trong cả ba.** App có **21 route đã dựng** trên
**91 đường trong sitemap** — tức khoảng **70 màn** rơi vào trang này. Một hình
minh hoạ ở đây thay đổi phần lớn những gì người xem demo bấm trúng.

---

## D · Dùng vào màn nào — đề xuất của em

| Bản của chị | Cắm vào | Số màn ảnh hưởng |
|---|---|---|
| Launch loader | `BootGate` (sau khi đăng nhập) và `Suspense` của route tải chậm | 1 màn, nhưng là **màn đầu tiên sau mật khẩu** |
| Screen error | `ErrorBoundary` — đang bọc **mọi** route | mọi màn, khi hỏng |
| Under development | `Placeholder` | **~70 màn** |

**Thứ tự em đề nghị:** *Under development* → *Screen error* → *launch loader*.
Ngược với thứ tự trong file của chị, và lý do là số màn ở cột cuối: màn thứ ba
đẹp lên thì một người bấm trúng một lần, màn thứ nhất đẹp lên thì bảy mươi màn
đổi theo.

## E · Cỡ việc

| | |
|---|---|
| **Under development** | Vừa — hình tên lửa + cánh tay máy + bảng vẽ là SVG sẵn trong file của chị, lấy nguyên; phần còn lại là thay ruột `Placeholder` |
| **Màn lỗi: Back to Home + Error ID + Copy** | Nhỏ |
| **Màn lỗi: hộp thoại ticket** | Vừa — cần chốt ticket đi đâu (xem câu hỏi dưới) |
| **Tên lửa hỏng nằm trên bệ** | Nhỏ — SVG có sẵn trong file |
| **Luật 0,4 giây + thoát 0,4 giây + "Welcome aboard"** | Nhỏ |
| **Đổi hẳn sang phóng thẳng đứng** | Lớn — và là **câu hỏi**, không phải việc: xem dưới |

## F · Hai điều cần chị quyết

1. **Hành trình ngang còn dùng nữa không?** Bản phóng thẳng của chị và bản bay
   ngang 5 trạm của em là hai phép ẩn dụ khác nhau cho cùng một lúc chờ. Em
   không định giữ cả hai — hai hình cho một trạng thái là hai thứ người dùng
   phải học. Nếu chị chốt bản phóng thẳng thì em thay, và bản ngang lui về làm
   hình minh hoạ trong tài liệu.
2. **Support ticket gửi đi đâu?** Hộp thoại trong file dừng ở màn xác nhận với
   số `HD-1056`. Bên mình có hệ thống helpdesk nào đang chạy (số `HD-` là của
   hệ nào), hay đây là thứ cần dựng mới? Trả lời cái này rồi em mới dựng được
   phần sau nút Send.
