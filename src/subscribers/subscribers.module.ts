import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriberSchema } from './schema/subscriber.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
  ],
  controllers: [SubscribersController],
  providers: [SubscribersService],
})
export class SubscribersModule {}
