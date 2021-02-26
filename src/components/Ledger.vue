<template>
  <div>
    <button @click="readPublicKey">Connect to Ledger</button>
  </div>

  <!-- <div class="ledger-container">
    <div>
      Ledger Status:
      {{ ledger.publicKey }}
    </div>
    <div>
      <span v-if="ledger.readyToConnect" class="connected"
        >ready to connect</span
      >
      <span v-if="!ledger.readyToConnect" class="notConnected"
        >please attach Ledger device</span
      >
    </div>
    <div v-if="ledger.connected">Current Address</div>
    <div v-if="ledger.connected">
      <a :href="walletLink">{{ ledger.account }}</a>
    </div>
  </div> -->
</template>





<script>
// eslint-disable-next-line no-unused-vars
import * as lamden from "lamden-ledger";
export default {
  name: "Ledger",
  computed: {
    walletLink: function () {
      return `https://mainnet.lamden.io/addresses/${this.ledger.account}`;
    },
  },
  methods: {
    readPublicKey: function () {
      lamden
        .getPublicKey(0)
        .then((e) => {
          this.$emit("account", e);
        })
        .catch((a) => console.log(a))
        .finally(() => {
          lamden.close().then((y) => {});
        });
    },
    closeConnection: function () {
      lamden.close().then((y) => {});
    },
  },
};
</script>















<style scoped>
.ledger-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

button {
  background-color: rgb(158, 20, 121); /* Green */
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}

.ledger-container > div {
  text-align: left;
  margin-bottom: 10px;
}

.ledger-container > div:nth-child(odd) {
  width: 20%;
}

.ledger-container > div:nth-child(even) {
  width: 80%;
}
</style>