<template>
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
import TransferForm from "@/components/Transfer.vue";
import Ledger from "@/components/Ledger.vue";

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

<style scoped>
h1 {
  font-size: 60px;
  background: -webkit-linear-gradient(rgb(210, 97, 214), rgb(158, 20, 121));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.transferForm {
  width: 50%;
}

.ledgerStatus {
  width: 50%;
}
</style>
