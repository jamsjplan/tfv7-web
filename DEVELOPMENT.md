# 開発者向けクイックスタートガイド

## 🚀 クイックスタート

### 1. 環境セットアップ
```bash
# リポジトリをクローン
git clone <repository-url>
cd tfv7-web

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 2. アクセス
- ローカル: http://localhost:3000
- 本番: https://tfv7-web.vercel.app

## 🔧 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint

# 型チェック
npx tsc --noEmit
```

## 📁 主要ファイルの場所

### ページ
- `src/app/page.tsx` - ホームページ
- `src/app/simulate/[plan]/input/page.tsx` - 入力画面
- `src/app/simulate/[plan]/result/page.tsx` - 結果画面

### コンポーネント
- `src/components/CarCard.tsx` - 車両カード（メイン）
- `src/components/PickerModal.tsx` - 車両選択モーダル
- `src/components/AddButton.tsx` - 車両追加ボタン

### 状態管理
- `src/store/simStore.ts` - Zustandストア

### 計算ロジック
- `src/hooks/useLeaseCalc.ts` - リース計算
- `src/utils/lease.ts` - ユーティリティ関数

### データ
- `src/data/recommended.ts` - 推奨車両データ
- `src/types/cars.ts` - 型定義
- `src/types/plan.ts` - プラン型定義

## 🎯 主要機能の実装場所

### オプション設定
**場所**: `src/components/CarCard.tsx`
- 動的入力フィールドの管理
- オプション料金の計算
- 月額料金への反映

### 売却額設定
**場所**: `src/components/CarCard.tsx`
- 条件付き表示（`isResaleTarget`）
- バリデーション
- 状態管理

### リース計算
**場所**: `src/hooks/useLeaseCalc.ts`
- プラン別料金計算
- オプション料金の合計
- 売却額の計算
- 節約効果の算出

## 🐛 デバッグ方法

### 1. 状態の確認
```typescript
// ブラウザの開発者ツールで実行
console.log(useSimStore.getState());
```

### 2. 計算結果の確認
```typescript
// useLeaseCalcの結果を確認
const { calculate } = useLeaseCalc({...});
const result = calculate();
console.log(result);
```

### 3. コンポーネントの状態確認
```typescript
// CarCardの状態を確認
console.log('inputFields:', inputFields);
console.log('resalePrice:', resalePrice);
console.log('additionalMonthlyPrice:', additionalMonthlyPrice);
```

## 🔍 よくある問題と解決方法

### 1. ホバーエフェクトが効かない
**問題**: ローカル環境でホバーエフェクトが動作しない  
**解決**: カスタムCSSクラス `.hover-lift` を使用済み

### 2. 型エラー
**問題**: TypeScriptの型エラー  
**解決**: `CarOption`型の定義を統一済み

### 3. 状態がリセットされる
**問題**: 計算後に入力画面に戻ると状態がリセット  
**解決**: Zustandストアからの状態復元を実装済み

### 4. ビルドエラー
**問題**: ビルド時にエラーが発生  
**解決**: 
```bash
# リンターでエラーをチェック
npm run lint

# 型チェック
npx tsc --noEmit
```

## 📊 パフォーマンス最適化

### 実装済み
- コンポーネントのメモ化
- 状態の効率的な管理
- 画像の最適化

### 監視項目
- ページ読み込み速度
- 計算処理のレスポンス時間
- メモリ使用量

## 🧪 テスト

### 現在の状況
- テストは未実装
- 手動テストで動作確認

### 今後の予定
- Jest + React Testing Library
- Playwright（E2Eテスト）

## 📝 コーディング規約

### TypeScript
- 型定義を必ず作成
- `any`型の使用を避ける
- インターフェース名は大文字で開始

### React
- 関数コンポーネントを使用
- カスタムフックでロジックを分離
- propsの型定義を必須

### CSS
- Tailwind CSSクラスを優先
- カスタムCSSは最小限
- レスポンシブデザインを考慮

## 🚀 デプロイ

### 自動デプロイ
- mainブランチへのプッシュで自動デプロイ
- Vercelで管理

### 手動デプロイ
```bash
# ビルドテスト
npm run build

# Vercel CLIでデプロイ
vercel --prod
```

## 📞 サポート

### 問題報告
1. ブラウザの開発者ツールでエラーを確認
2. コンソールログを確認
3. 必要に応じてスクリーンショットを取得

### 緊急時
1. Vercelダッシュボードでデプロイ状況を確認
2. ローカル環境でビルドエラーを確認
3. 必要に応じてロールバック

---

**更新日**: 2024年12月  
**バージョン**: 1.0.0
