import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PayDto } from 'src/wallet/dto/pay.dto';
import { Wallet } from 'src/wallet/wallet.entity';
import * as stellar from 'stellar-sdk';
import {
  Keypair,
  Operation,
  Server,
  Networks,
  TransactionBuilder,
  Asset,
} from 'stellar-sdk';

@Injectable()
export class StellarService {
  private provisionerKeyPair: Keypair;
  private distributionKeyPair: Keypair;
  private readonly server: Server;
  private readonly creditoImperial: stellar.Asset;
  constructor() {
    this.server = new Server('https://horizon-testnet.stellar.org');

    this.provisionerKeyPair = Keypair.fromSecret(
      'SDFGFQLSPHGIZKAPTRQK36CTWRVI4TSPOPKG7KS3I4ZC2L5MRD6ESSCU',
    );

    this.distributionKeyPair = Keypair.fromSecret(
      'SABSRSXVYC4UVLTFOEBLBYCVWF4YHGQPUT5LPBQZHPVXKVV3EROW7KH3',
    );

    this.creditoImperial = new Asset(
      'CredImp',
      this.provisionerKeyPair.publicKey(),
    );
  }

  async getBalance(wallet: Wallet) {
    const account = await this.server.loadAccount(wallet.stellarAccount);
    return account.balances;
  }

  async pay(payer: Wallet, receiver: Wallet, amount: string) {
    try {
      const payerKeypair: Keypair = Keypair.fromSecret(payer.secret);
      const receiverKeypair: Keypair = Keypair.fromSecret(receiver.secret);

      const payerAccount = await this.server.loadAccount(
        payerKeypair.publicKey(),
      );

      if (
        +payerAccount.balances.find((p: any) => p.asset_code === 'CredImp')
          .balance < +amount
      ) {
        throw new InternalServerErrorException('Saldo insuficiente');
      }

      const transaction = new TransactionBuilder(payerAccount, {
        fee: stellar.BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: receiverKeypair.publicKey(),
            asset: this.creditoImperial,
            amount,
          }),
        )
        .setTimeout(180)
        .build();

      transaction.sign(payerKeypair);
      this.server.submitTransaction(transaction);
    } catch (error) {
      console.log(error.response.data);
    }
  }

  async createStellarAccount(): Promise<Keypair> {
    try {
      const keypair: Keypair = stellar.Keypair.random();

      console.log('creating account in ledger', keypair.publicKey());

      const provisionerAccount = await this.server.loadAccount(
        this.provisionerKeyPair.publicKey(),
      );

      const transaction = new TransactionBuilder(provisionerAccount, {
        fee: stellar.BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.createAccount({
            destination: keypair.publicKey(),
            startingBalance: '10',
          }),
        )
        .setTimeout(180)
        .build();
      transaction.sign(this.provisionerKeyPair);
      await this.server.submitTransaction(transaction);

      await this.createTrustline(keypair);
      await this.transferDefaultAmount(keypair);
      return keypair;
    } catch (error) {
      console.log(error.response.data);
    }
  }

  private async createTrustline(receiverKeypair: Keypair) {
    const receiverAccount = await this.server.loadAccount(
      receiverKeypair.publicKey(),
    );

    const transaction = new TransactionBuilder(receiverAccount, {
      fee: stellar.BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: this.creditoImperial,
        }),
      )
      .setTimeout(180)
      .build();
    transaction.sign(receiverKeypair);
    await this.server.submitTransaction(transaction);
  }

  private async transferDefaultAmount(receiverKeypair: Keypair) {
    const distributionAccount = await this.server.loadAccount(
      this.distributionKeyPair.publicKey(),
    );

    const transaction = new TransactionBuilder(distributionAccount, {
      fee: stellar.BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: receiverKeypair.publicKey(),
          asset: this.creditoImperial,
          amount: '5000',
        }),
      )
      .setTimeout(180)
      .build();
    transaction.sign(this.distributionKeyPair);
    await this.server.submitTransaction(transaction);
  }
}
