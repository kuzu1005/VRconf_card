import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// あなたのFirebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCNSOjDV8YeJW0D1WCwUUP-j5Y9of3VSVQ",
  authDomain: "vrconf-6e247.firebaseapp.com",
  projectId: "vrconf-6e247",
  storageBucket: "vrconf-6e247.firebasestorage.app",
  messagingSenderId: "1047833797057",
  appId: "1:1047833797057:web:f2e515d3b6076af5520f40",
  measurementId: "G-1Z0QWWCF5C"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// フォーム送信処理
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('card-form');
    const submitBtn = document.getElementById('main-submit');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // デフォルトの送信（画面遷移）を防ぐ

        if (!form.reportValidity()) return; // 入力チェック

        // ボタンを無効化
        submitBtn.disabled = true;
        submitBtn.textContent = '認証中...';

        try {
            // 1. 匿名ログイン試行
            let user;
            try {
                const userCredential = await signInAnonymously(auth);
                user = userCredential.user;
                console.log("ログイン成功 UID:", user.uid);
            } catch (authErr) {
                console.warn("ログインエラー（拡張機能などの影響の可能性あり）:", authErr);
                // ログイン失敗しても処理は止めない（ルールが公開なら保存できるため）
            }

            // フォームの値を取得
            const name = document.getElementById('name').value;
            const inVRC = document.getElementById('inVRC').value;
            const message = document.getElementById('message').value;
            const fileInput = document.getElementById('file-img');
            const file = fileInput.files[0];

            if (!file) throw new Error("画像ファイルが選択されていません");

            // 2. 画像アップロード
            submitBtn.textContent = '画像を送信中...';
            
            // ファイル名をユニークにする
            const timestamp = Date.now();
            const fileName = `profile_images/${timestamp}_${file.name}`;
            const storageRef = ref(storage, fileName);

            let imageUrl = "";
            try {
                const snapshot = await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(snapshot.ref);
                console.log("画像アップロード完了 URL:", imageUrl);
            } catch (storageErr) {
                console.error("Storage Error Code:", storageErr.code);
                if (storageErr.code === 'storage/unauthorized') {
                    throw new Error(
                        "画像の保存に失敗しました（権限エラー）。\n\n" +
                        "Firebase Consoleで Storage > Rules を開き、以下のように設定してください:\n" +
                        "allow read, write: if true;"
                    );
                }
                throw storageErr;
            }

            // 3. データベース保存
            submitBtn.textContent = 'データを保存中...';

            try {
                const docRef = await addDoc(collection(db, "businessCards"), {
                    name: name,
                    inVRC: inVRC,
                    message: message,
                    profileImageUrl: imageUrl,
                    uid: user ? user.uid : "anonymous",
                    createdAt: serverTimestamp()
                });
                console.log("データ保存完了 ID:", docRef.id);
            } catch (firestoreErr) {
                console.error("Firestore Error Code:", firestoreErr.code);
                if (firestoreErr.code === 'permission-denied') {
                    throw new Error(
                        "データの保存に失敗しました（権限エラー）。\n\n" +
                        "Firebase Consoleで Firestore Database > Rules を開き、以下のように設定してください:\n" +
                        "allow read, write: if true;"
                    );
                }
                throw firestoreErr;
            }

            // 完了
            alert("名刺が作成されました！");
            form.reset();
            // プレビューもリセットしたい場合はリロードなどが手っ取り早いが、ここでは入力クリアのみ

        } catch (error) {
            console.error("エラー詳細:", error);
            alert(`エラーが発生しました:\n${error.message}`);
        } finally {
            // ボタンを元に戻す
            submitBtn.disabled = false;
            submitBtn.textContent = '作成！';
        }
    });
});