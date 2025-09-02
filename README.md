# TFV7-Web - トランスファーVシミュレーション

トランスファーV（TFV）のリース料金シミュレーションを行うWebアプリケーションです。JセブンとJナインの2つのプランに対応し、複数台の車両のオプション設定や売却額設定を含む詳細なシミュレーションが可能です。

## 🚗 主な機能

- **プラン選択**: Jセブン（7ヶ月リース）とJナイン（9ヶ月リース）の選択（Jナインは未実装）
- **車両選択**: 推奨車両から複数台選択可能
- **オプション設定**: 各車両に個別のオプション料金を設定
- **売却額設定**: 売却対象車両の売却額を設定
- **料金計算**: リース料金、オプション料金、売却額を考慮した総合計算
- **結果表示**: 詳細な料金内訳と節約効果の表示

## 🛠 技術スタック

- **フレームワーク**: Next.js 15.5.2 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **状態管理**: Zustand
- **デプロイ**: Vercel

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホームページ（プラン選択）
│   ├── simulate/
│   │   └── [plan]/
│   │       ├── input/     # 入力画面
│   │       └── result/    # 結果画面
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── CarCard.tsx        # 車両カード（オプション・売却額設定）
│   ├── PickerModal.tsx    # 車両選択モーダル
│   └── AddButton.tsx      # 車両追加ボタン
├── data/                  # データファイル
│   └── recommended.ts     # 推奨車両データ
├── hooks/                 # カスタムフック
│   └── useLeaseCalc.ts    # リース計算ロジック
├── store/                 # 状態管理
│   └── simStore.ts        # Zustandストア
├── types/                 # TypeScript型定義
│   ├── cars.ts           # 車両関連の型
│   └── plan.ts           # プラン関連の型
└── utils/                 # ユーティリティ関数
    └── lease.ts          # リース計算ユーティリティ
```

## 🚀 セットアップ

### 前提条件

- Node.js 22.0.0以上

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd tfv7-web

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint
```

## 🌐 デプロイ

このプロジェクトはVercelにデプロイされています。

### デプロイ手順

1. GitHubリポジトリをVercelに接続
2. 自動デプロイが設定済み（mainブランチへのプッシュで自動デプロイ）
3. 環境変数は不要

### ビルド設定

- **フレームワーク**: Next.js
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `.next`

## 📊 データ構造

### 車両データ
```typescript
interface RecommendedCar {
  id: string;
  maker: string;
  name: string;
  grade?: string;
  people?: number;
  monthly7: number;  // Jセブン月額料金
  monthly9: number;  // Jナイン月額料金
  fullprice: number;
  detailUrl: string;
  imageUrl: string;
}
```

### オプションデータ
```typescript
interface CarOption {
  id: string;
  name: string;
  price: number;
}
```

## 🔧 主要機能の実装詳細

### 状態管理
- Zustandを使用したグローバル状態管理
- ローカルストレージへの永続化
- 車両、オプション、売却額の状態を一元管理

### リース計算ロジック
- プラン別のリース期間計算
- オプション料金の月額換算
- 売却額を考慮した節約効果計算

### UI/UX
- レスポンシブデザイン
- インライン編集による直感的な操作
- リアルタイム計算結果表示

## 🐛 トラブルシューティング

### よくある問題

1. **ホバーエフェクトが効かない**
   - ローカル環境ではTailwind CSS v4の処理の違いにより発生する場合があります
   - 本番環境では正常に動作します

2. **ビルドエラー**
   - TypeScriptの型エラーが発生した場合は、型定義を確認してください
   - `npm run lint`でエラーを事前にチェックできます

## 📝 開発メモ

- Tailwind CSS v4を使用（`transform`クラスは不要）
- カスタムCSSクラス（`.hover-lift`）でホバーエフェクトを実装
- 状態の永続化により、ページリロード後も入力内容を保持

## 📄 ライセンス

このプロジェクトはプライベートプロジェクトです。

## 👥 開発者向け情報

詳細な開発者向け情報は `HANDOVER.md` を参照してください。