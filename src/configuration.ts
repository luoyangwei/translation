import * as vscode from 'vscode';

const workspaceConfiguration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("esayTranslation");

const keys = {
    channel: "channel",
    appid: "channelAppid",
    secretKey: "channelSecretKey",
};

export class Configuration {
    channel?: string;
    appid?: string;
    secretKey?: string;

    constructor(channel?: string, appid?: string, secretKey?: string) {
        this.appid = appid;
        this.secretKey = secretKey;
        this.channel = channel;
    }
}

export function loadConfiguration(): Configuration {
    return {
        channel: workspaceConfiguration.get(keys.channel),
        appid: workspaceConfiguration.get(keys.appid),
        secretKey: workspaceConfiguration.get(keys.secretKey)
    };
}