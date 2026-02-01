# QFC Faucet

QFC 测试网水龙头服务。

## 功能

- Web UI 请求测试币
- 每地址 24 小时冷却
- 每次发送 10 QFC
- 显示最近请求记录

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式 (端口 3001)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start
```

## 配置

复制 `.env.example` 为 `.env.local` 并配置:

```bash
# RPC URL
RPC_URL=http://127.0.0.1:8545

# 水龙头钱包私钥 (需要有 QFC 余额)
FAUCET_PRIVATE_KEY=4242424242424242424242424242424242424242424242424242424242424242

# 每次发送数量 (QFC)
FAUCET_AMOUNT=10

# 冷却时间 (小时)
COOLDOWN_HOURS=24
```

## API

### GET /api/faucet

获取水龙头信息:
- 水龙头地址和余额
- 每次发送数量
- 冷却时间
- 最近请求记录

### POST /api/faucet

请求测试币:
```json
{
  "address": "0x..."
}
```

响应:
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "amount": "10",
    "address": "0x..."
  }
}
```

## 技术栈

- Next.js 14 (App Router)
- React 18
- TailwindCSS
- ethers.js v6

## 本地测试账户

| 私钥 | 地址 | 余额 |
|------|------|------|
| `4242...42` | `0x10d7812fbe50096ae82569fdad35f79628bc0084` | 1B QFC |
