# ASKME-CLI

> 为 AI 助手提供用户确认界面的 MCP（Model Context Protocol）服务器

[English](../README.md) | [日本語](README_ja.md)

## 为什么选择它

AI 助手经常需要用户确认或获取下一步操作，但在 MCP 对话过程中没有简单的方式获取用户输入。

这个项目通过终端界面提供个人化的确认端点。

## 如何开始

您需要配置您的 MCP 客户端以使用 ASKME-CLI。

请按照以下说明部署配置。

### 使用 npx 快速设置

```bash
# 查看帮助和配置示例
npx askme-cli help

# 直接运行（当被 MCP 客户端调用时）
npx askme-cli
```

### 配置 MCP 客户端

将以下配置添加到您的 MCP 客户端配置文件中：

#### Cursor (`.cursor/mcp_servers.json`)

```json
{
  "mcpServers": {
    "askme-cli": {
      "command": "npx",
      "args": ["askme-cli"],
      "env": {
        "ASKME_CLI_TERMINAL": "warp"
      }
    }
  }
}
```

#### 其他 MCP 客户端

```json
{
  "mcpServers": {
    "askme-cli": {
      "command": "npx",
      "args": ["askme-cli"],
      "env": {
        "ASKME_CLI_TERMINAL": "iterm2"
      }
    }
  }
}
```

### 本地开发

```bash
# 克隆并安装
git clone <your-repo-url>
cd askme-cli
npm install

# 构建并运行
npm run build
npm run start
```

## 如何使用

配置完成后，AI 助手可以使用 `ask_me` 工具来收集用户确认：

1. AI 助手调用 `ask_me` 工具，并提供已完成工作的摘要
2. ASKME-CLI 打开一个新的终端窗口，显示确认界面
3. 用户输入下一步计划或确认内容并提交
4. AI 助手接收用户输入以继续操作

## 终端支持

通过 `ASKME_CLI_TERMINAL` 环境变量配置：

| 终端 | 值 | 描述 |
|------|-----|------|
| Warp | `warp` | 默认，现代化终端应用 |
| iTerm2 | `iterm2` | 流行的 macOS 终端 |
| Terminal | `terminal` | macOS 系统终端 |
| Kitty | `kitty` | 跨平台终端 |
| Alacritty | `alacritty` | GPU 加速终端 |
| Hyper | `hyper` | 基于 Web 的终端 |

## API 参考

### ask_me 工具

收集用户的下一步计划或确认。

**参数：**
- `what_we_did` (字符串): AI 完成工作的摘要

**返回：**
- 用户输入的下一步计划或确认内容
- 支持文本和图像输入

## 使用示例

### AI 助手集成

为了在您的 AI 助手中有效使用 ASKME-CLI，请将这些规则添加到您的系统提示词中：

```
- 每次结束用户提示前都必须调用 askme-cli.ask_me 工具。
- 所有以 /tk 开头的提示，不修改代码或文件，并在结束前调用 askme-cli.ask_me 工具。
- 当您有问题时，总是在结束前调用 askme-cli.ask_me 工具。
- 如果您有新功能或更改的想法，请清楚地解释它们，分析其可行性，并询问我是否要继续。
```

### 工具调用示例

```json
{
  "tool": "ask_me",
  "parameters": {
    "what_we_did": "我已经完成了数据库架构的设置并创建了用户认证端点。API 现在已准备好进行测试。"
  }
}
```

## 技术栈

- **TypeScript** - 类型安全开发
- **React + Ink** - 终端 UI 框架
- **MCP SDK** - Model Context Protocol 支持
- **Node.js** - 运行时环境

## 许可证

MIT 