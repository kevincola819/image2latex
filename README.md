# Img2LaTeX - 图片转 LaTeX 工具

Img2LaTeX 是一个基于深度学习的图片转 LaTeX 工具，它可以将包含数学公式的图片快速、准确地转换为可编辑的 LaTeX 代码。

## 🌟 特性

- **高准确度**: 使用 [LaTeX-OCR](https://github.com/lukas-blecher/LaTeX-OCR) 模型，支持复杂公式识别。
- **实时预览**: 自动渲染生成的 LaTeX 代码，即时查看效果。
- **现代 UI**: 基于 React + Tailwind CSS 构建，简洁易用。
- **全栈架构**: FastAPI 后端 + Vite 前端。

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/img2latex.git
cd img2latex
```

### 2. 后端部署 (Python 3.9+)

进入 `api` 目录，创建并激活虚拟环境，然后安装依赖：

```bash
cd api
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

**下载模型文件:**

运行脚本自动下载预训练模型权重：

```bash
python download_models.py
```

**启动后端服务:**

```bash
python main.py
```
后端服务默认运行在 `http://localhost:8000`。

### 3. 前端部署 (Node.js 18+)

在项目根目录下安装依赖并启动：

```bash
npm install
npm run dev
```
前端开发服务器默认运行在 `http://localhost:5173`。

## 🛠️ 技术栈

- **前端**: React, TypeScript, Vite, Tailwind CSS, KaTeX, Framer Motion
- **后端**: FastAPI, Python, Pix2Tex (LaTeX-OCR), PIL
- **模型**: Transformer-based OCR model

## 📖 使用说明

1. 启动后端和前端服务。
2. 在浏览器中打开前端页面。
3. 点击上传区域选择图片，或直接粘贴图片。
4. 系统将自动识别并显示 LaTeX 代码。
5. 你可以点击代码块进行复制，或在预览区查看渲染后的公式。

## 🤝 贡献

欢迎提交 Issue 或 Pull Request。

## 📄 许可证

MIT License
