# 文件結構

主要配置

```fs
/etc/nginx/nginx.conf
/etc/nginx/conf.d/www.yottau.com.tw.conf
/etc/nginx/conf.d/console.yottau.com.tw.conf
```

重新加載

```sh
sudo nginx -t   # 測試配置文件語法
sudo nginx -s reload  # 重新加載配置
```
