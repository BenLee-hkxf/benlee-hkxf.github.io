# Stage

## QA Plan

| 項目 | 日期 |
| ---- | ---- |
| 開發期 | ~ 10/22 |
| 測試回報期間 | 10/23 ~ 10/30 |
| 上線目標 | 11/4 |

## Deploy Plan

### 10/23 ~ 11/1

| *版本* | *機器位置* |  *域名*  | *資料庫*  |
| ----- |  --------  |  ------  | -------  |
| 舊版 | AWS | https://www.yottau.com.tw/ | 正式資料庫 |
| 新後台測試版 | 大安機房 | https://yotta-test-1.hkxf.org/  | 後端開發資料庫 |
| 新前台測試版 | 大安機房 | https://yotta.hkxf.org/ | 前端開發資料庫 |
| 正式影片測試版 | 大安機房 | https://v.yottau.com.tw/ | 前端開發資料庫 |
| 新前台正式版 | AWS VM | https://www1.yottau.com.tw/ | 正式資料庫 |
| 舊版並行 | AWS VM | https://www2.yottau.com.tw/ | 正式資料庫 |

在此階段，可以先用 www1 測試 /download 路徑轉址到 www2

### 11/4

(下表僅列出異動項目)

| *版本* | *機器位置* |  *域名*   | *資料庫*  |
| ---- |  ----  |  ----  | ----  |
| 新前台正式版 | AWS VM | https://www.yottau.com.tw/ | 正式資料庫 |
