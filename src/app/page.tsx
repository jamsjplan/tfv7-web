"use client";
import { useState, useRef, useMemo } from "react";

// -----------------------------
// データ定義（JAMS おすすめ車）
// -----------------------------
export type RecommendedCar = {
  id: string;
  maker: string;
  name: string;
  grade?: string;
  people?: string;
  monthly?: number; // 税込・円（数値）
  detailUrl: string;
  imageUrl?: string;
  price: number; // 車両代（比較用・ここではダミー値でもOK）
};

const RECOMMENDED: RecommendedCar[] = [
  {
    id: "wgnr",
    maker: "スズキ",
    name: "ワゴンR",
    grade: "HYBRID FX-S",
    people: "4人",
    monthly: 26950,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=81350",
    imageUrl: "/cars/suzuki/ワゴンR.jpg",
    price: 1500000,
  },
  {
    id: "tanto",
    maker: "ダイハツ",
    name: "タント",
    grade: "X",
    people: "4人",
    monthly: 29480,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=82950",
    imageUrl: "/cars/daihatsu/タント.jpg",
    price: 1500000,
  },
  {
    id: "wgnrsmile",
    maker: "スズキ",
    name: "ワゴンRスマイル",
    grade: "HYBRID S",
    people: "4人",
    monthly: 31020,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=82264",
    imageUrl: "/cars/suzuki/ワゴンRスマイル.jpg",
    price: 1500000,
  },
  {
    id: "nbox",
    maker: "ホンダ",
    name: "N BOX",
    people: "4人",
    monthly: 31900,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=81437",
    imageUrl: "/cars/honda/N BOX.jpg",
    price: 1500000,
  },
  {
    id: "spacia-custom",
    maker: "スズキ",
    name: "スペーシアカスタム",
    grade: "HYBRID GS",
    people: "4人",
    monthly: 32450,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=82010",
    imageUrl: "/cars/suzuki/スペーシアカスタム.jpg",
    price: 1500000,
  },
  {
    id: "every-wagon",
    maker: "スズキ",
    name: "エブリイワゴン 標準ルーフ",
    grade: "PZターボ",
    people: "4人",
    monthly: 33550,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=81234",
    imageUrl: "/cars/suzuki/エブリイワゴン.jpg",
    price: 1500000,
  },
  {
    id: "swift-mx-2",
    maker: "スズキ",
    name: "スイフト",
    grade: "HYBRID MX",
    people: "5人",
    monthly: 37620,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=83002",
    imageUrl: "/cars/suzuki/スイフト.jpg",
    price: 1500000,
  },
  {
    id: "freed-air-ex",
    maker: "ホンダ",
    name: "フリード",
    grade: "AIR EX 6人乗り",
    people: "6人",
    monthly: 52690,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=82555",
    imageUrl: "/cars/honda/フリード.jpg",
    price: 1500000,
  },
  {
    id: "prius-g",
    maker: "トヨタ",
    name: "プリウス",
    grade: "G (ハイブリッド)",
    people: "5人",
    monthly: 57750,
    detailUrl: "https://www.jams-cars.jp/car_details/?g=5&id=82888",
    imageUrl: "/cars/toyota/プリウス.jpg",
    price: 1500000,
  },
];

// -----------------------------
// 型 & ヘルパー
// -----------------------------
export type CarRow = {
  id: number;
  modelId?: string;
};

// 契約月数
const getLeaseMonths = (total: number, index: number) => {
  if (total === 1) return 84;
  if (total === 2) return index === 0 ? 38 : 46;
  if (total === 3) return index < 2 ? 38 : 8;
  return 0;
};

