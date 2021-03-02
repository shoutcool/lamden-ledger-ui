<template>
  <form v-if="!isSendingDisabled" v-on:submit.prevent="onSubmit">
    <ul class="flex-outer">
      <li v-if="!ledgerApprovalPending">
        <label>Network</label>
        <label>{{ mainnet ? "Mainnet" : "Testnet" }}</label>
      </li>
      <li>
        <label v-if="!ledgerApprovalPending" for="index">KeyIndex</label>
        <vue-number-input
          v-model="ledgerIndex"
          v-if="!ledgerApprovalPending"
          :min="0"
          :max="1024"
          size="small"
          @update:model-value="onUpdate"
          inline
          controls
        ></vue-number-input>
        <div v-if="ledgerApprovalPending">
          Please approve on your ledger to continue...
        </div>
      </li>

      <li v-if="!ledgerApprovalPending">
        <label for="destination">Account</label>
        <span class="plainValue">
          <a :href="walletLink">{{ account }}</a>
        </span>
      </li>
      <li v-if="!ledgerApprovalPending">
        <label for="destination">Destination</label>
        <input
          type="text"
          id="destination"
          placeholder="Enter destination address"
          v-model="to"
        />
      </li>
      <li v-if="!ledgerApprovalPending">
        <label for="amount">Amount</label>
        <input
          type="text"
          id="amount"
          placeholder="Enter TAU amount to send"
          v-model.number="amount"
        />
      </li>
      <li v-if="!ledgerApprovalPending">
        <label for="amount">Available Balance</label>
        <p v-if="!updatingBalance" class="plainValue">{{ balance }}</p>
        <p v-if="updatingBalance" class="plainValue">updating</p>
      </li>
      <li v-if="isTxHashAvailable">
        <label>Transaction Hash</label>
        <span>
          <a :href="txLink" class="plainValue">{{ txHash }}</a>
        </span>
      </li>
      <li v-if="isTxStatusAvailable">
        <label>Transaction Status</label>
        <p
          v-bind:class="{
            success: txSuccess === true,
            failed: txSuccess === false,
            plainValue: txSuccess !== undefined,
          }"
        >
          {{ txSuccess === true ? "Success" : "Failed: " }}
          <span v-if="isTxErrorAvailable"> {{ txErrorMsg }}</span>
        </p>
      </li>
      <li v-if="isErrorAvailable" class="error">
        <label>Error</label>
        <p class="plainValue">{{ error }}</p>
      </li>
      <li v-if="!ledgerApprovalPending" class="centered">
        <button :disabled="isSendingDisabled" type="submit">Send</button>
      </li>
    </ul>
  </form>
</template>





<script>
import * as lamden from "lamden-ledger";

