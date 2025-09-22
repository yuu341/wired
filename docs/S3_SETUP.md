# S3開発環境セットアップ（MinIO）

このプロジェクトではS3互換のMinIOを使用して開発環境でS3機能をテストできます。

## 🚀 セットアップ手順

### 1. Docker Composeでサービス開始

```bash
# ElasticsearchとMinIOを同時に起動
docker-compose up -d

# MinIOのみ起動する場合
docker-compose up -d minio minio-setup
```

### 2. MinIO管理画面にアクセス

- **管理画面URL**: http://localhost:9001
- **ユーザー名**: `minioadmin`
- **パスワード**: `minioadmin`

### 3. アプリケーション開発サーバー起動

```bash
npm run dev
```

## 📁 使用方法

### 基本的なS3操作

```javascript
import { S3Service } from './src/services/s3Service';

// ファイルアップロード
const file = document.querySelector('input[type="file"]').files[0];
await S3Service.uploadFile(file, 'my-file.txt');

// ファイル一覧取得
const files = await S3Service.listFiles();

// ファイル削除
await S3Service.deleteFile('my-file.txt');

// 署名付きURL生成
const downloadUrl = S3Service.getSignedUrl('my-file.txt');
```

### ファイル管理コンポーネント

```jsx
import FileManager from './src/components/FileManager';

function App() {
  return (
    <div>
      <FileManager />
    </div>
  );
}
```

## 🔧 設定情報

### 環境変数（.env.local）

```env
VITE_S3_ENDPOINT=http://localhost:9000
VITE_S3_ACCESS_KEY=minioadmin
VITE_S3_SECRET_KEY=minioadmin
VITE_S3_BUCKET=dev-bucket
```

### MinIO エンドポイント

- **API**: http://localhost:9000
- **Web UI**: http://localhost:9001
- **デフォルトバケット**: `dev-bucket`

## 🛠️ トラブルシューティング

### MinIOが起動しない場合

```bash
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs minio

# コンテナを再起動
docker-compose restart minio
```

### バケットが作成されない場合

```bash
# MinIO setupコンテナのログを確認
docker-compose logs minio-setup

# 手動でバケット作成
docker-compose exec minio mc mb /data/dev-bucket
```

### CORS エラーが発生する場合

MinIO管理画面から以下を設定：
1. Buckets → dev-bucket → Access Policy → Public
2. または、CORS設定を追加

## 📋 チェックリスト

- [ ] Docker/Docker Compose インストール済み
- [ ] `docker-compose up -d` でサービス開始
- [ ] http://localhost:9001 でMinIO管理画面にアクセス可能
- [ ] `npm install` で依存関係インストール済み
- [ ] `.env.local` ファイル作成済み
- [ ] `npm run dev` でアプリケーション起動

## 🔄 本番環境への移行

本番環境では以下の変更が必要：

1. **AWS S3への切り替え**
   ```env
   VITE_S3_ENDPOINT=  # 空にするとAWS S3を使用
   VITE_S3_ACCESS_KEY=your-aws-access-key
   VITE_S3_SECRET_KEY=your-aws-secret-key
   VITE_S3_BUCKET=your-production-bucket
   ```

2. **セキュリティ設定**
   - IAMロールの設定
   - バケットポリシーの設定
   - CORS設定の確認

## 🌟 MinIOの利点

- ✅ AWS S3完全互換API
- ✅ 軽量・高速
- ✅ Web UI付属
- ✅ Docker対応
- ✅ 無料・オープンソース
- ✅ 本番環境でも使用可能