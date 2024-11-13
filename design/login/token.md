# Token 登入機制

## 目的

- 連續操作時，需要有機制可以減少重複登
- 避免消耗伺服器資源
- 實現跨 AP 共享
- 要具備一定的安全性

## 機制設計

- 以 token 替代 server 記憶體
- 維持時間約 20 分鐘
- 連續操作時，自動展延(但不要頻繁進行編碼)
- 逾期時，要有 renew 機制

## 雙 token

### access_token

作為 session 機制的替代，減少連續操作過程中重複進行的登入程序。

### refresh_token

作為記住用戶

## token_renew

更換 token
