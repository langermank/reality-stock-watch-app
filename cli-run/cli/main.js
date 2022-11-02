"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_app_1 = require("./cli-app");
const config_manager_1 = require("./config-manager");
(async () => {
    const configManager = new config_manager_1.ConfigManager('dev');
    configManager.load();
    console.log(JSON.stringify(configManager));
    return;
    const app = new cli_app_1.CliApp(configManager);
    await app.boot();
    await app.run();
})();
