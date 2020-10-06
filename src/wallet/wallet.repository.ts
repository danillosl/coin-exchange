import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './wallet.entity';
import * as bcrypt from 'bcrypt';
import { Keypair } from 'stellar-sdk';
import { CredentialsDto } from 'src/auth/dto/credentials.dto';

@EntityRepository(Wallet)
export class WalletRepository extends Repository<Wallet> {
  async createWallet(
    createWalletDto: CreateWalletDto,
    keypair: Keypair,
  ): Promise<Wallet> {
    const { email, name, password } = createWalletDto;

    const wallet = this.create();
    wallet.email = email;
    wallet.name = name;
    wallet.stellarAccount = keypair.publicKey();
    wallet.secret = keypair.secret();
    wallet.password = await bcrypt.hash(password, 10);
    try {
      await wallet.save();
      delete wallet.password;
      delete wallet.secret;
      return wallet;
    } catch (error) {
      console.error(error);
      if (error.code.toString() === '23505') {
        throw new ConflictException('Endereço de email já está em uso');
      } else {
        throw new InternalServerErrorException(
          'Erro ao salvar a o Wallet no banco de dados',
        );
      }
    }
  }
  async checkCredentials(credentialsDto: CredentialsDto): Promise<Wallet> {
    const { email, password } = credentialsDto;
    const wallet = await this.findOne({ email });

    if (wallet && (await wallet.checkPassword(password))) {
      return wallet;
    } else {
      return null;
    }
  }
}
