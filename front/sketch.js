let uploadedImg = null;

function setup() {
  const cnv = createCanvas(400, 250);
  cnv.parent('preview-image');
  textSize(40);
  noLoop();

  // 名前入力で再描画
  select("#name").input(redraw);
  select("#message").input(redraw);
  // 画像ファイル選択時の処理
  const fileInput = select("#file-img");
  fileInput.changed(handleFile);
}

function handleFile() {
  const fileInput = select("#file-img").elt;
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    loadImage(e.target.result, img => {
      uploadedImg = img;
      redraw();
    });
  };
  reader.readAsDataURL(file);
}

function draw() {
  clear();
  stroke(32);
  rect(0, 0, 400, 250);

  // 画像があれば表示
  if (uploadedImg) {
    image(uploadedImg, 270, 10, 120, 120);
  }

  const name = select("#name").value();
  const message = select("#message").value();
  textSize(name.length>3?(50/(name.length-2))+17:50);
  text(name, 20, 80);
  textSize(20);
  text(message, 30, 170);
}