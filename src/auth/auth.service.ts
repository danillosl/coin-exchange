import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { CredentialsDto } from './dto/credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(WalletRepository)
    private walletRepository: WalletRepository,
    private jwtService: JwtService,
  ) {}
  async signIn(credentialsDto: CredentialsDto) {
    const wallet = await this.walletRepository.checkCredentials(credentialsDto);

    if (wallet === null) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const jwtPayload = {
      id: wallet.id,
    };
    const token = await this.jwtService.sign(jwtPayload);

    return { token };
  }
}
