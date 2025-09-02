# TFV7-Web 引継ぎ資料

## 📋 プロジェクト概要

**プロジェクト名**: TFV7-Web  
**目的**: トランスファーV（TFV）のリース料金シミュレーションWebアプリケーション  
**開発期間**: 2024年  
**技術スタック**: Next.js 15.5.2 + TypeScript + Tailwind CSS v4 + Zustand  

## 🎯 ビジネス要件

### 主要機能
1. **プラン選択**: Jセブン（7ヶ月リース）とJナイン（9ヶ月リース）
2. **車両選択**: 推奨車両から複数台選択（最大3台）
3. **オプション設定**: 各車両に個別のオプション料金を設定
4. **売却額設定**: 売却対象車両の売却額を設定
5. **料金計算**: 総合的なリース料金計算と節約効果の表示

### ビジネスロジック
- **Jセブン**: 7ヶ月リース、月額料金は`monthly7`フィールドを使用
- **Jナイン**: 9ヶ月リース、月額料金は`monthly9`フィールドを使用
- **売却対象**: 1台のみの場合は売却なし、2台の場合は1台目のみ、3台の場合は1,2台目
- **オプション料金**: リース期間で割って月額料金に加算

## 🏗 アーキテクチャ

### 技術スタック詳細
- **Next.js 15.5.2**: App Router使用、Turbopack有効
- **React 19.1.0**: 最新のReact機能を使用
- **TypeScript**: 型安全性の確保
- **Tailwind CSS v4**: 最新のTailwind CSS（`transform`クラス不要）
- **Zustand**: 軽量な状態管理、ローカルストレージ永続化

### ディレクトリ構造
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホームページ
│   ├── layout.tsx         # ルートレイアウト
│   ├── globals.css        # グローバルスタイル
│   └── simulate/
│       └── [plan]/        # 動的ルーティング
│           ├── input/     # 入力画面
│           └── result/    # 結果画面
├── components/            # Reactコンポーネント
│   ├── CarCard.tsx        # 車両カード（メインコンポーネント）
│   ├── PickerModal.tsx    # 車両選択モーダル
│   ├── AddButton.tsx      # 車両追加ボタン
│   └── OptionModal.tsx    # オプション選択モーダル（未使用）
├── data/                  # 静的データ
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

## 🔧 主要コンポーネント

### 1. CarCard.tsx
**役割**: 車両の詳細表示とオプション・売却額設定

**主要機能**:
- 車両情報の表示（画像、名前、月額料金）
- オプション設定（動的入力フィールド）
- 売却額設定（条件付き表示）
- オプション料金反映ボタン
- 1台目のオプションコピー機能

**重要な実装**:
```typescript
// オプション入力フィールドの管理
const [inputFields, setInputFields] = useState<Array<{ id: string; name: string; price: string }>>([]);

// 売却対象の判定
const isResale = isResaleTarget(totalCars, carIndex);

// オプション料金の月額換算
const additionalMonthlyPrice = Math.floor(totalOptionPrice / leaseMonths);
```

### 2. useLeaseCalc.ts
**役割**: リース料金計算の核心ロジック

**計算項目**:
- 車両価格合計
- 税金（10%）
- オプション料金合計
- 諸費用（台数×70,000円）
- リース料金（プラン別）
- 売却額合計
- 節約効果

**重要な実装**:
```typescript
// プラン別月額料金の取得
const monthly = plan === 'j7' ? (m?.monthly7 ?? 0) : (m?.monthly9 ?? 0);

// 売却対象車両の判定と売却額計算
cars.forEach((car, index) => {
  if (isResaleTarget(cars.length, index)) {
    const resalePrice = resalePricesMap.get(car.id) || 0;
    resaleTotal += resalePrice;
  }
});
```

### 3. simStore.ts
**役割**: グローバル状態管理

**管理する状態**:
- `plan`: 選択されたプラン
- `cars`: 選択された車両一覧
- `carOptionsArray`: 車両別オプション
- `carResalePrices`: 車両別売却額
- `carAdditionalMonthlyPrices`: 車両別追加月額料金
- `result`: 計算結果

**永続化**: ローカルストレージに自動保存

## 📊 データフロー

### 1. 初期状態
```
ホームページ → プラン選択 → 入力画面
```

### 2. 入力フロー
```
車両選択 → オプション設定 → 売却額設定 → 計算実行
```

### 3. 状態管理フロー
```
CarCard (ローカル状態) → オプション料金反映 → Zustandストア → 計算結果
```

