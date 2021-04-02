<template>
  <div>
    <button @click="isModalVisible = true">Connect to Ledger</button>
  </div>
  <div class="error" v-if="errorMsg != null">
    <p>Error: {{ errorMsg }}</p>
  </div>
  <div v-if="ledgerApprovalPending">
    <p>Please approve on your ledger to continue...</p>
  </div>

  <Modal
    v-if="isModalVisible"
    :options="{
      transition: true,
      closeClickDimmed: false,
      closeKeyCode: false,
      styleModal: { color: 'black' },
    }"
  >
    <div class="modal">
      <h2>Terms of Service</h2>
      <br />
      <div>
        <div class="inline-container">
          <label class="checkbox-container"
            >I have read and agree to the
            <a href="/terms" target="_blank">Terms of Service</a>
            <input type="checkbox" v-model="termsAccepted" />
            <span class="checkmark"></span>
          </label>
        </div>
      </div>

      <div class="button-container">
        <button
          style="background-color: rgb(163, 163, 163)"
          @click="isModalVisible = false"
        >
          Cancel
        </button>
        <button
          :disabled="!allAccepted"
          @click="
            isModalVisible = false;
            readPublicKey();
          "
        >
          Continue
        </button>
      </div>
    </div>
  </Modal>
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
      termsAccepted: false,
      isModalVisible: false,
    };
  },
  computed: {
    allAccepted: function () {
      return this.termsAccepted;
    },
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
.modal {
  width: 500px;
  padding: 30px;
  box-sizing: border-box;
  background-color: #fff;
  font-size: 16px;
  text-align: center;
  margin-top: -100px;
}

.modal h2 {
  margin: 0;
}

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

button:disabled {
  background-color: rgba(158, 20, 121, 0.2);
  cursor: not-allowed;
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

/* Checkbox */
.checkbox-container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;

  border-radius: 15px;
}

/* On mouse-over, add a grey background color */
.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.checkbox-container input:checked ~ .checkmark {
  background-color: rgb(158, 20, 121);
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.checkbox-container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.button-container {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.inline-container {
  display: flex;
  justify-content: flex-start;
  margin-left: 50px;
}
</style>

<style>
.vue-universal-modal:focus {
  outline: 0 !important;
}
</style>