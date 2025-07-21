document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const inVRC = document.getElementById("inVRC").value;
        const fileInput = document.getElementById("file-img");
        const message = document.getElementById("message").value;

        const formData = new FormData();
        formData.append("name", name);
        formData.append("inVRC", inVRC);
        formData.append("file-img", fileInput.files[0]);
        formData.append("message", message);

        try {
            const response = await fetch("/submit-card", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert("名刺を作成しました！");
            } else {
                alert("エラーが発生しました。もう一度試してください。");
            }
        } catch (error) {
            console.error("送信エラー:", error);
            alert("通信に失敗しました。");
        }
    });
});
