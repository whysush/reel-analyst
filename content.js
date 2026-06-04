console.log("CONTENT SCRIPT LOADED");

browser.runtime.onMessage.addListener(
    async (message) => {

        if (
            message.action ===
            "startAnalysis"
        ) {

            console.log(
                `Starting ${message.count} reels`
            );

            await startAnalysis(
                message.count
            );

        }

    }
);

async function startAnalysis(count) {

    console.log("COUNT RECEIVED:", count);

    const reels = [];

    for (let i = 1; i <= count; i++) {

        await waitForVideoReady();

        const reelData =
            await collectReelData(i);

        reels.push(reelData);

        console.log(
            `Collected Reel ${i}/${count}`
        );

        if (i < count) {

            const oldUrl =
                window.location.href;

            moveToNextReel();

            await waitForUrlChange(
                oldUrl
            );

            await sleep(1500);

        }
    }

    console.log(
        "COLLECTION COMPLETE"
    );

    console.log(
        `Analyzing ${reels.length} reels...`
    );

    for (let i = 0; i < reels.length; i++) {

        console.log(
            `Analyzing Reel ${i + 1}/${reels.length}`
        );

        try {

            const result =
                await browser.runtime.sendMessage({

                    action:
                        "analyzeReel",

                    reel:
                        reels[i]

                });

            if (
                result &&
                result.choices &&
                result.choices.length > 0
            ) {

                let content =
                    result.choices[0]
                    .message.content;

                console.log(
                    `Raw Response Reel ${i + 1}:`,
                    content
                );

                try {

                    content =
                        content
                        .replace(/```json/g, "")
                        .replace(/```/g, "")
                        .trim();

                    reels[i].analysis =
                        JSON.parse(content);

                } catch {

                    reels[i].analysis = {

                        parse_error: true,

                        raw_response:
                            content

                    };

                }

            }

        } catch (err) {

            console.error(
                `Failed Reel ${i + 1}`,
                err
            );

            reels[i].analysis = {

                error:
                    err.toString()

            };

        }

        await sleep(2000);

    }

    const finalReport = {

        generatedAt:
            new Date()
            .toISOString(),

        totalReels:
            reels.length,

        reels:
            reels.map(reel => ({

                reelNumber:
                    reel.reelNumber,

                url:
                    reel.url,

                analysis:
                    reel.analysis

            }))

    };

    console.log(
        "FINAL REPORT",
        finalReport
    );

    await browser.storage.local.set({

        collectedReels:
            reels,

        finalReport:
            finalReport

    });

    downloadReport(
        finalReport
    );

    alert(
        `Finished analyzing ${count} reels`
    );

}

async function waitForUrlChange(oldUrl) {

    return new Promise(resolve => {

        const interval =
            setInterval(() => {

                if (
                    window.location.href !==
                    oldUrl
                ) {

                    clearInterval(
                        interval
                    );

                    resolve();

                }

            }, 200);

    });

}

async function waitForVideoReady() {

    return new Promise(resolve => {

        const interval =
            setInterval(() => {

                const video =
                    document.querySelector(
                        "video"
                    );

                if (
                    video &&
                    video.readyState >= 2 &&
                    video.duration > 0
                ) {

                    clearInterval(
                        interval
                    );

                    resolve(video);

                }

            }, 200);

    });

}

async function collectReelData(index) {

    const video =
        document.querySelector(
            "video"
        );

    const frames = [];

    if (video) {

        console.log(
            `Capturing Reel ${index} Frame 1`
        );

        frames.push(
            captureFrame(video)
        );

        await sleep(2000);

        console.log(
            `Capturing Reel ${index} Frame 2`
        );

        frames.push(
            captureFrame(video)
        );

        await sleep(2000);

        console.log(
            `Capturing Reel ${index} Frame 3`
        );

        frames.push(
            captureFrame(video)
        );

    }

    return {

        reelNumber:
            index,

        url:
            window.location.href,

        timestamp:
            new Date()
                .toISOString(),

        frames

    };

}

function captureFrame(video) {

    try {

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width = 320;
        canvas.height = 568;

        const ctx =
            canvas.getContext(
                "2d"
            );

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return canvas.toDataURL(
            "image/jpeg",
            0.5
        );

    } catch (err) {

        console.error(
            "Frame capture failed",
            err
        );

        return null;

    }

}

function moveToNextReel() {

    console.log(
        "Moving to next reel..."
    );

    document.activeElement.dispatchEvent(

        new KeyboardEvent(
            "keydown",
            {
                key:
                    "ArrowDown",

                bubbles:
                    true
            }
        )

    );

}

function sleep(ms) {

    return new Promise(resolve =>
        setTimeout(
            resolve,
            ms
        )
    );

}

function downloadReport(report) {

    const blob =
        new Blob(

            [
                JSON.stringify(
                    report,
                    null,
                    2
                )
            ],

            {
                type:
                    "application/json"
            }

        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    a.href = url;

    a.download =
        "reel_analysis_report.json";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(
        url
    );

}