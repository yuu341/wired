# MinIO初期設定について

## 📁 ファイル構成

```
init_minio/
├── README.md              # このファイル
├── init.sh               # 初期化スクリプト
├── users.txt             # ユーザー設定
├── buckets.txt           # バケット設定
└── policies/             # カスタムポリシー
    ├── app-user-policy.json
    └── readonly-policy.json
```

## 👥 ユーザー設定 (`users.txt`)

形式: `ユーザー名:パスワード:ポリシー`

### 定義済みユーザー

| ユーザー名 | パスワード | ポリシー | 説明 |
|-----------|-----------|----------|------|
| admin | admin123 | consoleAdmin | 管理者 |
| app-user | app-secret-key | readwrite | アプリケーション用 |
| readonly-user | readonly-pass | readonly | 読み取り専用 |
| dev-user | dev-password | readwrite | 開発者用 |

### 利用可能なポリシー

- `consoleAdmin`: 全権限
- `readwrite`: 読み書き権限
- `readonly`: 読み取り専用

## 🪣 バケット設定 (`buckets.txt`)

形式: `バケット名:ポリシー:バージョニング:暗号化`

### 定義済みバケット

| バケット名 | ポリシー | バージョニング | 暗号化 | 用途 |
|-----------|----------|---------------|--------|------|
| dev-bucket | public | enabled | disabled | 開発用 |
| prod-bucket | private | enabled | enabled | 本番用 |
| user-uploads | download | enabled | disabled | ユーザーアップロード |
| static-assets | public | disabled | disabled | 静的ファイル |
| app-logs | private | enabled | disabled | ログファイル |
| backups | private | enabled | enabled | バックアップ |

### バケットポリシー

- `public`: パブリックアクセス可能
- `download`: ダウンロードのみ可能
- `private`: 認証が必要

## 🔐 カスタムポリシー (`policies/`)

### app-user-policy.json
アプリケーション用ユーザーの詳細権限設定
- `dev-bucket`, `user-uploads` への読み書き権限

### readonly-policy.json
読み取り専用ユーザーの詳細権限設定
- `dev-bucket`, `static-assets` への読み取り権限

## 🛠️ 設定のカスタマイズ

### 新しいユーザーを追加

`users.txt` に以下の形式で追加:
```
new-user:new-password:readwrite
```

### 新しいバケットを追加

`buckets.txt` に以下の形式で追加:
```
new-bucket:public:enabled:disabled
```

### カスタムポリシーを追加

`policies/` ディレクトリに `.json` ファイルを配置

## 🚀 使用方法

Docker Composeで自動的に初期化されます:

```bash
docker compose up -d
```

手動で初期化する場合:

```bash
docker compose run --rm minio-setup
```

## ⚠️ セキュリティ注意事項

### 本番環境での注意点

1. **強力なパスワードを使用**
   ```
   admin:$(openssl rand -base64 32):consoleAdmin
   ```

2. **不要なパブリックバケットを削除**

3. **最小権限の原則を適用**

4. **定期的なパスワード変更**

## 🔄 設定の更新

設定を変更した場合:

1. ファイルを編集
2. コンテナを再起動
   ```bash
   docker compose restart minio-setup
   ```

## 📋 チェックリスト

- [ ] `users.txt` でユーザー設定確認
- [ ] `buckets.txt` でバケット設定確認
- [ ] `policies/` でカスタムポリシー確認
- [ ] 本番環境用パスワード変更
- [ ] 不要なパブリックアクセス削除
- [ ] 初期化スクリプト実行確認