# Pulse Pop Charge Wave

幫我做一個適合 iPhone 手機全螢幕顯示的充電動畫網頁（支援 PWA 全螢幕無網址列模式，版面完全自適應手機螢幕，鎖定畫面比例不要出現任何捲動條）。

畫面設計需求如下：

背景與氛圍：深邃的夜空黑背景（#050510），周圍有漫畫風格的速度線與閃爍星光。

核心主視覺（動感光波動畫）：畫面正中央設計一個充滿能量感的「動感光波」發射核心，由內而外持續發射出高飽和度的亮藍色、螢光青與金黃色同心圓能量光波（帶有漫畫網點與閃電粒子特效），光波擴散時要有強烈的律動感與發光暈染（Glow）效果。

「充充電充充電」動態提示：不要靜態文字，請把「充充電！充充電！」做成超有活力的日系漫畫立體擬聲字特效，隨著動感光波的節奏一起彈跳、縮放、微微震動與發光，字體顏色使用高對比的黃底紅框漫畫風格。

互動與音效功能：

點擊螢幕任意處可以觸發「超級動感光波大爆發」（光波加速、全螢幕震動特效、粒子噴發），並可切換不同的光波配色（經典動感藍、動感超人金、巧克比粉紅）。

畫面右上角放一個極簡的靜音/開啟音效小按鈕，開啟時點擊或進入畫面會用 Web Audio API 合成出有節奏感的「嗶嗶嗶—咻！」復古特攝片光波充電音效（不依賴外部音檔）。

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pulse-pop-charge-wave.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aa0c0d28-92dc-46a5-8ef1-41575ac85403).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
