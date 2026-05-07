<script setup lang="ts">
import { marked } from 'marked';

const markdown = `
# SecondBrain

Questa è una prova di **Markdown** renderizzato con \`marked\`.

- Tailwind attivo
- Typography attivo
- Vue 3 attivo
- TypeScript attivo
`;

const renderedMarkdown = marked.parse(markdown);
</script>

<template>
    <main class="min-h-screen bg-white px-8 py-12 text-zinc-900">
        <div class="mx-auto max-w-3xl space-y-8">
            <header class="space-y-2">
                <h1 class="text-4xl font-bold tracking-tight">SecondBrain</h1>
                <p class="text-base text-zinc-600">
                    Setup frontend completato con Vue, TypeScript, Tailwind,
                    Typography e Marked.
                </p>
            </header>

            <section class="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <div class="prose max-w-none" v-html="renderedMarkdown"></div>
            </section>
        </div>
    </main>
</template>
