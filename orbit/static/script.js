
(() => {
    const chatForm = document.querySelector("#chat-form");
    const chatInput = document.querySelector("#chat-input");
    const chatMessages = document.querySelector("#chat-messages");
    const chatError = document.querySelector("#chat-error");

    const noteForm = document.querySelector("#note-form");
    const noteInput = document.querySelector("#note-input");
    const notesList = document.querySelector("#notes-list");

    async function postJSON(url, data) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "요청을 처리하지 못했어요.");
        }

        return result;
    }

    // 메모 추가
    if (noteForm && noteInput && notesList) {
        noteForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const content = noteInput.value.trim();
            if (!content) return;

            const button = noteForm.querySelector("button");
            button.disabled = true;

            try {
                await postJSON("/api/notes", { content });
                window.location.reload();
            } catch (error) {
                alert(error.message);
            } finally {
                button.disabled = false;
            }
        });

        // 메모 삭제
        notesList.addEventListener("click", async (event) => {
            const button = event.target.closest("[data-delete-note]");
            if (!button) return;

            const noteId = button.dataset.deleteNote;

            if (!confirm("이 메모를 삭제할까요?")) return;

            button.disabled = true;

            try {
                await postJSON(`/api/notes/${noteId}/delete`, {});
                button.closest(".note-item")?.remove();

                if (!notesList.querySelector(".note-item")) {
                    const empty = document.createElement("p");
                    empty.className = "empty-state";
                    empty.id = "empty-notes";
                    empty.textContent = "아직 메모가 없어요. 첫 메모를 추가해 보세요!";
                    notesList.appendChild(empty);
                }
            } catch (error) {
                alert(error.message);
                button.disabled = false;
            }
        });
    }

    // AI 대화는 다음 단계에서 서버와 연결
    if (chatForm && chatInput && chatMessages) {
        chatForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const message = chatInput.value.trim();
            if (!message) return;

            if (chatError) {
                chatError.textContent =
                    "AI 연결은 아직 준비 중이에요. 메모 기능부터 사용해 보세요!";
            }
        });

        document.querySelectorAll("[data-prompt]").forEach((button) => {
            button.addEventListener("click", () => {
                chatInput.value = button.dataset.prompt || "";
                chatInput.focus();
            });
        });
    }
})();
