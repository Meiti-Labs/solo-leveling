import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { mockEnv } from "./mockEnv";
import { init } from "./init";

mockEnv().then(() => {
  try {
    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform } = launchParams;
    const debug =
      (launchParams.tgWebAppStartParam || "").includes("debug") ||
      process.env.NODE_ENV === "development";

    init({
      debug,
      eruda: debug && ["ios", "android"].includes(platform),
      mockForMacOS: platform === "macos",
    });
  } catch (error) {
    console.error(error);
  }
});

