<template>
  <div id="toolbar">
    <router-link
      v-if="this.$route.name != 'HowTo' && this.$route.name != 'Terms'"
      to="/howto"
      >How to</router-link
    >
    <router-link
      v-if="this.$route.name === 'HowTo' || this.$route.name === 'Terms'"
      to="/"
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
  <!-- teleport target -->
  <div id="modals"></div>
  <footer>
    <a href="terms">Terms of Service</a>
  </footer>
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

footer {
  top: 95%;
  min-height: 5%;
  width: 100%;
  position: fixed;
  padding: 10px 15px;
  background-color: #282828;
  border-top: 1px solid rgb(77, 77, 77);
  text-align: right;
}

footer a {
  color: rgb(210, 97, 214);
  margin-right: 50px;
  text-decoration: none;
}

#toolbar a {
  text-decoration: none;
  font-size: 20px;
  font-weight: 400;
  color: white;
}

#toolbar a:hover {
  color: rgb(210, 97, 214);
}
</style>
