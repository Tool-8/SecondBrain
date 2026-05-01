<script setup lang="ts">
import NavItem from './navigation/NavItem.vue';
import NavButton from './navigation/NavButton.vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import IconZucchetti from '@/components/icons/IconZucchetti.vue';
import { useTheme } from '@/composables/useTheme'

const route = useRoute();
const { theme, setTheme } = useTheme()

const isOpen = ref(!route.path.startsWith('/notes'));

const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
};

watch(
    () => route.path,
    (newPath) => {
        isOpen.value = !newPath.startsWith('/notes');
    }
);
</script>

<template>
    <aside
        class="flex h-screen flex-col justify-between border-e border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 sticky top-0 relative transition-all duration-300 ease-in-out"
        :class="isOpen ? 'w-64' : 'w-0'"
    >
        <button
            @click="toggleSidebar"
            class="absolute top-[50%] -right-6 z-99 p-1 cursor-pointer rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 rotate-90"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5 transition-transform duration-300 dark:text-white"
                :class="isOpen ? '' : 'rotate-180'"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    xmlns="http://www.w3.org/2000/svg"
                    d="M12,15.5a1.993,1.993,0,0,1-1.414-.585L5.293,9.621,6.707,8.207,12,13.5l5.293-5.293,1.414,1.414-5.293,5.293A1.993,1.993,0,0,1,12,15.5Z"
                />
            </svg>
        </button>

        <div
            class="h-full overflow-hidden transition-opacity duration-200 flex flex-col"
            :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >
            <div class="px-4 py-6">
                <span
                    class="flex flex-row px-4 py-2 w-full rounded-lg text-lg text-gray-600 font-medium text-bold dark:text-neutral-100 gap-2 items-center"
                >
                    <IconZucchetti :size="35" /> SecondBrain
                </span>

                <ul class="mt-6 space-y-2">
                    <NavButton label="Nuova nota" to="/notes/new" />
                    <br />
                    <NavItem label="Archivio note" to="/" />
                </ul>
            </div>

            <!-- SWITCH THEME -->
            <div class="py-2 px-4 border-none mt-auto">
                <ul class="space-y-1">
                    <li class="flex justify-between gap-1 p-1 rounded-lg bg-gray-100 dark:bg-neutral-800">
                        <div 
                            class="flex items-center justify-center gap-1 text-xs p-1 rounded-md cursor-pointer w-full text-gray-500 dark:text-neutral-400 data-[active=true]:text-black dark:data-[active=true]:text-white data-[active=true]:bg-white dark:data-[active=true]:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                            :data-active="theme === 'light'"
                            @click="setTheme('light')"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 48 48"
                                stroke="none"
                                class="size-5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M24,10a2,2,0,0,0,2-2V4a2,2,0,0,0-4,0V8A2,2,0,0,0,24,10Z"/>
                                <path d="M24,38a2,2,0,0,0-2,2v4a2,2,0,0,0,4,0V40A2,2,0,0,0,24,38Z"/>
                                <path d="M36.7,14.1l2.9-2.8a2.3,2.3,0,0,0,0-2.9,2.3,2.3,0,0,0-2.9,0l-2.8,2.9a2,2,0,1,0,2.8,2.8Z"/>
                                <path d="M11.3,33.9,8.4,36.7a2.3,2.3,0,0,0,0,2.9,2.3,2.3,0,0,0,2.9,0l2.8-2.9a2,2,0,1,0-2.8-2.8Z"/>
                                <path d="M44,22H40a2,2,0,0,0,0,4h4a2,2,0,0,0,0-4Z"/>
                                <path d="M10,24a2,2,0,0,0-2-2H4a2,2,0,0,0,0,4H8A2,2,0,0,0,10,24Z"/>
                                <path d="M36.7,33.9a2,2,0,1,0-2.8,2.8l2.8,2.9a2.1,2.1,0,1,0,2.9-2.9Z"/>
                                <path d="M11.3,14.1a2,2,0,0,0,2.8-2.8L11.3,8.4a2.3,2.3,0,0,0-2.9,0,2.3,2.3,0,0,0,0,2.9Z"/>
                                <path d="M24,14A10,10,0,1,0,34,24,10,10,0,0,0,24,14Zm0,16a6,6,0,1,1,6-6A6,6,0,0,1,24,30Z"/>
                            </svg>
                        </div>
                        <div 
                            class="flex items-center justify-center gap-1 text-xs p-1 rounded-md cursor-pointer w-full text-gray-500 dark:text-neutral-400 data-[active=true]:text-black dark:data-[active=true]:text-white data-[active=true]:bg-white dark:data-[active=true]:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                            :data-active="theme === 'dark'"
                            @click="setTheme('dark')"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 48 48"
                                stroke="none"
                                class="size-5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M18.2,11.2a22.6,22.6,0,0,0-1,6.9c.3,8.8,6.7,16.8,15,19.7A14.5,14.5,0,0,1,26.3,39H24.6a15,15,0,0,1-6.4-27.7m6-6.2h-.1a19.2,19.2,0,0,0-17,21.1A19.2,19.2,0,0,0,24.2,42.9h2.1a19.2,19.2,0,0,0,14.4-6.4A.9.9,0,0,0,40,35H38.1c-8.8-.5-16.6-8.4-16.9-17.1A17.4,17.4,0,0,1,25,6.6,1,1,0,0,0,24.2,5Z"/>
                            </svg>
                        </div>
                        <div 
                            class="flex items-center justify-center gap-1 text-xs p-1 rounded-md cursor-pointer w-full text-gray-500 dark:text-neutral-400 data-[active=true]:text-black dark:data-[active=true]:text-white data-[active=true]:bg-white dark:data-[active=true]:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                            :data-active="theme === 'system'"
                            @click="setTheme('system')"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 48 48"
                                stroke="none"
                                class="size-5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M44,4H4A2,2,0,0,0,2,6V34a2,2,0,0,0,2,2H18v4H12a2,2,0,0,0,0,4H36a2,2,0,0,0,0-4H30V36H44a2,2,0,0,0,2-2V6A2,2,0,0,0,44,4ZM42,8V24H6V8ZM26,40H22V36h4ZM6,32V28H42v4Z"/>
                            </svg>
                        </div>
                    </li>
                </ul>
            </div>

            <!-- ACCOUNT -->
            <div
                class="sticky inset-x-0 bottom-0 border-t border-gray-100 dark:border-neutral-800"
                hidden
            >
                <a
                    href="#"
                    class="flex items-center gap-2 p-4 hover:bg-gray-50"
                >
                    <img
                        alt=""
                        src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&amp;fit=crop&amp;q=80&amp;w=1160"
                        class="size-10 rounded-full object-cover"
                    />

                    <div>
                        <p class="text-xs">
                            <strong class="block font-medium">Don Joe</strong>

                            <span> info@tool8.it </span>
                        </p>
                    </div>
                </a>
            </div>
        </div>
    </aside>
</template>
