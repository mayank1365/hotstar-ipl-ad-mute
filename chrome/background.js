const targetAdIds = [
  "PARLE_MARIE",
  "KAMLA_PASAND",
  "VIMAL",
  "MY11C",
  "POKERBAAZI",
  "PR-25-011191_TATAIPL2025_IPL18_ipl18HANGOUTEVR20sEng_English_VCTA_NA", //sidhu ipl ad
  "CPH000020181_VIVO_V50E_SAPPHIRE_BLUE_ENG_10_IPL25_060525",
  "CPH000017974_VICKS_Revised_NEW_JINGLE_HINDI_20",
  "CPH000019845_POLICY_BAZAAR_HEALTH_INSURANCE_200_HIN_20_IPL25_010525_SPOT"
];

const durationRegexes = [
  /(\d{1,3})s(?:Eng(?:lish)?|Hin(?:di)?)/i,      // "20sEng", "15sHindi", "10sHin"
  /(?:HIN|ENG|HINDI|ENGLISH)[^\d]*(\d{1,3})/i    // "HIN_10", "ENG_15"
];

console.log("Hotstar Adblocker extension loaded");

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const adName = url.searchParams.get("adName");
    console.log(`Ad id: ${adName}`);

    if (adName) {
      const adIdMatch = targetAdIds.some((id) => adName.includes(id));

      if (adIdMatch) {
        let durationSec = 10;
        for (const regex of durationRegexes) {
          const match = adName.match(regex);
          if (match) {
            durationSec = parseInt(match[1], 10);
            break;
          }
        }

        console.log(`Muting ${adName} for ${durationSec} seconds`);

        const tabs = await chrome.tabs.query({ url: "*://*.hotstar.com/*" });

        for (const tab of tabs) {
          if (!tab.mutedInfo.muted) {
            chrome.tabs.update(tab.id, { muted: true });
          //  console.log(`Muted tab ${tab.id}`);

            setTimeout(() => {
              chrome.tabs.get(tab.id, (updatedTab) => {
                if (updatedTab && updatedTab.mutedInfo.muted) {
                  chrome.tabs.update(tab.id, { muted: false });
                //  console.log(`Unmuted tab ${tab.id}`);
                }
              });
            }, (durationSec * 1000) - 100); // some buffer for next tracking pixel
          }
        }
      }
    }
  },
  {
    urls: ["*://bifrost-api.hotstar.com/v1/events/track/ct_impression*"]
  }
);
