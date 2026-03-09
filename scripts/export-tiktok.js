const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("🚀 Launching Automated TikTok Generator...");
    
    const browser = await puppeteer.launch({
        headless: "new",
        userDataDir: path.join(__dirname, '../.puppeteer_data'), // Persist state (used phrases)
        defaultViewport: {
            width: 480,
            height: 854 // 9:16 aspect ratio
        },
        args: [
            '--no-sandbox',
            '--autoplay-policy=no-user-gesture-required',
            '--mute-audio=false', // Ensure audio is enabled
        ]
    });

    const page = await browser.newPage();
    
    const Config = {
        followNewTab: false,
        fps: 60,
        ffmpeg_Path: '/opt/homebrew/bin/ffmpeg', 
        videoFrame: {
            width: 480,
            height: 854,
        },
        aspectRatio: '9:16',
    };
    
    const recorder = new PuppeteerScreenRecorder(page, Config);
    
    // Generate filename with timestamp
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '../tiktok_exports');
    const fileName = path.join(outputDir, `ruleta_${dateStr}.mp4`);
    
    console.log("🔗 Loading app in Bot Mode...");
    // Use ?bot=true to trigger auto-spin and clean UI
    await page.goto('http://localhost:3000?bot=true', { waitUntil: 'networkidle2' });
    
    // Inject CSS to clean up any remaining UI elements for the video
    await page.addStyleTag({
        content: `
            .settings-toggle-button, 
            .icon-action-button, 
            .button-back,
            a[href="/phrases"] { 
                display: none !important; 
            }
            .canvas-container canvas {
                box-shadow: 0 0 100px rgba(168, 85, 247, 0.4) !important;
            }
        `
    });

    console.log(`📹 Starting recording: ruleta_${dateStr}.mp4`);
    await recorder.start(fileName);
    
    // The app waits 1.5s then spins (~6s) then shows modal (3s) then shows phrase.
    // We record for 16 seconds to capture the full sequence + some buffer for the phrase reading.
    console.log("⌛ Recording sequence...");
    await sleep(16000);
    
    console.log("🛑 Stopping recording...");
    await recorder.stop();
    await browser.close();
    
    console.log("✅ Process Complete!");
    console.log(`📂 Your daily video is ready at: ${fileName}`);
}

main().catch(err => {
    console.error("❌ Bot Error:", err);
    process.exit(1);
});
