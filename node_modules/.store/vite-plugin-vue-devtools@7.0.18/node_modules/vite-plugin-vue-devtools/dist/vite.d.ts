import { ResolvedConfig, ViteDevServer, PluginOption } from 'vite';
import { VitePluginInspectorOptions } from 'vite-plugin-vue-inspector';
import { ViteInspectAPI } from 'vite-plugin-inspect';

declare function getViteConfig(config: ResolvedConfig, pluginOptions: any): void;

declare function setupGraphModule(options: {
    rpc: ViteInspectAPI['rpc'];
    server: ViteDevServer;
}): void;

declare function setupAssetsModule(options: {
    rpc: ViteInspectAPI['rpc'];
    server: ViteDevServer;
    config: ResolvedConfig;
}): void;

interface VitePluginVueDevToolsOptions {
    /**
     * append an import to the module id ending with `appendTo` instead of adding a script into body
     * useful for projects that do not use html file as an entry
     *
     * WARNING: only set this if you know exactly what it does.
     * @default ''
     */
    appendTo?: string | RegExp;
    /**
     * Customize openInEditor host (e.g. http://localhost:3000)
     * @default false
     */
    openInEditorHost?: string | false;
    /**
     * DevTools client host (e.g. http://localhost:3000)
     * useful for projects that use a reverse proxy
     * @default false
     */
    clientHost?: string | false;
    /**
     * Enable Vue Component Inspector
     *
     * @default true
     */
    componentInspector?: boolean | VitePluginInspectorOptions;
}
declare function VitePluginVueDevTools(options?: VitePluginVueDevToolsOptions): PluginOption;

export { type VitePluginVueDevToolsOptions, VitePluginVueDevTools as default, getViteConfig, setupAssetsModule, setupGraphModule };
