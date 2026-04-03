document.addEventListener("DOMContentLoaded", () => {
    const colorButtons = Array.from(document.querySelectorAll(".color-btn"));
    const msg = document.getElementById("message");
    let selected = [];

    const resetSelection = () => {
        selected = [];
        colorButtons.forEach(btn => btn.classList.remove("selected"));
    };

    const setMessage = (text, type = "info") => {
        if (msg) {
            msg.textContent = text;
            msg.style.color = type === "error" ? "red" : "green";
        }
    };

    colorButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const color = btn.dataset.color;
            if (selected.includes(color)) {
                selected = selected.filter(c => c !== color);
                btn.classList.remove("selected");
            } else if (selected.length < 3) {
                selected.push(color);
                btn.classList.add("selected");
            }

            if (selected.length === 3) {
                const name = window.prompt("Enter a name for this vibe:");
                if (!name || !name.trim()) {
                    setMessage("Vibe name required; selection reset.", "error");
                    resetSelection();
                    return;
                }

                const payload = {
                    vibeName: name.trim(),
                    vibeKey: selected
                };

                fetch("/create-vibe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                    .then(r => {
                        if (!r.ok) throw new Error(`HTTP ${r.status}`);
                        return r.json();
                    })
                    .then(data => {
                        setMessage(`Saved "${data.vibeName}" (${data.vibeKey.join(", ")})`);
                    })
                    .catch(err => {
                        setMessage(`Could not save vibe: ${err.message}`, "error");
                    })
                    .finally(resetSelection);
            } else {
                setMessage(`Selected ${selected.length}/3 colors`);
            }
        });
    });
});