### 4. 計算フロー
```
入力完了 → useLeaseCalc → 結果画面
```

## 🎨 UI/UX設計

### デザインシステム
- **カラーパレット**: オレンジ（#fc844f）をアクセントカラー
- **背景色**: ベージュ（#f4f3f0）
- **フォント**: システムフォント（Arial, Helvetica, sans-serif）

### レスポンシブ対応
- モバイルファーストデザイン
- Tailwind CSSのブレークポイント使用
- 画像の最適化（Next.js Image使用推奨）

### インタラクション
- ホバーエフェクト（カスタムCSS `.hover-lift`）
- リアルタイム計算結果表示
- インライン編集による直感的操作

## 🔍 重要な実装詳細

### 1. オプション設定の実装
```typescript
// 動的入力フィールドの管理
const addInputField = () => {
  const newField = {
    id: `field_${Date.now()}_${Math.random()}`,
    name: '',
    price: ''
  };
  setInputFields([...inputFields, newField]);
};

// オプション料金反映
const handleApplyOptions = () => {
  let totalOptionPrice = 0;
  inputFields.forEach(fieldData => {
    if (Number(fieldData.price) > 0) {
      totalOptionPrice += Number(fieldData.price);
    }
  });
  
  const additionalMonthlyPrice = Math.floor(totalOptionPrice / leaseMonths);
  setAdditionalMonthlyPrice(additionalMonthlyPrice);
  onUpdateMonthlyPrice(carId, additionalMonthlyPrice);
};
```

### 2. 売却額設定の条件分岐
```typescript
// utils/lease.ts
export const isResaleTarget = (total: number, index: number): boolean => {
  if (total === 1) return false;  // 1台のみの場合は売却対象なし
  if (total === 2) return index === 0;  // 2台の場合は1台目のみ
  return index < 2;  // 3台の場合は1,2台目
};
```

### 3. 状態の永続化
```typescript
// Zustandストアの永続化設定
export const useSimStore = create<SimState>()(
  persist(
    (set) => ({ /* 状態定義 */ }),
    { name: "sim-state" }  // ローカルストレージのキー名
  )
);
```

## 🐛 既知の問題と対処法

### 1. ホバーエフェクトの問題
**問題**: ローカル環境でホバーエフェクトが効かない  
**原因**: Tailwind CSS v4の開発環境での処理の違い  
**対処法**: カスタムCSSクラス `.hover-lift` を使用  
**本番環境**: 正常に動作

### 2. 型エラーの対処
**問題**: TypeScriptの型エラー  
**対処法**: `CarOption`型の定義を統一
```typescript
interface CarOption {
  id: string;
  name: string;
  price: number;
}
```

### 3. 状態の同期問題
**問題**: 計算後に入力画面に戻ると状態がリセットされる  
**対処法**: Zustandストアからの状態復元を実装

## 🚀 デプロイメント

### Vercel設定
- **フレームワーク**: Next.js
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `.next`
- **Node.jsバージョン**: 18.x

### 環境変数
現在、環境変数は不要

### ビルド最適化
- Turbopack使用（`--turbopack`フラグ）
- 自動的な画像最適化
- コード分割とバンドル最適化

## 📈 パフォーマンス

### 最適化済み項目
- 画像の遅延読み込み
- コンポーネントのメモ化
- 状態の効率的な管理

### 監視項目
- ページ読み込み速度
- 計算処理のレスポンス時間
- メモリ使用量

## 🔮 今後の拡張予定

### 機能拡張
1. **新しいプランの追加**: Jプレミアムなど
2. **車両データの動的取得**: API連携
3. **PDF出力機能**: 計算結果のPDF生成
4. **履歴機能**: 過去の計算結果の保存

### 技術的改善
1. **テストの追加**: Jest + React Testing Library
2. **E2Eテスト**: Playwright
3. **パフォーマンス監視**: Vercel Analytics
4. **エラーハンドリング**: Sentry連携

## 📞 サポート情報

### 開発環境のセットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルドテスト
npm run build
```

### デバッグ方法
1. ブラウザの開発者ツールでコンソールログを確認
2. Zustandストアの状態を確認
3. ネットワークタブでAPI呼び出しを確認

### 緊急時の対処
1. Vercelダッシュボードでデプロイ状況を確認
2. ローカル環境でビルドエラーを確認
3. 必要に応じてロールバック

---

**最終更新**: 2024年12月  
**作成者**: AI Assistant  
**レビュー**: 未実施
