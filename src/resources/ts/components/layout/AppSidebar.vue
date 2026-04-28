<script setup lang="ts">
import NavItem from './navigation/NavItem.vue';
import NavButton from './navigation/NavButton.vue';
import { ref, watch  } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()

const isOpen = ref(!route.path.startsWith('/notes'))

const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
};

watch(
    () => route.path,
    (newPath) => {
        isOpen.value = !newPath.startsWith('/notes')
    }
)
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
                <path xmlns="http://www.w3.org/2000/svg" d="M12,15.5a1.993,1.993,0,0,1-1.414-.585L5.293,9.621,6.707,8.207,12,13.5l5.293-5.293,1.414,1.414-5.293,5.293A1.993,1.993,0,0,1,12,15.5Z"/>
            </svg>
        </button>


        <div
            class="h-full overflow-hidden transition-opacity duration-200"
            :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >

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

        </div>
    </aside>
</template>