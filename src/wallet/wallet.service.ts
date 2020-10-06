import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StellarService } from 'src/stellar/stellar.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { PayDto } from './dto/pay.dto';
import { Wallet } from './wallet.entity';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletRepository)
    private readonly walletRepository: WalletRepository,
    private readonly stellarSesrvice: StellarService,
  ) {}

  async createWallet(createWalletDTO: CreateWalletDto): Promise<Wallet> {
    const keypair = await this.stellarSesrvice.createStellarAccount();
    return this.walletRepository.createWallet(createWalletDTO, keypair);
  }

  async getBalance(wallet: Wallet) {
    return await this.stellarSesrvice.getBalance(wallet);
  }
  async pay(payerWallet: Wallet, payDto: PayDto) {
    const { email, ammount } = payDto;
    const receiver: Wallet = await this.walletRepository.findOne({
      email,
    });
    this.stellarSesrvice.pay(payerWallet, receiver, ammount);
  }
}
