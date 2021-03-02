<template>
  <div>
    <button @click="readPublicKey">Connect to Ledger</button>
  </div>
  <div class="error" v-if="errorMsg != null">
    <p>Error occured: {{ errorMsg }}</p>
  </div>
  <div v-if="ledgerApprovalPending">
    <p>Please approve on your ledger to continue...</p>
  </div>
</template>




<script>
// eslint-disable-next-line no-unused-vars
import * as lamden from "lamden-ledger";

export default {
  name: "Ledger",
  data() {
    return {
      errorMsg: null,
      ledgerApprovalPending: false,
    };
  },
  methods: {
    readPublicKey: function () {
      this.errorMsg = null;
      this.ledgerApprovalPending = true;

      lamden
        .getPublicKey(0)
        .then((e) => {
          this.$emit("account", e);
        })
        .catch((e) => {
          if ("DisconnectedDeviceDuringOperation" === e.name) {
            this.errorMsg =
              "device disconnected! please reload the Lamden Ledger Wallet and start again";
          } else {
            this.errorMsg = e.message;
          }
        })
        .finally(() => {
          this.ledgerApprovalPending = false;
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
.error {
  color: red;
}

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