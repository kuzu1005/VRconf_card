const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// フロントエンドのfilesをそのまま配信する設定
app.use(express.static(path.join(__dirname, '../front')));

// どのURLにアクセスしてもindex.htmlを返す (SPAフォールバック)
// Express 5.xでは '*' や無名キャプチャグループの正規表現でエラーになるため、
// パターンマッチングを行わない app.use を最後尾に配置して対応
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../front/index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Firebaseの処理はすべてフロントエンド(index.js)で行われます。');
});