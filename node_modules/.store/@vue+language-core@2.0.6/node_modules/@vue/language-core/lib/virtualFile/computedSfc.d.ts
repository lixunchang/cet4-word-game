import type { SFCParseResult } from '@vue/compiler-sfc';
import type * as ts from 'typescript';
import type { Sfc, VueLanguagePlugin } from '../types';
export declare function computedSfc(ts: typeof import('typescript'), plugins: ReturnType<VueLanguagePlugin>[], fileName: string, snapshot: () => ts.IScriptSnapshot, parsed: () => SFCParseResult | undefined): Sfc;
