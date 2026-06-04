let selectedCount = 1;

const buttons =
    document.querySelectorAll(
        ".count-btn"
    );

const selectedText =
    document.getElementById(
        "selectedText"
    );

buttons.forEach(button => {

    if (
        button.dataset.count === "1"
    ) {
        button.classList.add(
            "active"
        );
    }

    button.addEventListener(
        "click",
        () => {

            buttons.forEach(btn =>
                btn.classList.remove(
                    "active"
                )
            );

            button.classList.add(
                "active"
            );

            selectedCount =
                parseInt(
                    button.dataset.count
                );

            selectedText.textContent =
                `Analyze ${selectedCount} Reel${selectedCount > 1 ? "s" : ""}`;

            console.log(
                "Selected:",
                selectedCount
            );

        }
    );

});

document
.getElementById("startBtn")
.addEventListener(
    "click",
    async () => {

        console.log(
            "Sending:",
            selectedCount
        );

        const tabs =
            await browser.tabs.query({
                active: true,
                currentWindow: true
            });

        browser.tabs.sendMessage(
            tabs[0].id,
            {
                action:
                    "startAnalysis",

                count:
                    selectedCount
            }
        );

    }
);