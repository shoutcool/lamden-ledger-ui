<template>
  <div id="toolbar">
    <Toggle
      v-model="mainnet"
      @change="onNetworkChange"
      on-label="Mainnet"
      off-label="Testnet"
      width="100"
      height="30"
      :colors="{
        text: {
          on: '#000000',
          off: '#000000',
        },
      }"
    />
  </div>
  <h1>Lamden Ledger Wallet</h1>
  <div class="container">
    <Ledger @account="updateAccount($event)" class="ledgerStatus" />
    <TransferForm
      @account="updateAccount($event)"
      :mainnet="mainnet"
      :account="account"
      class="transferForm"
    />
  </div>
</template>

<script>
import TransferForm from "./components/Transfer.vue";
import Ledger from "./components/Ledger.vue";
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
      this.mainnet = value;
    },
    updateAccount: function (e) {
      this.account = e.replace("ed25519:", "");
      console.log(this.account);
    },
  },
  components: {
    TransferForm,
    Ledger,
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
  flex-direction: column;
  align-items: flex-end;
}

.toggle-input {
  margin: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.transferForm {
  width: 50%;
}

.ledgerStatus {
  width: 50%;
}

h1 {
  font-size: 60px;
  background: -webkit-linear-gradient(rgb(210, 97, 214), rgb(158, 20, 121));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
