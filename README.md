# CoupleSpace ☁️

Web app riêng tư cho hai đứa: hôm nay ăn gì, tâm trạng, bucket list và wishlist bí mật.
Tone trắng – xanh da trời. Chạy tốt trên cả điện thoại (PWA, bottom nav) và máy tính (sidebar, bố cục nhiều cột).

**Không có trang đăng nhập**: lần đầu mở app chỉ cần chọn "mình là ai" (BP hay QN), lựa chọn được nhớ trên máy.

## Chạy dự án

```bash
npm install
npm run dev
```

Tạo file `.env.local` với cấu hình Firebase (xem Firebase Console → Project Settings):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Build production: `npm run build` (ra thư mục `dist/`). Kiểm tra lint: `npm run lint`.

### Bắt buộc: cho phép Firestore hoạt động không cần mật khẩu

App đăng nhập **ẩn danh** để Firestore rules kiểu `request.auth != null` vẫn chạy. Cần bật:
Firebase Console → Authentication → Sign-in method → **Anonymous** → Enable.

Rules gợi ý (chỉ 2 người biết link nên chấp nhận được):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Nếu không bật Anonymous, app vẫn mở được nhưng sẽ hiện banner cảnh báo và không đọc/ghi được dữ liệu.

## Tính năng

| Trang | Chức năng |
|---|---|
| 🏠 Nhà chung | Đếm ngày yêu, tâm trạng 2 đứa, "hôm nay thèm gì", lời nhắn trong ngày, đếm ngược sự kiện (kỷ niệm năm/tháng, mốc ngày chẵn, sinh nhật) |
| 🍜 Ăn gì? | Danh sách quán, lọc theo quận/món/chưa ghé/yêu thích, tìm kiếm, quay random, mở Google Maps & chỉ đường 1 chạm, tìm quán gần đây, đếm số lần ghé |
| 🌠 Kế hoạch | Bucket list 3 trạng thái (kanban trên desktop, tab trên mobile), ngày dự định, địa điểm mở Google Maps, thanh tiến độ, pháo hoa khi hoàn thành |
| 🎁 Kho báu | Wishlist mỗi người, mức độ thèm, giá, link mua, nửa kia "lén chốt đơn" mà chủ wishlist không biết |
| ⚙️ Cài đặt | Ngày bắt đầu yêu, ngày đặc biệt, cài app lên màn hình chính, đổi người dùng |

## Cấu trúc

```
src/
  components/   AppLayout (sidebar + bottom nav), BottomNav, ui (Card, Button, Modal, Toast...)
  context/      AuthContext – chọn "mình là ai" (localStorage) + hồ sơ 2 người dùng
  hooks/        useDailyLog, usePlaces, useBucketList, useWishlist, useAppConfig
  lib/          date.js (đếm ngày, sự kiện), maps.js (link Google Maps), useDragScroll
  pages/        ChoosePerson, Home, Explore, BucketList, Wishlist, Settings
```

## Dữ liệu Firestore

- `users/{uid}`: `name`, `first_name`, `sex` (`male` | `female`)
- `config/app_config`: `start_date` (YYYY-MM-DD), `special_dates[]` (`{id, label, date, emoji}`)
- `daily_logs/{YYYY-MM-DD}`: `boy_mood`, `girl_mood`, `boy_cravings[]`, `girl_cravings[]`, `boy_note`, `girl_note`
- `places`: `name`, `category`, `district`, `address`, `price`, `map_link`, `note`, `visits`, `favorite`
- `bucket_list`: `title`, `emoji`, `status`, `target_date`, `place`
- `wishlists`: `uid`, `title`, `link`, `imageUrl`, `price`, `priority`, `note`, `status`