export default function SevenYearComparison() {
  // 最初は0台、＋カードから追加
  const [cars, setCars] = useState<CarRow[]>([]);
  const nextId = useRef(1);
  const [pickerOpenFor, setPickerOpenFor] = useState<number | "new" | null>(null);

  // 計算用
  const optionPrice = 300000;
  const miscFee = 70000;

  const [result, setResult] = useState<{
    carPriceTotal: number;
    optionTotal: number;
    miscTotal: number;
    taxTotal: number;
    totalPurchase: number;
    tfvTotal: number;
    resaleCount: number;
    resaleTotal: number;
    savings: number;
    monthsAlloc: number[];
    error?: string;
  } | null>(null);

  const modelMap = useMemo(() => {
    const map = new Map<string, RecommendedCar>();
    for (const c of RECOMMENDED) map.set(c.id, c);
    return map;
  }, []);

  const handleRemoveCar = (id: number) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelectModel = (modelId: string) => {
    if (pickerOpenFor === "new") {
      setCars((prev) => [...prev, { id: nextId.current++, modelId }]);
    } else if (typeof pickerOpenFor === "number") {
      setCars((prev) =>
        prev.map((c) => (c.id === pickerOpenFor ? { ...c, modelId } : c))
      );
    }
    setPickerOpenFor(null);
  };

  const handleCalculate = () => {
    if (cars.length === 0 || cars.some((c) => !c.modelId)) {
      setResult({
        carPriceTotal: 0,
        optionTotal: 0,
        miscTotal: 0,
        taxTotal: 0,
        totalPurchase: 0,
        tfvTotal: 0,
        resaleCount: 0,
        resaleTotal: 0,
        savings: 0,
        monthsAlloc: [],
        error: "車種を選択してください",
      });
      return;
    }

    const len = cars.length;
    let monthsAlloc: number[] = [];
    if (len === 1) monthsAlloc = [84];
    else if (len === 2) monthsAlloc = [38, 46];
    else if (len === 3) monthsAlloc = [38, 38, 8];
    else {
      setResult({
        carPriceTotal: 0,
        optionTotal: 0,
        miscTotal: 0,
        taxTotal: 0,
        totalPurchase: 0,
        tfvTotal: 0,
        resaleCount: 0,
        resaleTotal: 0,
        savings: 0,
        monthsAlloc: [],
        error: "1〜3台の間で選択してください",
      });
      return;
    }

    const carPriceTotal = cars.reduce(
      (sum, c) => sum + (modelMap.get(c.modelId!)?.price ?? 0),
      0
    );

    const optionTotal = optionPrice * cars.length;
    const miscTotal = miscFee * cars.length;
    const taxTotal = Math.floor((carPriceTotal + optionTotal + miscTotal) * 0.1);
    const totalPurchase = carPriceTotal + optionTotal + miscTotal + taxTotal;

    const tfvTotal = cars.reduce((sum, c, idx) => {
      const m = modelMap.get(c.modelId!);
      const monthly = m?.monthly ?? 0;
      const months = monthsAlloc[idx] ?? 0;
      return sum + monthly * months;
    }, 0);

    const resaleCount = Math.max(cars.length - 1, 0);
    const resaleTotal = 1450000 * resaleCount;
    const savings = totalPurchase - (tfvTotal + resaleTotal);

    setResult({
      carPriceTotal,
      optionTotal,
      miscTotal,
      taxTotal,
      totalPurchase,
      tfvTotal,
      resaleCount,
      resaleTotal,
      savings,
      monthsAlloc,
    });
  };

  return (
    <div className="bg-[#f4f3f0] min-h-screen w-full">
      {/* 中央寄せコンテンツ */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="p-4 rounded">
          <h1 className="text-2xl font-bold text-gray-800">
            Jセブン料金計算シミュレーション
          </h1>
          <div className="border-b-2 border-[#fc844f] mt-1 mb-2"></div>
          <p className="text-sm text-gray-600">
            条件を選ぶだけで、Jセブンの料金を簡単にシミュレーションできます。
          </p>
        </div>

        {/* 車両カード */}
        <div className="flex flex-col gap-3 mb-6">
          {cars.map((car, index) => {
            const selected = car.modelId ? modelMap.get(car.modelId) : undefined;
            const leaseMonths = getLeaseMonths(cars.length, index);

            return (
              <div key={car.id} className="rounded-2xl bg-white shadow p-6">
                <div className="flex gap-6 items-start">
                  {/* 画像＋タイトル */}
                  <div className="shrink-0 relative">
                    {/* 左上タイトル */}
                    <div className="absolute top-0 left-0 bg-white/80 px-2 py-1 rounded-br-lg text-sm font-bold text-gray-900">
                      {selected ? `${selected.maker}｜${selected.name}` : "（車種未選択）"}
                    </div>

                    {/* 画像 */}
                    {selected?.imageUrl ? (
                      <img
                        src={selected.imageUrl}
                        alt={selected.name}
                        className="w-56 h-40 object-contain bg-white rounded-xl"
                      />
                    ) : (
                      <div className="w-56 h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">
                        画像
                      </div>
                    )}
                  </div>

                  {/* 右側情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        {/* gradeや乗車人数 */}
                        <div className="text-sm text-gray-600 mt-1">
                          {selected ? `${selected.grade ?? ""} ${selected.people ?? ""}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* ゴミ箱ボタン */}
                        <button
                          onClick={() => handleRemoveCar(car.id)}
                          aria-label={`車両${index + 1}を削除`}
                          className="p-2 text-gray-500 hover:text-red-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-7 h-7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 7h12M9 7V4h6v3m-9 4h12l-1 9H8l-1-9z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* 月額 */}
                    <div className="mt-4">
                      <div className="text-sm text-[#fc844f] font-semibold">月額（税込）</div>
                      <div className="flex items-end gap-2">
                        <div className="text-4xl font-extrabold text-[#fc844f] leading-none">
                          {selected?.monthly ? selected.monthly.toLocaleString() : "―"}
                        </div>
                        <div className="text-base text-gray-700">円</div>
                      </div>
                    </div>

                    {/* タグ */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected?.grade && (
                        <span className="inline-block rounded-md bg-gray-100 text-gray-700 text-xs px-2 py-1">
                          グレード {selected.grade}
                        </span>
                      )}
                      {selected?.people && (
                        <span className="inline-block rounded-md bg-gray-100 text-gray-700 text-xs px-2 py-1">
                          乗車 {selected.people}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 下部 */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 pt-4 gap-4 border-t">
                  <div>
                    <div className="text-xs text-gray-500">継承希望月</div>
                    <div className="text-lg text-gray-800 mt-1">—</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">継承するリース期間</div>
                    <div className="text-lg text-gray-800 mt-1">
                      {leaseMonths > 0 ? `${leaseMonths}ヶ月` : "—"}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPickerOpenFor(car.id)}
                  className="mt-3 text-sm text-indigo-600 hover:underline cursor-pointer text-right"
                >
                  &lt; 車種を選び直す
                </div>
              </div>

            );
          })}

          {/* ＋カード */}
          {cars.length < 3 && (
            <button
              onClick={() => setPickerOpenFor("new")}
              className="flex flex-col items-center justify-center 
                        rounded-xl h-20 w-full text-[#fc844f] cursor-pointer
                        bg-white shadow"
            >
              <span className="text-3xl font-bold leading-none">＋</span>
              <span className="mt-1 text-xs">車両を追加</span>
            </button>
          )}
        </div>

        {/* 計算ボタン */}
        <button
          onClick={handleCalculate}
          disabled={cars.length === 0 || cars.some((c) => !c.modelId)}
          className={`w-full rounded-[30px] text-white text-[1.6rem] py-3 px-8 ${cars.length === 0 || cars.some((c) => !c.modelId)
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#fc844f] hover:opacity-80 cursor-pointer"
            }`}
        >
          計算
        </button>

        {/* 結果表示 */}
        {result && (
          <div className="mt-8 space-y-4">
            {result.error && (
              <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                {result.error}
              </div>
            )}

            {!result.error && (
              <>
                <div className="text-sm text-gray-700">
                  契約月数の内訳:{" "}
                  {result.monthsAlloc.map((m, i) => `${i + 1}台目 ${m}か月`).join(" ・ ")}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* 購入パターン */}
                  <div className="flex-1 bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-bold mb-2">普通に購入した場合</h2>
                    <table className="table-auto border-collapse w-full">
                      <tbody>
                        <tr>
                          <td className="p-2">車両代合計</td>
                          <td className="p-2 text-right">
                            ¥{result.carPriceTotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2">オプション合計</td>
                          <td className="p-2 text-right">
                            ¥{result.optionTotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2">諸費用合計</td>
                          <td className="p-2 text-right">
                            ¥{result.miscTotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2">消費税（10%）</td>
                          <td className="p-2 text-right">
                            ¥{result.taxTotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-red-600">
                            総購入額（{cars.length}台分）
                          </td>
                          <td className="p-2 text-right font-bold text-red-600">
                            ¥{result.totalPurchase.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* リースパターン */}
                  <div className="flex-1 bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-bold mb-2">リースを利用した場合</h2>
                    <table className="table-auto border-collapse w-full">
                      <tbody>
                        <tr>
                          <td className="p-2">リース料合計（TFV）</td>
                          <td className="p-2 text-right font-semibold">
                            ¥{result.tfvTotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2">売却額（{result.resaleCount}台）</td>
                          <td className="p-2 text-right">
                            ¥{result.resaleTotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-green-700">
                            7年間の出費合計（リース利用）
                          </td>
                          <td className="p-2 text-right font-bold text-green-700">
                            ¥{(result.tfvTotal + result.resaleTotal).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 節約額 */}
                <div className="bg-red-600 text-white text-center text-2xl font-bold p-6 rounded">
                  7年間の出費節約額！ <br />
                  ¥{result.savings.toLocaleString()}
                </div>
              </>
            )}
          </div>
        )}

        {/* モーダル */}
        {pickerOpenFor !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setPickerOpenFor(null)}
            />
            <div className="relative bg-white shadow-xl w-full max-w-[900px] max-h-[85vh] overflow-y-auto p-6">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold">おすすめ車から選択</h3>
                <button
                  onClick={() => setPickerOpenFor(null)}
                  className="ml-auto text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  閉じる
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {RECOMMENDED.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectModel(c.id)}
                    className="rounded-lg cursor-pointer transition group bg-white shadow"
                  >
                    <div className="p-2">
                      <div className="text-xs text-gray-700">{c.maker}</div>
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-gray-500">
                        {c.grade ?? ""} {c.people ?? ""}
                      </div>
                    </div>
                    <div className="flex justify-center items-center py-4">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="h-24 object-contain transition group-hover:opacity-60"
                        />
                      ) : (
                        <div className="h-24 w-full flex items-center justify-center text-gray-400 text-sm">
                          画像なし
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-100 p-2 text-center text-sm">
                      月額:{" "}
                      <span className="text-red-600 font-bold text-lg">
                        ¥{c.monthly?.toLocaleString() ?? "―"}
                      </span>
                      <span className="text-xs text-gray-600">（税込）</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
