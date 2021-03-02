# How to use the Lamden Ledger Wallet

## Prerequisites

To use the Lamden Ledger wallet you need to...
- have the Lamden App installed on your Ledger Nano S
- use the chrome browser
- enable WebHID for Chrome: Navigate to **chrome://flags** and enable **Experimental Web Platform features**<br>After Chrome version 89 is released, setting this flag should not be needed anymore.
## Important note!

If you are using the wallet for the first time it's highly recommended to try it on the testnet.<br>
Therefore you can use the <a href="https://faucet.lamden.io" style="text-decoration: none; color: lightgreen">Lamden Faucet</a> to get some free dTAU.

## Connect with your Ledger Nano S
1. Make sure your **Ledger Nano S is connected** to your computer and the **Lamden App is started**<br>
   Your Ledger Display should look like this:<br>
   <img src="ledger-waiting.jpg" width="400"/><br>

2. Click on the **Connect to Ledger** button. <br>
   For the first time chrome will ask you for connection with your Ledger Nano S. 

3. The connection process will ask you to read the public key at index #0. <br>
   <img src="ledger-public-key.jpg" width="400"/><br>
   This is the normal behaviour, because the initial key index is always #0.<br>
   After approval the Ledger will show your generated public key, **which you should compare**.<br> 
   After comparison and approval you you can now receive or send Lamden TAU on the mainnet and testnet.

   If you don't approve it, nothing happens but <span style="color: red">you won't be able to use Lamdens Ledger Wallet.</span>

## Make a Transaction
Now that you have connected successfully your Leder Nano S, you can start interacting with the Lamden Blockchain an making your first transaction.

<div style="background-color: red">
<strong>Important note:</strong><br>
Currently Ledger can only be used to store and transfer TAU.
<strong>It's not (yet) possible to interact with any thirdparty smart contracts!</strong>
</div>

You should see a form with several fields now:

| Field             | Description                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Network           | This indicates which network you are going to use for your transaction. Make sure to always double check it, before making any transaction! You can change the network by clicking on the toggle button on the upper right corner of the screen. |
| Key Index         | BIP-44 standard allows you to create multiple public/private key pairs from the same masterkey. This way, you are able to have multiple accounts, although you only have one masterkey.                                                          |
| Account           | Lamden does not distinguish between accounts and public keys. So these 64 characters is your public key. It's named as "account" because this is also the term used in Lamden's Chrome Wallet.                                                   |
| Destination       | Fill in the public key of the recipient here. Be cautious to not make any mistakes here.                                                                                                                                                         |
| Amount            | Fill in the amount of TAU you want to send                                                                                                                                                                                                       |
| Available balance | This indicates how many TAUs you have in your currently selected account.                                                                                                                                                                        |

After you filled all fields accordingly you can press the **Send** Button.
This will cause the Ledger to display all details of the transaction to be signed:

you can proceed, by pressing both buttons simultaneously. Don't worry, if you recognize a mistake.
There will be a final question at the end, which you can reject.

**Contract to interact with**<br>
<img src="ledger-contract.jpg" width="400"/><br>

**Function to execute**<br>
<img src="ledger-function.jpg" width="400"/><br>

**Amount of TAU to send**<br>
<img src="ledger-amount.jpg" width="400"/><br>

**Recipient's public key**<br>
<img src="ledger-to.jpg" width="400"/><br>

**Final Screen**<br>
After the screens mentioned above, the final screen will appear:<br>
<img src="ledger-sign.jpg" width="400"/><br>

if you approve this screen **the transaction will be sent to the Lamden Blockchain.**<br>
if you reject, nothing happens and you can correct the mistake and try again.

## Transaction Status
After making a transaction the Wallet will show the Link to your Transaction (in Lamden's Block-Explorer)<br>
You will also see a quick result if the transaction was successful or if it failed.

<br><br><br><br><br><br><br><br><br><br>
