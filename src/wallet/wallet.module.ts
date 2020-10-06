import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StellarModule } from 'src/stellar/stellar.module';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    StellarModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
