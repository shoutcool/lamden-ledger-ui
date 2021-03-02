<template>
  <div>
    <vue3-markdown-it :source="source" />
  </div>
</template>



<script>
// eslint-disable-next-line no-unused-vars
import howToMarkdownFile from "@/assets/markdown/howto.md";

export default {
  name: "HowTo",
  data() {
    return {
      source: howToMarkdownFile,
    };
  },
};
</script>