
let uploadedImg = null;
let nameInput;
let vrcIdInput;
let messageInput;
let fileInput;

function setup() {
  // キャンバス作成 (名刺サイズ比率に近い 450x280)
  const cnv = createCanvas(450, 280);
  cnv.parent('preview-canvas-container');
  
  // 初期描画
  background(255);
  textAlign(LEFT, TOP);
  noLoop();

  // 入力要素の取得
  nameInput = select("#name");
  vrcIdInput = select("#inVRC");
  messageInput = select("#message");
  fileInput = select("#file-img");

  // 入力が変更されたら再描画するイベントを設定
  nameInput.input(redrawCard);
  vrcIdInput.input(redrawCard);
  messageInput.input(redrawCard);
  
  // ファイルが選択された時の処理
  fileInput.elt.addEventListener('change', handleFile, false);

  // 初回描画
  redrawCard();
}

function handleFile(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      loadImage(event.target.result, (img) => {
        uploadedImg = img;
        redrawCard();
      });
    };
    reader.readAsDataURL(file);
  }
}

function redrawCard() {
  // 1. 背景 (白固定)
  background(255);

  // レイアウト定数
  const padding = 25;
  const accentColor = color(76, 175, 80); // #4CAF50 (ヘッダーの緑と合わせる)
  const textColor = color(33, 33, 33);
  const subTextColor = color(100, 100, 100);
  const lineColor = color(220, 220, 220);

  // 2. 左側のアクセントライン
  noStroke();
  fill(accentColor);
  rect(0, 0, 12, height);

  // コンテンツの開始X位置
  const contentX = padding + 12; // ラインの幅分ずらす
  const contentWidth = width - contentX - padding;

  // 3. 画像描画エリア (右上)
  const imgSize = 90;
  const imgX = width - padding - imgSize;
  const imgY = padding;

  if (uploadedImg) {
    // アスペクト比を維持して中央に配置
    let aspect = uploadedImg.width / uploadedImg.height;
    let drawW = imgSize;
    let drawH = imgSize;
    if (aspect > 1) {
       drawH = imgSize / aspect;
    } else {
       drawW = imgSize * aspect;
    }
    
    imageMode(CENTER);
    image(uploadedImg, imgX + imgSize/2, imgY + imgSize/2, drawW, drawH);
    imageMode(CORNER);
    
    // 画像の枠線
    noFill();
    stroke(200);
    strokeWeight(1);
    rect(imgX, imgY, imgSize, imgSize);
  } else {
    // プレースホルダー
    fill(245);
    stroke(220);
    strokeWeight(1);
    rect(imgX, imgY, imgSize, imgSize);
    
    fill(180);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text("No Image", imgX + imgSize/2, imgY + imgSize/2);
  }

  // 4. テキスト情報 (左上)
  const name = nameInput.value() || "Name";
  const vrcId = vrcIdInput.value() || "ID";

  textAlign(LEFT, TOP);
  noStroke();

  // 名前
  fill(textColor);
  textStyle(BOLD);
  let nameSize = 28;
  if (name.length > 8) nameSize = 22; // 長い名前は小さく
  textSize(nameSize);
  text(name, contentX, padding + 5);

  // VRChat ID
  fill(subTextColor);
  textStyle(NORMAL);
  textSize(14);
  text("@" + vrcId, contentX, padding + nameSize + 12);

  // 5. 仕切り線
  stroke(lineColor);
  strokeWeight(1);
  const lineY = imgY + imgSize + 20;
  line(contentX, lineY, width - padding, lineY);

  // 6. メッセージ (下部)
  const message = messageInput.value() || "ここにメッセージが表示されます。\n自己紹介やプレイスタイルなどを入力してください。";
  
  noStroke();
  fill(50);
  textSize(14);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  
  // メッセージボックスの範囲
  // Y位置: 仕切り線の下 + マージン
  // 幅: 全体のコンテンツ幅
  text(message, contentX, lineY + 15, contentWidth, height - (lineY + 25));
}

function draw() {
  // noLoopなので実行されない
}
