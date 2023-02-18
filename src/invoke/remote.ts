import got from "got";

export interface Invoker {

    // 获取平台info信息
    getPlatformAccessInfo(): PlatformAccessInfo

    // 替换文本
    replaceText(newText: string): any
}

// 平台信息
export class PlatformAccessInfo {
    platform: Platform = Platform.youdao;
    auth?: boolean;
    appId?: string;
    secretKey?: string;

    constructor(appId?: string, secretKey?: string, auth: boolean = false) {
        this.appId = appId;
        this.secretKey = secretKey;
        this.auth = auth;
    }
}

// 实际调用的翻译方法
export function translation(text: string, invoke: Invoker) {
    let platformAccessInfo: PlatformAccessInfo = invoke.getPlatformAccessInfo();

    // 有一些不需要认证信息的平台
    if (!platformAccessInfo.auth) {
        if (Platform.youdao === platformAccessInfo.platform) {
            let afterTranslationText = youdaoTranslation(text);
            afterTranslationText.then((text) => invoke.replaceText(text));
        }
    }
}

async function youdaoTranslation(text: string): Promise<string> {
    let url: string = "https://dict.youdao.com/suggest?num=5&ver=5.0&doctype=json&cache=false&le=en&q=" + text;
    let request: any = await got.get(url, {}).json();
    if (Object.keys(request.data).length > 0) {
        let translationText = request.data.entries[0].explain;

        // 处理内容,有一些内容不能拿来直接用,可能会有多余的内容
        let processedTranslationText = translationText.split('; ')[0].replace(/\[[\u4e00-\u9fa5]*\]/, "");
        return processedTranslationText;
    } else {
        return text;
    }
}

// 翻译的平台枚举
export enum Platform {
    baidu,  // 百度翻译
    youdao, // 有道翻译
    bytes,  // 字节的火山翻译
    google, // 谷歌翻译
}
