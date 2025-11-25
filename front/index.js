
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('card-form');
    
    if (form) {
        // Use submit event to handle both button clicks and Enter key presses
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            if (!form.reportValidity()) {
                return;
            }

            // フォームデータを作成
            const formData = new FormData(form);

            sendData(formData);
        });
    }
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