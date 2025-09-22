#!/bin/bash

# MinIO初期化スクリプト
# このスクリプトはMinIOサーバーの初期設定を行います

set -e

MINIO_ALIAS="myminio"
MINIO_ENDPOINT="http://minio:9000"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"

echo "=== MinIO初期化開始 ==="

# MinIOサーバーの準備待ち
echo "MinIOサーバーの起動を待機中..."
until mc alias set ${MINIO_ALIAS} ${MINIO_ENDPOINT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}; do
  echo "MinIOサーバーに接続できません。再試行中..."
  sleep 2
done

echo "MinIOサーバーに接続しました"

# バケット作成
echo "=== バケット作成 ==="
while IFS=: read -r bucket_name policy versioning encryption; do
  # コメント行をスキップ
  [[ $bucket_name =~ ^#.*$ ]] && continue
  # 空行をスキップ
  [[ -z "$bucket_name" ]] && continue
  
  echo "バケット作成: $bucket_name"
  mc mb ${MINIO_ALIAS}/${bucket_name} --ignore-existing
  
  # ポリシー設定
  case $policy in
    "public")
      mc policy set public ${MINIO_ALIAS}/${bucket_name}
      ;;
    "download")
      mc policy set download ${MINIO_ALIAS}/${bucket_name}
      ;;
    "private")
      mc policy set none ${MINIO_ALIAS}/${bucket_name}
      ;;
  esac
  
  # バージョニング設定
  if [ "$versioning" = "enabled" ]; then
    mc version enable ${MINIO_ALIAS}/${bucket_name}
  fi
  
  echo "✓ バケット '$bucket_name' を作成しました (ポリシー: $policy, バージョニング: $versioning)"
done < /init_config/buckets.txt

# ユーザー作成
echo "=== ユーザー作成 ==="
while IFS=: read -r username password policy; do
  # コメント行をスキップ
  [[ $username =~ ^#.*$ ]] && continue
  # 空行をスキップ
  [[ -z "$username" ]] && continue
  
  echo "ユーザー作成: $username"
  mc admin user add ${MINIO_ALIAS} ${username} ${password}
  
  # ポリシー適用
  case $policy in
    "readwrite")
      mc admin policy attach ${MINIO_ALIAS} readwrite --user ${username}
      ;;
    "readonly")
      mc admin policy attach ${MINIO_ALIAS} readonly --user ${username}
      ;;
    "consoleAdmin")
      mc admin policy attach ${MINIO_ALIAS} consoleAdmin --user ${username}
      ;;
  esac
  
  echo "✓ ユーザー '$username' を作成しました (ポリシー: $policy)"
done < /init_config/users.txt

# カスタムポリシーの適用
echo "=== カスタムポリシー適用 ==="
for policy_file in /init_config/policies/*.json; do
  if [ -f "$policy_file" ]; then
    policy_name=$(basename "$policy_file" .json)
    echo "カスタムポリシー作成: $policy_name"
    mc admin policy create ${MINIO_ALIAS} ${policy_name} ${policy_file}
    echo "✓ ポリシー '$policy_name' を作成しました"
  fi
done

echo "=== MinIO初期化完了 ==="
echo "管理画面: http://localhost:9001"
echo "API エンドポイント: http://localhost:9000"
echo "ルートユーザー: ${MINIO_ROOT_USER}"