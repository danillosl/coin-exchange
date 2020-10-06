import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';
import { GetWallet } from '../auth/get-wallet.decorator';
import { AuthGuard } from '@nestjs/passport';
import { PayDto } from './dto/pay.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createUser(@Body() createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = await this.walletService.createWallet(createWalletDto);
    return wallet;
  }

  @Post('/pay')
  @UseGuards(AuthGuard())
  async pay(@GetWallet() payerWallet: Wallet, @Body() payDto: PayDto) {
    await this.walletService.pay(payerWallet, payDto);
    return { message: 'payment succeed!' };
  }

  @Get('/balance')
  @UseGuards(AuthGuard())
  async getBalance(@GetWallet() wallet) {
    return await this.walletService.getBalance(wallet);
  }
}
