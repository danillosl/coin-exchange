import { createParamDecorator } from '@nestjs/common';
import { Wallet } from 'src/wallet/wallet.entity';

export const GetWallet = createParamDecorator(
  (data, req): Wallet => {
    const wallet = req.args[0].user;
    return wallet;
  },
);
