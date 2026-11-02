# MINI//LOOP

広告で見かける「あのミニゲーム」を、本当に遊べるブラウザゲーム集。日本語対応・無料・登録不要・スマートフォン対応。

## ゲーム

| ゲーム | 内容 | ステージ |
| --- | --- | ---: |
| ウォーターソート | 試験管の色をそろえるパズル。取り消し・自己ベスト記録あり | 5 |
| パーキングジャム | 車を横・縦に動かし、赤い車を出口へ。5面とも探索で解法確認済み | 5 |
| ゲートラッシュ | 加減乗除の2択ゲートを進んで目標人数を達成 | 5 |

すべてオリジナルの静的 HTML/CSS/JavaScript で動作します。依存ライブラリ・ビルド処理・サーバー処理はありません。記録は端末の `localStorage` に保存します。

## ローカルで遊ぶ

```bash
cd mini-ad-arcade
python3 -m http.server 8765
```

ブラウザで http://localhost:8765/ を開いてください。

## GitHub Pages で公開する

公開リポジトリなので GitHub Pages を有効にするだけで公開できます。

1. GitHub リポジトリの **Settings → Pages** に移動する
2. **Build and deployment → Source** で **Deploy from a branch** を選ぶ
3. **Branch: main / (root)** に設定し、**Save** を押す
4. GitHub Actions の公開ジョブ完了後、`https://lovingthenhk-cpu.github.io/mini-ad-arcade/` でプレイ可能になります

設定後は `main` への push ごとに GitHub Pages が自動で更新されます。

## 検証

- 3ゲームすべて、ブラウザ上で最初のステージをプレイしてクリアを確認
- ウォーターソート全5面を状態探索で解答可能と確認
- パーキングジャム全5面を `node tests/parking-solver.mjs` で解答可能と確認
- ゲートラッシュ全5面を全選択分岐で目標到達可能と確認
- Chromium スマートフォン幅で表示を確認

## 著作権

UI・ゲームロジックはこのプロジェクトのために作成。広告動画や他社ゲームの素材の複製は行っていません。
