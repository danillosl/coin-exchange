import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm-config';
import { WalletModule } from './wallet/wallet.module';
import { StellarModule } from './stellar/stellar.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), WalletModule, StellarModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
