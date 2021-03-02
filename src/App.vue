<template>
  <div id="toolbar">
    <router-link v-if="this.$route.name != 'HowTo'" to="/howto"
      >How to</router-link
    >
    <router-link v-if="this.$route.name === 'HowTo'" to="/"
      >Back to Wallet</router-link
    >

    <Toggle
      v-model="mainnet"
      @change="onNetworkChange"
      on-label="Mainnet"
      off-label="Testnet"
      :width="100"
      :height="30"
      :colors="{
        text: {
          on: '#000000',
          off: '#000000',
        },
      }"
    />
  </div>
  <router-view />
</template>

<script>
import Toggle from "@vueform/toggle";

export default {
  name: "App",
  data() {
    return {
      account: "",
      mainnet: true,
    };
  },
  methods: {
    onNetworkChange(value) {
      this.$store.commit("networkChange", value);
    },
  },
  components: {
    Toggle,
  },
};
</script>

<style src="@vueform/toggle/themes/default.css"></style>

<style>
body {
  margin: 0 !important;
  background-color: #1d261e;
  color: white;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

#toolbar {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.toggle-input {
  margin: 20px 20px 20px 40px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

a {
  text-decoration: none;
  font-size: 20px;
  font-weight: 400;
  color: white;
}

a:hover {
  color: rgb(210, 97, 214);
}
</style>
