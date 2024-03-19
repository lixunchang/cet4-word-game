import { type VueLanguagePlugin } from './types';
export declare function getDefaultVueLanguagePlugins(pluginContext: Parameters<VueLanguagePlugin>[0]): {
    version: 2;
    name?: string | undefined;
    order?: number | undefined;
    requiredCompilerOptions?: string[] | undefined;
    parseSFC?(fileName: string, content: string): import("@vue/compiler-sfc").SFCParseResult | undefined;
    updateSFC?(oldResult: import("@vue/compiler-sfc").SFCParseResult, textChange: {
        start: number;
        end: number;
        newText: string;
    }): import("@vue/compiler-sfc").SFCParseResult | undefined;
    resolveTemplateCompilerOptions?(options: import("@vue/compiler-dom").CompilerOptions): import("@vue/compiler-dom").CompilerOptions;
    compileSFCTemplate?(lang: string, template: string, options: import("@vue/compiler-dom").CompilerOptions): import("@vue/compiler-dom").CodegenResult | undefined;
    updateSFCTemplate?(oldResult: import("@vue/compiler-dom").CodegenResult, textChange: {
        start: number;
        end: number;
        newText: string;
    }): import("@vue/compiler-dom").CodegenResult | undefined;
    getEmbeddedCodes?(fileName: string, sfc: import("./types").Sfc): {
        id: string;
        lang: string;
    }[];
    resolveEmbeddedCode?(fileName: string, sfc: import("./types").Sfc, embeddedFile: import("./virtualFile/embeddedFile").VueEmbeddedCode): void;
}[];
