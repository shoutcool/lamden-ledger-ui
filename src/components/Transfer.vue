<template>
  <div v-if="ledgerApprovalPending">
    Please approve on your ledger to continue...
  </div>
  <Form
    v-if="!isSendingDisabled"
    @submit="onSubmit"
    :validation-schema="schema"
    v-slot="{ errors }"
  >
    <ul class="flex-outer">
      <li v-if="!ledgerApprovalPending">
        <label>Network</label>
        <label>{{ isMainnet ? "Mainnet" : "Testnet" }}</label>
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
      </li>

      <li v-if="!ledgerApprovalPending">
        <label>Account</label>
        <span class="plainValue">
          <a :href="walletLink">{{ account }}</a>
        </span>
      </li>
      <li v-if="!ledgerApprovalPending">
        <label for="destination">Destination</label>
        <Field
          name="destination"
          type="text"
          id="destination"
          placeholder="Enter destination address"
          v-model="to"
        />
        <div class="invalid-feedback">{{ errors.destination }}</div>
      </li>
      <li v-if="!ledgerApprovalPending">
        <label for="amount">Amount</label>
        <Field
          name="amount"
          type="number"
          id="amount"
          placeholder="Enter amount to send"
          v-model="amount"
        />
        <div class="invalid-feedback">{{ errors.amount }}</div>
      </li>
      <li v-if="!ledgerApprovalPending">
        <label>Available Balance</label>
        <p v-if="!updatingBalance" class="plainValue">{{ balance }}</p>
        <p v-if="updatingBalance" class="plainValue updating">updating...</p>

        <img
          v-if="!updatingBalance"
          class="refresh"
          src="../assets/images/refresh.png"
          width="23"
          @click="updateBalance(account)"
        />
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
        <button :disabled="isSendingDisabled || sendingTx" type="submit">
          {{ sendingTx ? "Please check Tx on your Ledger..." : "Send" }}
        </button>
      </li>
    </ul>
  </Form>
</template>





<script>
import * as lamden from "lamden-ledger";
import { Field, Form } from "vee-validate";
import * as Yup from "yup";

export default {
  name: "TransferForm",
  components: {
    Field,
    Form,
  },
  setup() {
    const schema = Yup.object().shape({
      destination: Yup.string()
        .required("Destination is required")
        .matches(
          /^[a-f0-9]{64}$/,
          "Not a valid lamden destination (public key)"
        ),
      amount: Yup.number()
        .required("Amount is required")
        .positive("Amount must be positive"),
    });

    const onSubmit = (values) => {
      // display form values on success
      alert("SUCCESS!! :-)\n\n" + JSON.stringify(values, null, 4));
      submitForm();
    };

    return {
      schema,
      onSubmit,
    };
  },
  data() {
    return {
      ledgerIndex: 0,
      ledgerApprovalPending: false,
      balance: 0,
      to: "",
      amount: null,
      txHash: "",
      txSuccess: undefined,
      txErrorMsg: "",
      error: "",
      timerBalance: undefined,
      timerTxStatus: undefined,
      updatingBalance: false,
      sendingTx: false,
    };
  },
  props: {
    account: String,
  },
  computed: {
    isMainnet: function () {
      return this.$store.state.mainnet;
    },
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
        this.$store.state.mainnet ? "mainnet" : "explorer"
      }.lamden.io/addresses/${this.account}`;
    },
    txLink: function () {
      return `https://${
        this.$store.state.mainnet ? "mainnet" : "explorer"
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
        this.error = "";

        lamden
          .getPublicKey(newValue)
          .then((e) => {
            this.$emit("account", e);
          })
          .catch((e) => {
            this.ledgerIndex = oldValue;
            if ("DisconnectedDeviceDuringOperation" === e.name) {
              this.txHash = "";
              this.error =
                "device disconnected! please reload the Lamden Ledger Wallet and start again";
            } else {
              this.txHash = "";
              this.error = e.message;
            }
          })
          .finally(() => {
            this.ledgerApprovalPending = false;
            lamden.close().then((y) => {});
          });
      }
    },
    submitForm: function () {
      let tx = {
        sender: this.account,
        network: this.$store.state.mainnet ? "mainnet" : "testnet",
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
      this.sendingTx = true;

      lamden
        .sendTransaction(tx)
        .then((response) => response.json())
        .then((response) => {
          console.log(response);

          if (response.error) {
            this.error = response.error;
          } else {
            this.txHash = response.hash;

            this.timerBalance = setInterval(() => {
              this.updateBalance(this.account);
            }, 5000);

            this.timerTxStatus = setInterval(() => {
              this.readTxStatus(this.txHash);
            }, 5000);
          }
        })
        .catch((e) => {
          if ("DisconnectedDeviceDuringOperation" === e.name) {
            this.txHash = "";
            this.error =
              "device disconnected! please reload the Lamden Ledger Wallet and start again";
          } else {
            this.txHash = "";
            this.error = e.message;
          }
        })
        .finally(() => {
          this.sendingTx = false;
        });
    },
    readTxStatus: function (txHash) {
      fetch(
        `https://${
          this.$store.state.mainnet ? "masternode-01" : "testnet-master-1"
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
          this.$store.state.mainnet ? "masternode-01" : "testnet-master-1"
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
    isMainnet() {
      this.txHash = undefined;
      this.txSuccess = undefined;
      this.updateBalance(this.account);
    },
  },
};
</script>







<style >
.invalid-feedback {
  color: red;
}

.refresh {
  cursor: pointer;
  margin-left: 10px;
}

.updating {
  color: rgb(210, 97, 214);
}

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

form {
  width: 60%;
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

input[type="text"],
input[type="number"] {
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

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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
  background-color: rgba(158, 20, 121, 0.4); /* Green */
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