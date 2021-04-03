<template>
  <div v-if="ledgerApprovalPending">
    Please approve on your ledger to continue...
  </div>
  <Form
    v-if="!isSendingDisabled"
    @submit="submitForm"
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
          <a :href="walletLink" target="_blank">{{ account }}</a>
        </span>
        <img
          class="refresh"
          src="../assets/images/copy.png"
          width="23"
          title="copy to clipboard"
          @click="copyToClipboard(account)"
        />
        <span
          id="copyStatus"
          :style="cssVars"
          v-if="copyStatus !== undefined"
          >{{ copyStatus }}</span
        >
      </li>
      <li v-if="!ledgerApprovalPending">
        <label for="destination" :class="errors.destination ? 'errorLabel' : ''"
          >Destination</label
        >
        <div class="fullWidth">
          <Field
            name="destination"
            type="text"
            id="destination"
            placeholder="Enter destination address"
            v-model="to"
          />
          <div v-if="errors.destination" class="invalid-feedback">
            {{ errors.destination }}
          </div>
        </div>
      </li>
      <li v-if="!ledgerApprovalPending">
        <label for="amount" :class="errors.amount ? 'errorLabel' : ''"
          >Amount</label
        >
        <div class="fullWidth">
          <Field
            name="amount"
            type="number"
            id="amount"
            placeholder="Enter amount to send"
            v-model="amount"
          />
          <div v-if="errors.amount" class="invalid-feedback">
            {{ errors.amount }}
          </div>
        </div>
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
          <a :href="txLink" target="_blank" class="plainValue">{{ txHash }}</a>
        </span>
      </li>
      <li v-if="isTxStatusAvailable">
        <label>Transaction Status</label>
        <p
          v-bind:class="{
            success: txStatus === 'success',
            failed: txStatus === 'failed',
            updating: txStatus === 'pending',
            plainValue: txStatus !== undefined,
          }"
        >
          {{ getTxResultMessage }}
          <span v-if="isTxErrorAvailable"> {{ txErrorMsg }}</span>
        </p>
      </li>
      <li v-if="isErrorAvailable" class="error">
        <label>Error</label>
        <p class="plainValue">{{ error }}</p>
      </li>
      <li v-if="!ledgerApprovalPending" class="centered">
        <button
          :disabled="isSendingDisabled || sendingTx || !isFormComplete"
          type="submit"
        >
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
import { copyText } from "vue3-clipboard";

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
        .matches(/^[a-f0-9]{64}$/, "Not a valid lamden address (public key)"),
      amount: Yup.string()
        .required("Amount is required")
        .matches(/^[0-9]+\.?[0-9]*$/, "Amount must be valid positive number")
        .typeError("Amount must be a number"),
    });

    return {
      schema,
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
      txStatus: undefined,
      txErrorMsg: "",
      error: "",
      timerBalance: undefined,
      timerTxStatus: undefined,
      updatingBalance: false,
      sendingTx: false,
      copyStatus: undefined,
      copyStatusColor: undefined,
    };
  },
  props: {
    account: String,
  },
  computed: {
    isMainnet: function () {
      return this.$store.state.mainnet;
    },
    isFormComplete() {
      return this.to && this.amount;
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
      return this.txStatus !== undefined;
    },
    isTxErrorAvailable: function () {
      return this.txErrorMsg !== undefined && this.txErrorMsg.length > 0;
    },
    cssVars() {
      return {
        "--copy-status-color": this.copyStatusColor,
      };
    },
    getTxResultMessage() {
      if (this.txStatus === "success") {
        return "Success";
      } else if (this.txStatus === "failed" && this.isTxErrorAvailable) {
        return "Failed: ";
      } else if (this.txStatus === "failed" && !this.isTxErrorAvailable) {
        return "Failed";
      } else {
        return "Waiting for Tx to be processed... ";
      }
    },
  },
  methods: {
    onUpdate(newValue, oldValue) {
      console.log(newValue, oldValue);
      if (!isNaN(oldValue)) {
        this.txHash = undefined;
        this.txStatus = undefined;
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
          amount: Number(this.amount),
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
      this.txStatus = undefined;
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

            this.txStatus = "pending";

            this.timerTxStatus = setInterval(() => {
              this.readTxStatus(this.txHash);
            }, 3000);

            setTimeout(() => {
              if (this.txStatus === "pending") {
                clearInterval(this.timerTxStatus);
                this.txStatus = "failed";
                this.txErrorMsg =
                  "Tx result not received whitin 20 seconds. Please use the Tx Link above to check";
                this.updateBalance(this.account);
              }
            }, 20000);
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
      let processError = (err) => {
        if (err.error && err.error === "Transaction not found.") {
          //maybe network is under load, retry again...
        } else {
          clearInterval(this.timerTxStatus);
          this.updateBalance(this.account);
          this.txStatus = "failed";
          this.txErrorMsg = JSON.stringify(errJson);
        }
      };

      let processSuccess = (tx) => {
        if (tx.status === 0) {
          this.txStatus = "success";
        } else {
          this.txStatus = "failed";
          this.txErrorMsg = tx.result;
        }
        clearInterval(this.timerTxStatus);
        this.updateBalance(this.account);
      };

      let resStatus = 0;
      fetch(
        `https://${
          this.$store.state.mainnet ? "masternode-01" : "testnet-master-1"
        }.lamden.io/tx?hash=${txHash}`
      )
        .then((res) => {
          resStatus = res.status;
          return res.json();
        })
        .then((response) => {
          if (resStatus === 400) {
            processError(response);
          } else if (resStatus === 200) {
            processSuccess(response);
          }
        })
        .catch((err) => {
          console.error("TxState Error: " + err);
          this.txStatus = "failed";
          this.txErrorMsg =
            "Could not read Tx, please use the link above to check the result!";
        });
    },
    showCopyStatus: function (statusText, color) {
      this.copyStatusColor = color;
      this.copyStatus = statusText;
      setTimeout(() => {
        this.copyStatus = undefined;
      }, 3000);
    },
    copyToClipboard: function (account) {
      copyText(account, undefined, (error, event) => {
        if (error) {
          this.showCopyStatus("could not copy!!!", "#fa2e2e");
        } else {
          this.showCopyStatus("copied!", "#90ee90");
        }
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
          console.error(error);
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
      this.txStatus = undefined;
      this.updateBalance(this.account);
    },
  },
};
</script>







<style >
#copyStatus {
  margin-left: 10px;
  color: var(--copy-status-color);
}

.errorLabel {
  margin-top: -27px;
}

.fullWidth {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.fullWidth > input {
  width: 100%;
}

.invalid-feedback {
  color: red;
  text-align: left;
  margin-top: -5px;
  margin-bottom: 10px;
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
  color: lightgreen;
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