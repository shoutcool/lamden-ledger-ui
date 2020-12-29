<template>
  <h1>Lamden Ledger Wallet</h1>
  <div class="container">
    <Ledger @account="updateAccount($event)" class="ledgerStatus" />
    <TransferForm :account="account" class="transferForm" />
  </div>
</template>

<script>
import TransferForm from "./components/Transfer.vue";
import Ledger from "./components/Ledger.vue";

export default {
  name: "App",
  data() {
    return {
      account: "",
    };
  },
  methods: {
    updateAccount: function (e) {
      this.account = e.replace("ed25519:", "");
      console.log(this.account);
    },
  },
  components: {
    TransferForm,
    Ledger,
  },
};
</script>

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

  padding-top: 60px;
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
