FROM php:8.1-fpm

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    curl \
    unzip

# 清理apt緩存
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 安裝PHP擴展
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# 安裝Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 設置工作目錄
WORKDIR /var/www/html

# 複製項目文件
COPY . /var/www/html

# 安裝項目依賴
RUN composer install

# PHP-FPM默認監聽9000端口
EXPOSE 9000

CMD ["php-fpm"]