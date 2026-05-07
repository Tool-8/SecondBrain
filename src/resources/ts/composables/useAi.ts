import { AiLang, aiService, AiTone } from "@/services/aiService";
import { ref } from "vue";

export function useAi() {
    const result  = ref<string | null>(null);
    const loading = ref(false);
    const error   = ref<string | null>(null);

    const execute = async (fn: () => Promise<string>): Promise<void> => {
        loading.value = true;
        error.value   = null;
        result.value  = null;
        try {
            result.value = await fn();
        } catch (e: any) {
            error.value = e?.message ?? 'Errore durante l\'elaborazione';
        } finally {
            loading.value = false;
        }
    };

    const translate = (content: string, lang: AiLang = 'en') => execute(() => aiService.translate(content, lang));
    
    const summarize = (content: string) => execute(() => aiService.summarize(content));
    
    const rewrite = (content: string, style: [AiTone, ...AiTone[]]) => execute(() => aiService.rewrite(content, style));
    
    const distantWriting = (content: string) => execute(() => aiService.distantWriting(content));
    
    const blackhat = (content: string) => execute(() => aiService.blackhat(content));
    
    const redhat = (content: string) => execute(() => aiService.redhat(content));
    
    const bluehat = (content: string) => execute(() => aiService.bluehat(content));
    
    const greenhat = (content: string) => execute(() => aiService.greenhat(content));
    
    const yellowhat = (content: string) => execute(() => aiService.yellowhat(content));
    
    const whitehat = (content: string) => execute(() => aiService.whitehat(content));

    return {
        result,
        error,
        loading,
        translate,
        summarize,
        rewrite,
        distantWriting,
        bluehat,
        redhat,
        yellowhat,
        greenhat,
        whitehat,
        blackhat,
    };
}