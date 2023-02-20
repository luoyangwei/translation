import got from "got";
import md5 = require("md5");
import { Configuration } from "../configuration";

// 翻译平台
type Platform = "baidu" | "youdao" | "bytes" | "google";

export interface Translator {
    /**
     * 获取翻译的渠道渠道
     */
    getChannel(): string;

    /**
     * translate 翻译后的结果
     *
     * @param text 选中的内容
     * @return 翻译后的内容
     */
    translate(text: string, configuration?: Configuration): Promise<string>;
}

/**
 * 有道翻译
 */
export class YoudaoTransilation implements Translator {
    readonly requestUrl: string =
        "https://dict.youdao.com/suggest?num=5&ver=5.0&doctype=json&cache=false&le=en&q=";

    getChannel(): string {
        return "youdao";
    }

    async translate(
        text: string,
        configuration?: Configuration
    ): Promise<string> {
        let request: any = await got.get(this.requestUrl, {}).json();

        if (Object.keys(request.data).length > 0) {
            let translationText = request.data.entries[0].explain;

            // 处理内容,有一些内容不能拿来直接用,可能会有多余的内容
            let processedTranslationText = translationText
                .split("; ")[0]
                .replace(/\[[\u4e00-\u9fa5]*\]/, "");
            return processedTranslationText;
        } else {
            return text;
        }
    }
}

/**
 * 百度翻译
 */
export class BaiduTransilation implements Translator {
    readonly requestUrl: string =
        "https://fanyi-api.baidu.com/api/trans/vip/translate";

    getChannel(): string {
        return "baidu";
    }

    async translate(
        text: string,
        configuration?: Configuration
    ): Promise<string> {
        console.log(configuration);
        // 发送请求
        let salt = new Date().getTime();
        let response: any = await got
            .post(this.requestUrl, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                form: {
                    q: text,
                    from: "auto",
                    to: "en",
                    appid: configuration?.appid,
                    salt: salt,
                    sign: md5(
                        configuration?.appid + text + salt + configuration?.secretKey
                    ),
                },
            })
            .json();
        console.log(response);

        let transResult = response["trans_result"];
        console.log(transResult);
        return transResult[0].dst;
    }
}

export class BytesTransilation implements Translator {
    getChannel(): string {
        return "bytes";
    }

    translate(text: string, configuration?: Configuration): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
