// imports
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const btnConnect = document.getElementsByClassName("btn-connect")
const btnFund = document.getElementById("btn-fund")
const btnBalance = document.getElementById("btn-balance")
const btnWithdraw = document.getElementById("btn-withdraw")
const btnShowDonate = document.getElementById("btn-show-donate")
const divDonateEth = document.getElementById("div-donate-eth")
const inputEthAmount = document.getElementById("input-eth-amount")
const alertDanger = document.getElementsByClassName("alert-danger")[0]
const alertSuccess = document.getElementsByClassName("alert-success")[0]

// connect metamask
const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum
            .request({ method: "eth_requestAccounts" })
            .then(() => {
                btnConnect[0].innerHTML = "Connected"

                btnConnect[1].innerHTML = "Connected"
            })
            .catch((error) => {
                console.log(error.message)
                btnConnect[0].innerHTML = error.message

                document.getElementsByClassName(
                    "alert-danger"
                )[0].style.display = "block"
            })
    } else {
        alertDanger.innerHTML = "Please install metamask"
        alertDanger.style.display = "block"
        setTimeout(() => {
            alertDanger.style.display = "none"
        }, 10000)
    }
}

// show donation div
const showDonationDiv = () => {
    // show the donation form
    if (typeof window.ethereum !== "undefined") {
        divDonateEth.style.display = "flex"
    }
}

// fund function
async function fund() {
    const ethAmount = inputEthAmount.value
    if (
        ethAmount === "" ||
        ethAmount === null ||
        ethAmount === undefined ||
        parseFloat(ethAmount) <= 0.0
    ) {
        alertDanger.innerHTML = "Please enter a valid ETH!"
        alertDanger.style.display = "block"
        setTimeout(() => {
            alertDanger.style.display = "none"
        }, 10000)
        return
    }

    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet / someone with some gas
        // contract that we are interacting with (ˆABI & Address)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            // hey wait for this TX to finish
            await listenForTransactionMine(transactionResponse, provider)

            //hide the donate div
            divDonateEth.style.display = "none"
            alertSuccess.innerHTML =
                "Thank you for donating " + ethAmount + " ETH! 🥳🎉👍🙏"
            alertSuccess.style.display = "block"
        } catch (error) {
            alertDanger.innerHTML = error.message
            alertDanger.style.display = "block"
            setTimeout(() => {
                alertDanger.style.display = "none"
            }, 10000)
        }
    }
}

const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}`)

    return new Promise((resolve, reject) => {
        // listen for this transaction to finish
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmation`
            )
            resolve()
        })
    })
}

// withdraw
const withdraw = async () => {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)

            alertSuccess.innerHTML = "Your withdrawal was successful!"
            alertSuccess.style.display = "block"
            alertDanger.style.display = "none"
        } catch (error) {
            alertDanger.innerHTML = error.message
            alertDanger.style.display = "block"
            setTimeout(() => {
                alertDanger.style.display = "none"
            }, 10000)
        }
    }
}

// balance
const getBalance = async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const balance = await provider.getBalance(contractAddress)
            alertSuccess.innerHTML =
                "Your Wallet balance is " +
                "<b>" +
                ethers.utils.formatEther(balance) +
                " ETH! </b>"
            alertSuccess.style.display = "block"
        } catch (error) {
            alertDanger.innerHTML = error.message
            alertDanger.style.display = "block"
            setTimeout(() => {
                alertDanger.style.display = "none"
            }, 10000)
        }
    }
}

// on click event
btnConnect[0].onclick = connect
btnConnect[1].onclick = connect
btnShowDonate.onclick = showDonationDiv
btnFund.onclick = fund
btnWithdraw.onclick = withdraw
btnBalance.onclick = getBalance
