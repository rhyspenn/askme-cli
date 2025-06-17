# ASKME-CLI

> AI アシスタント用のユーザー確認インターフェースを提供する MCP（Model Context Protocol）サーバー

[English](../README.md) | [简体中文](README_zh.md)

## なぜ使うのか

AI アシスタントはよくユーザーの確認や次のステップが必要ですが、MCP 会話中にユーザー入力を取得する簡単な方法がありません。

このプロジェクトは、ターミナルインターフェースを通じて個人的な確認エンドポイントを提供します。

## 始め方

ASKME-CLI を使用するために MCP クライアントを設定する必要があります。

以下の手順に従って設定をデプロイしてください。

### npx でのクイックセットアップ

```bash
# ヘルプと設定例を表示
npx askme-cli help

# 直接実行（MCP クライアントから呼び出される場合）
npx askme-cli
```

### MCP クライアントの設定

MCP クライアント設定ファイルに追加：

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

#### その他の MCP クライアント

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

### ローカル開発

```bash
# クローンとインストール
git clone <your-repo-url>
cd askme-cli
npm install

# ビルドと実行
npm run build
npm run start
```

## 使い方

設定が完了すると、AI アシスタントは `ask_me` ツールを使用してユーザー確認を収集できます：

1. AI アシスタントが完了した作業の要約と共に `ask_me` ツールを呼び出す
2. ASKME-CLI が確認インターフェースで新しいターミナルウィンドウを開く
3. ユーザーが次の計画または確認を入力して送信
4. AI アシスタントがユーザー入力を受信して続行

## ターミナルサポート

`ASKME_CLI_TERMINAL` 環境変数で設定：

| ターミナル | 値 | 説明 |
|------------|----|----|
| Warp | `warp` | デフォルト、モダンなターミナルアプリ |
| iTerm2 | `iterm2` | 人気の macOS ターミナル |
| Terminal | `terminal` | macOS システムターミナル |
| Kitty | `kitty` | クロスプラットフォームターミナル |
| Alacritty | `alacritty` | GPU アクセラレーションターミナル |
| Hyper | `hyper` | Web ベースターミナル |

## API リファレンス

### ask_me ツール

ユーザーの次の計画または確認を収集します。

**パラメータ：**
- `what_we_did` (文字列): AI が完了した作業の要約

**戻り値：**
- 次の計画または確認のためのユーザー入力
- テキストと画像入力をサポート

## 使用例

### AI アシスタントの統合

AI アシスタントで ASKME-CLI を効果的に使用するには、システムプロンプトに以下のルールを追加してください：

```
- 毎回ユーザープロンプトを終了する前に askme-cli.ask_me ツールを呼び出す必要があります。
- /tk で始まるすべてのプロンプトでは、コードやファイルを変更せず、終了前に askme-cli.ask_me ツールを呼び出します。
- 質問がある場合は、常に終了前に askme-cli.ask_me ツールを呼び出します。
- 新機能や変更のアイデアがある場合は、それらを明確に説明し、実現可能性を分析し、続行するかどうかを尋ねます。
```

### ツール呼び出し例

```json
{
  "tool": "ask_me",
  "parameters": {
    "what_we_did": "データベーススキーマの設定を完了し、ユーザー認証エンドポイントを作成しました。API はテストの準備ができています。"
  }
}
```

## 技術スタック

- **TypeScript** - 型安全な開発
- **React + Ink** - ターミナル UI フレームワーク
- **MCP SDK** - Model Context Protocol サポート
- **Node.js** - ランタイム環境

## ライセンス

MIT 