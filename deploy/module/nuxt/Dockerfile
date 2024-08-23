# 使用官方Node.js镜像作为基础镜像
FROM node:16

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

# 暴露端口（Nuxt.js默认使用3000端口）
EXPOSE 3000

# 启动Nuxt应用
CMD [ "npm", "start" ]