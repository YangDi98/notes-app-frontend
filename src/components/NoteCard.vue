<script setup>
const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <v-card height="12.5rem" :title="props.note.title" color="primary" variant="tonal">
    <v-card-text class="text-truncate-multiline">
      {{ props.note.content }}
    </v-card-text>
  </v-card>
</template>

<style scoped>
.text-truncate-multiline {
  display: -webkit-box;
  -webkit-line-clamp: 7; /* Number of lines to show */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3em; /* Set consistent line height */
  max-height: 9.1em; /* 7 lines × 1.3em = 9.1em */
}
</style>
