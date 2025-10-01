
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const submitButton = document.getElementById('main-submit');
    const previewImageDiv = document.getElementById('preview-image');

    const fileInput = document.getElementById('file-img');
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImageDiv.querySelectorAll('.preview-img').forEach(img => img.remove());
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'プロフィール画像のプレビュー';
                img.classList.add('preview-img');
                img.style.maxWidth = '100px';
                img.style.maxHeight = '100px';
                
                const cardTitle = previewImageDiv.querySelector('.card-title');
                if (cardTitle) {
                    previewImageDiv.insertBefore(img, cardTitle.nextSibling);
                } else {
                    previewImageDiv.appendChild(img);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        
        if (!form.reportValidity()) {
            return;
        }

        // フォームデータを作成
        const formData = new FormData(form);

        sendData(formData);
    });
});

async function sendData(data) {
    const endpointUrl = '/api/create-business-card'; //送信用のURL

    try {
        // fetch APIでPOSTリクエストを送信
        const response = await fetch(endpointUrl, {
            method: 'POST',
            body: data
        });

        if (response.ok) {
            const result = await response.json();
            console.log('送信成功:', result);
            alert('名刺情報の送信に成功しました！');

        } else {
            const errorText = await response.text();
            console.error('送信失敗 (HTTPエラー):', response.status, errorText);
            alert(`名刺情報の送信に失敗しました。ステータス: ${response.status}`);
        }
    } catch (error) {
        console.error('ネットワークエラーまたはリクエスト失敗:', error);
        alert('ネットワークエラーにより送信できませんでした。');
    }
}