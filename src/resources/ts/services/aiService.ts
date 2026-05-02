import apiClient from '@/services/apiClient';
import { serviceHandler } from '@/utils/serviceHandler';

export type AiAction =
    | 'summarize'
    | 'translate'
    | 'rewrite'
    | 'blackhat'
    | 'bluehat'
    | 'greenhat'
    | 'redhat'
    | 'whitehat'
    | 'yellowhat'
    | 'distant writing';

export type AiTone = 'grammar' | 'extension' | 'lexicon' | 'stylistic';
export type AiLang = 'it' | 'en' | 'fr' | 'de' | 'es' | 'pt';

export interface AiOptions {
    style?: [AiTone, ...AiTone[]];
    lang?:  AiLang;
}

export const aiService = {
    process: async (
        content: string,
        action:  AiAction,
        options: AiOptions = {}
    ): Promise<string> => {
        return serviceHandler(() =>
            apiClient.post('/llm', {
                content,
                action,
                options,
            }).then(response => response.data.result)
        );
    },

    translate: async (content: string, lang: AiLang = 'en'): Promise<string> => {
        return aiService.process(content, 'translate', { lang });
    },

    summarize: async (content: string): Promise<string> => {
        return aiService.process(content, 'summarize');
    },

    rewrite: async (content: string, style: [AiTone, ...AiTone[]]): Promise<string> => {
        return aiService.process(content, 'rewrite', { style });
    },

    blackhat: async (content: string): Promise<string> => {
        return aiService.process(content, 'blackhat');
    },

    bluehat: async (content: string): Promise<string> => {
        return aiService.process(content, 'bluehat');
    },

    greenhat: async (content: string): Promise<string> => {
        return aiService.process(content, 'greenhat');
    },

    redhat: async (content: string): Promise<string> => {
        return aiService.process(content, 'redhat');
    },

    whitehat: async (content: string): Promise<string> => {
        return aiService.process(content, 'whitehat');
    },

    yellowhat: async (content: string): Promise<string> => {
        return aiService.process(content, 'yellowhat');
    },

    distantWriting: async (content: string): Promise<string> => {
        return aiService.process(content, 'distant writing');
    },
};