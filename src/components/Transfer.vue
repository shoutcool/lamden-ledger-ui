<template>
  <form v-if="!isSendingDisabled" v-on:submit.prevent="onSubmit">
    <ul class="flex-outer">
      <li>
        <label for="destination">Account</label>
        <span class="plainValue">
          <a :href="walletLink">{{ account }}</a>
        </span>
      </li>
      <li>
        <label for="destination">Destination</label>
        <input
          type="text"
          id="destination"
          placeholder="Enter destination address"
          v-model="to"
        />
      </li>
      <li>
        <label for="amount">Amount</label>
        <input
          type="text"
          id="amount"
          placeholder="Enter TAU amount to send"
          v-model.number="amount"
        />
      </li>
      <li>
        <label for="amount">Available Balance</label>
        <p class="plainValue">{{ balance }}</p>
      </li>
      <li v-if="isTxHashAvailable">
        <label>Transaction Hash</label>
        <span class="plainValue">
          <a :href="txLink">{{ txHash }}</a>
        </span>
      </li>
      <li v-if="isErrorAvailable" class="error">
        <label>Error</label>
        <span class="plainValue">{{ error }}</span>
      </li>
      <li class="centered">
        <button :disabled="isSendingDisabled" type="submit">Send</button>
      </li>
    </ul>
  </form>
</template>











<script>
import * as lamden from "../scripts/ledger.js";

export default {
  name: "TransferForm",
  data() {
    return {
      balance: 0,
      to: "",
      amount: 0,
      txHash: "",
      error: "",
    };
  },
  props: {
    account: String,
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
      return `https://mainnet.lamden.io/addresses/${this.account}`;
    },
    txLink: function () {
      return `https://mainnet.lamden.io/transactions/${this.txHash}`;
    },
  },
  methods: {
    onSubmit: function () {
      let tx = {
        sender: this.account,
        network: "mainnet",
        kwargs: {
          to: this.to,
          amount: this.amount,
        },
        contractName: "currency",
        methodName: "transfer",
        stampLimit: 200,
      };

      console.log(JSON.stringify(tx));

      lamden
        .sendTransaction(tx)
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
          this.txHash = response.hash;
          this.error = "";

          setTimeout(() => {
            this.updateBalance(this.account);
          }, 5000);
        })
        .catch((e) => {
          this.txHash = "";
          this.error = e;
        });
    },
    updateBalance: function (account) {
      fetch(
        "https://masternode-01.lamden.io/contracts/currency/balances?key=" +
          account
      )
        .then((response) => response.json())
        .then((data) => {
          this.balance = data.value.__fixed__;
        });
    },
  },
  watch: {
    account(newValue, oldValue) {
      this.updateBalance(newValue);
    },
  },
};
</script>









<style scoped>
ul {
  padding: 0;
}

.error {
  background-color: rgb(150, 38, 38);
  border-radius: 5px;
  padding: 0px 10px;
}

.plainValue {
  padding-left: 12px;
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