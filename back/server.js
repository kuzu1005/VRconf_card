const express = require('express');
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');

// サービスアカウントキーのJSONファイルを読み込む
const serviceAccount = require('../vrconf-6e247-firebase-adminsdk-fbsvc-b2e2cb85a6.json'); // ダウンロードしたJSONファイルのパスを指定

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://vrconf-6e247.firebasestorage.app' // FirebaseプロジェクトのStorageバケット名に置き換える
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const port = 3000;

// Multerの設定
// ファイルをメモリに一時的に保存する設定 (Firebase Storageに直接アップロードするため)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MBまで
    }
});

// 静的ファイルの配信設定
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '../front'))); // frontフォルダを静的配信

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/index.html'));
});

// 名刺作成APIエンドポイント
app.post('/api/create-business-card', upload.single('file-img'), async (req, res) => {
    const { name, inVRC, message } = req.body;
    const profileImageFile = req.file;

    if (!name || !inVRC || !profileImageFile) {
        return res.status(400).json({ error: '名前、VRChatの名前、プロフィール画像は必須です。' });
    }

    try {
        let imageUrl = null;
        if (profileImageFile) {
            // Firebase Storageへのアップロード
            const filename = `profile_images/${Date.now()}-${profileImageFile.originalname}`;
            const file = bucket.file(filename);

            await file.save(profileImageFile.buffer, {
                contentType: profileImageFile.mimetype,
                public: true, // 公開アクセス可能にする (必要に応じてセキュリティルールで制限する)
                metadata: {
                    contentType: profileImageFile.mimetype,
                },
            });

            // 公開URLを取得
            imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            console.log('プロフィール画像がFirebase Storageにアップロードされました:', imageUrl);
        }

        // Cloud Firestoreへのデータ保存
        const docRef = await db.collection('businessCards').add({
            name: name,
            inVRC: inVRC,
            message: message,
            profileImageUrl: imageUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp() // サーバー側のタイムスタンプ
        });

        console.log('名刺情報がCloud Firestoreに保存されました。Document ID:', docRef.id);

        res.status(200).json({
            message: '名刺情報が正常に保存されました。',
            data: {
                id: docRef.id,
                name: name,
                inVRC: inVRC,
                message: message,
                profileImageUrl: imageUrl
            }
        });

    } catch (error) {
        console.error('データの保存またはアップロード中にエラーが発生しました:', error);
        res.status(500).json({ error: 'サーバーエラーにより名刺情報を保存できませんでした。' });
    }
});

// サーバーを起動
app.listen(port,'0.0.0.0', () => {
    console.log(`サーバーが http://localhost:${port} で起動しました。`);
    console.log('ブラウザで http://localhost:3000/index.html にアクセスしてください。');
});