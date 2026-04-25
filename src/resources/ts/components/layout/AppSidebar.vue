<script setup lang="ts">
import NavItem from './navigation/NavItem.vue';
import NavButton from './navigation/NavButton.vue';
</script>

<template>
    <aside class="flex h-screen flex-col min-w-[14rem] justify-between border-e border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 sticky top-0">
        <div class="px-4 py-6">
            <span class="grid h-10 px-4 py-2 w-full rounded-lg text-lg text-gray-600 font-medium text-bold dark:text-neutral-100">
            [SB] SecondBrain
            </span>  

            <ul class="mt-6 space-y-2">
                <NavButton label="Nuova nota" to="/notes/new" />
                <br>
                <NavItem label="Archivio note" to="/" />
            </ul>
        </div>

        <div class="sticky inset-x-0 bottom-0 border-t border-gray-100 dark:border-neutral-800" hidden>
            <a href="#" class="flex items-center gap-2 p-4 hover:bg-gray-50">
                <img alt="" src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&amp;fit=crop&amp;q=80&amp;w=1160" class="size-10 rounded-full object-cover">

                <div>
                    <p class="text-xs">
                    <strong class="block font-medium">Don Joe</strong>

                    <span> info@tool8.it </span>
                    </p>
                </div>
            </a>
        </div>
    </aside>
</template>