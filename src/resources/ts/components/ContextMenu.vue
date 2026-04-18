<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { ContextAction } from '@/types/contextaction';

defineProps<{
    actions: ContextAction[],
    x: number,
    y: number
}>();
const emit = defineEmits<{ 'action-clicked': [action: ContextAction] }>();

const emitAction = (action: ContextAction) => {
    emit('action-clicked', action);
};
</script>

<template>
    <div
        class="fixed z-50 context-menu"
        :style="{ top: y + 'px', left: x + 'px' }"
    >
        <div
            v-for="item in actions"
            :key="item.label"
            class="context-menu-item"
            :class="{ 'has-children': item.children }"
            @click="!item.children && emitAction(item)"
        >
            {{ item.label }}
            <span v-if="item.children">▶</span>

            <div v-if="item.children" class="context-submenu">
                <div
                    v-for="child in item.children"
                    :key="child.label"
                    class="context-menu-item"
                    @click.stop="emitAction(child)"
                >
                    {{ child.label }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.context-menu {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    min-width: 150px;
}

.context-menu div {
    padding: 10px;
    cursor: pointer;
}

.context-menu div:hover {
    background-color: #f0f0f0;
}
</style>
