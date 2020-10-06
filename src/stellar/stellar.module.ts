import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/common/';
import { StellarService } from './stellar.service';

@Module({
  imports: [HttpModule],
  providers: [StellarService],
  exports: [StellarService],
})
export class StellarModule {}