export default {
  name: "TransferForm",
  data() {
    return {
      ledgerIndex: 0,
      ledgerApprovalPending: false,
      balance: 0,
      to: "",
      amount: 0,
      txHash: "",
      txSuccess: undefined,
      txErrorMsg: "",
      error: "",
      timerBalance: undefined,
      timerTxStatus: undefined,
      updatingBalance: false,
    };
  },
  props: {
    account: String,
    mainnet: Boolean,
  },
  computed: {
    isSendingDisabled: function () {
      return !(this.account !== undefined && this.account.length == 64);
    },
    isTxHashAvailable: function () {
      return this.txHash !== undefined && this.txHash.length == 64;
    },
    isErrorAvailable: function () {
      return this.error !== undefined && this.error.length > 0;
    },
    walletLink: function () {
      return `https://${
        this.mainnet ? "mainnet" : "explorer"
      }.lamden.io/addresses/${this.account}`;
    },
    txLink: function () {
      return `https://${
        this.mainnet ? "mainnet" : "explorer"
      }.lamden.io/transactions/${this.txHash}`;
    },
    isTxStatusAvailable: function () {
      return this.txSuccess !== undefined;
    },
    isTxErrorAvailable: function () {
      return this.txErrorMsg !== undefined && this.txErrorMsg.length > 0;
    },
  },
  methods: {
    onUpdate(newValue, oldValue) {
      console.log(newValue, oldValue);
      if (!isNaN(oldValue)) {
        this.txHash = undefined;
        this.txSuccess = undefined;
        this.ledgerApprovalPending = true;

        lamden
          .getPublicKey(newValue)
          .then((e) => {
            this.$emit("account", e);
          })
          .catch((a) => console.log(a))
          .finally(() => {
            lamden.close().then((y) => {});
          });
      }
    },
    onSubmit: function () {
      let tx = {
        sender: this.account,
        network: this.mainnet ? "mainnet" : "testnet",
        kwargs: {
          to: this.to,
          amount: this.amount,
        },
        contractName: "currency",
        methodName: "transfer",
        stampLimit: 200,
        ledgerKeyIndex: this.ledgerIndex,
      };

      if (this.amount % 1 != 0) {
        let decimalPart = {};
        decimalPart["__fixed__"] = new String(this.amount);
        tx.kwargs.amount = decimalPart;
      }

      console.log(JSON.stringify(tx));

      this.txHash = "";
      this.error = "";
      this.txSuccess = undefined;
      this.txErrorMsg = "";

      lamden
        .sendTransaction(tx)
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
          this.txHash = response.hash;

          this.timerBalance = setInterval(() => {
            this.updateBalance(this.account);
          }, 5000);

          this.timerTxStatus = setInterval(() => {
            this.readTxStatus(this.txHash);
          }, 5000);
        })
        .catch((e) => {
          console.log(e);
          this.txHash = "";
          this.error = e;
        });
    },
    readTxStatus: function (txHash) {
      fetch(
        `https://${
          this.mainnet ? "masternode-01" : "testnet-master-1"
        }.lamden.io/tx?hash=${txHash}`
      )
        .then((response) => response.json())
        .then((tx) => {
          if (tx.status === 0) {
            this.txSuccess = true;
          } else {
            this.txSuccess = false;
            this.txErrorMsg = tx.result;
          }
          clearInterval(this.timerTxStatus);
        });
    },
    updateBalance: function (account) {
      this.updatingBalance = true;

      fetch(
        `https://${
          this.mainnet ? "masternode-01" : "testnet-master-1"
        }.lamden.io/contracts/currency/balances?key=${account}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.value === null) {
            this.balance = 0;
          } else if (data.value.__fixed__) {
            this.balance = data.value.__fixed__;
          } else {
            this.balance = data.value;
          }
          clearInterval(this.timerBalance);
        })
        .catch(function (error) {
          console.error(
            error
          ); /* this line can also throw, e.g. when console = {} */
        })
        .finally(() => {
          this.updatingBalance = false;
        });
    },
  },
  watch: {
    account(newValue, oldValue) {
      console.log("updating balance...");
      this.ledgerApprovalPending = false;
      this.updateBalance(newValue);
    },
    mainnet() {
      this.txHash = undefined;
      this.txSuccess = undefined;
      this.updateBalance(this.account);
    },
  },
};
</script>







<style >
.vue-number-input__input {
  background: none !important;
  color: white !important;
  border: 0px !important;
}

.vue-number-input__button:disabled {
  cursor: not-allowed;
}

.vue-number-input__button {
  cursor: pointer;
}

.vue-number-input__button:disabled::before {
  background-color: rgb(146, 145, 145) !important;
}

.vue-number-input__button:disabled::after {
  background-color: rgb(146, 145, 145) !important;
}

.vue-number-input__button::after {
  background-color: white !important;
  width: 2px !important;
}

.vue-number-input__button::before {
  background-color: white !important;
  height: 2px !important;
}

.vue-number-input__button {
  background: none !important;
  color: white !important;
  border: 2px solid rgb(158, 20, 121) !important;
  border-radius: 5px !important;
}

.vue-number-input__button--minus,
.vue-number-input__button--plus {
  color: white !important;
  opacity: 1 !important;
}
</style>

<style scoped>
ul {
  padding: 0;
}

.success {
  color: lightgreen;
}

.failed {
  color: rgb(250, 46, 46);
}

.error {
  background-color: rgb(150, 38, 38);
  border-radius: 5px;
  padding: 0px 10px;
}

.plainValue {
  padding-left: 12px;
}

.vue-number-input {
  margin: 8px 0;
  width: 150px;
}

input[type="text"] {
  background: none;
  border: 2px solid rgb(158, 20, 121);
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border-radius: 5px;
  outline: none;
  box-shadow: none;
  color: white;
}

.flex-outer {
  margin-top: 40px;
}

.flex-outer li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.centered {
  justify-content: space-around;
}

a {
  color: rgb(81, 187, 81);
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
  margin-top: 40px;
}

button:disabled {
  background-color: rgb(160, 160, 160); /* Green */
  cursor: not-allowed;
}

.flex-outer > li > label {
  flex: 1 0 120px;
  max-width: 150px;
  font-weight: bold;
  text-align: left;
}

.flex-outer > li > input {
  flex: 1 0 220px;
}
</style>