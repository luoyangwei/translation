import got from "got";
import { Configuration, loadConfiguration } from "../configuration";
import {
    BaiduTransilation,
    Translator,
    YoudaoTransilation,
} from "./translation";

export interface Invoker {
    // 获取平台info信息
    getPlatformAccessInfo(): PlatformAccessInfo;

    // 替换文本
    replaceText(newText: string): any;
}

/**
 * 平台信息
 */
export class PlatformAccessInfo {
    platform?: string;
    auth?: boolean;
    appId?: string;
    secretKey?: string;

    constructor(platform: string = "youdao", appId?: string, secretKey?: string) {
        this.platform = platform;
        this.auth = !!appId;

        this.appId = appId;
        this.secretKey = secretKey;
    }
}

// 实际调用的翻译方法
export function translation(text: string, invoke: Invoker) {
    const configuration: Configuration = loadConfiguration();
    const platformAccessInfo: PlatformAccessInfo = invoke.getPlatformAccessInfo();

    let iterator: TranslatorIterator = new TranslatorIterator();
    let translator = iterator.next(platformAccessInfo.platform);
    let newText = translator.translate(text, configuration);
    newText.then((text) => invoke.replaceText(text));
}

class TranslatorIterator {
    translators: Translator[] = [
        new BaiduTransilation(),
        new YoudaoTransilation(),
    ];

    next(channel?: string): Translator {
        for (let index = 0; index < this.translators.length; index++) {
            const translator: Translator = this.translators[index];
            if (translator.getChannel() === channel) {
                return translator;
            }
        }
        return new YoudaoTransilation();
    }
}
