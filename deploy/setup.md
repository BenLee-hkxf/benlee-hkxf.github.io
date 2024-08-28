# 設定

## 管理架構

[server]
Ubuntu
- Webmin
  - SMB


[client]
Windows

## Windows 用戶端整合

[server 設定]

文件管理器
建立 資料夾 /var/yotta，owner: root/yotta-rd
建立 SMB user ，對應到實體 unix 帳號 
建立 SMB group，對應到實體 unix 群組 yotta-rd

SMD user: 77777

[client 設定]

將SMB分享位置掛載於 windows

- 新增網路位址
- \\10.168.3.232\yotta

