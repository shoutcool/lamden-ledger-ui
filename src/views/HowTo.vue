<template>
  <div id="md">
    <vue3-markdown-it :source="source" :html="true" />
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

<style scoped>
#md {
  width: 60%;
  margin-left: 20vw;
  text-align: left;
}
</style>